import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

// GET - Tüm ihbarları listele
export async function GET(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('claims')
      .select(`
        *,
        insurance_companies(name),
        incident_types(name),
        damage_types(name),
        insured_types(name),
        vehicle_brands(name),
        vehicle_models(name),
        claim_items(count)
      `, { count: 'exact' })
      .eq('tenant_id', user.tenantId)
      .order('created_at', { ascending: false })

    if (user.role === 'bayi') {
      query = query.eq('created_by', user.userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('İhbar listesi hatası:', error)
      return NextResponse.json({ error: 'İhbarlar getirilemedi' }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni ihbar oluştur
export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📥 İhbar kaydı isteği alındı:', {
      claim: body.claim ? 'var' : 'yok',
      items: body.items ? `${body.items.length} adet` : 'yok'
    })

    const supabase = getSupabaseAdmin()

    // İhbar verilerini hazırla
    const claimData = {
      ...body.claim,
      tenant_id: user.tenantId,
      created_by: user.userId,  // ✅ user.id yerine user.userId
      status: body.claim?.status || 'draft'
    }

    console.log('📝 İhbar verisi hazırlandı:', claimData)

    // İhbarı oluştur
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert(claimData)
      .select()
      .single()

    if (claimError) {
      console.error('❌ İhbar oluşturma hatası:', claimError)
      return NextResponse.json({ 
        error: claimError.message,
        details: claimError
      }, { status: 500 })
    }

    console.log('✅ İhbar oluşturuldu:', claim.id)

    // Cam kalemlerini ekle
    if (body.items && body.items.length > 0) {
      const items = body.items.map((item: any) => ({
        ...item,
        claim_id: claim.id,
        id: undefined // ID'yi temizle
      }))

      console.log('📦 Cam kalemleri ekleniyor:', items.length, 'adet')

      const { error: itemsError } = await supabase
        .from('claim_items')
        .insert(items)

      if (itemsError) {
        console.error('❌ Cam kalemleri ekleme hatası:', itemsError)
        // İhbarı sil ve hata döndür
        await supabase.from('claims').delete().eq('id', claim.id)
        return NextResponse.json({ 
          error: 'Cam kalemleri eklenemedi',
          details: itemsError
        }, { status: 500 })
      }

      console.log('✅ Cam kalemleri eklendi')
    }

    // İhbar ile birlikte kalemlerini de getir
    const { data: fullClaim } = await supabase
      .from('claims')
      .select(`
        *,
        claim_items(*)
      `)
      .eq('id', claim.id)
      .single()

    console.log('✅ İhbar başarıyla kaydedildi:', fullClaim?.id)

    return NextResponse.json({ data: fullClaim }, { status: 201 })
  } catch (error) {
    console.error('❌ API hatası:', error)
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 })
  }
}
