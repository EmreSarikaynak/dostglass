import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

// GET - Tek ihbar detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        insurance_companies(id, name, code),
        incident_types(id, name),
        damage_types(id, name),
        insured_types(id, name),
        license_classes(id, name),
        vehicle_categories(id, name),
        vehicle_brands(id, name),
        vehicle_models(id, name),
        vehicle_usage_types(id, name),
        claim_items(
          *,
          glass_positions(id, name),
          glass_types:vehicle_glass_types(id, name),
          glass_brands(id, name),
          glass_colors(id, name),
          glass_operations(id, name),
          installation_methods(id, name),
          service_locations(id, name)
        )
      `)
      .eq('id', id)
      .eq('tenant_id', user.tenantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'İhbar bulunamadı' }, { status: 404 })
      }
      console.error('İhbar detay hatası:', error)
      return NextResponse.json({ error: 'İhbar getirilemedi' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - İhbar güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = getSupabaseAdmin()

    // İhbarın bu tenant'a ait olduğunu kontrol et
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', user.tenantId)
      .single()

    if (!existingClaim) {
      return NextResponse.json({ error: 'İhbar bulunamadı' }, { status: 404 })
    }

    // İhbarı güncelle
    const { error: claimError } = await supabase
      .from('claims')
      .update(body.claim)
      .eq('id', id)
      .select()
      .single()

    if (claimError) {
      console.error('İhbar güncelleme hatası:', claimError)
      return NextResponse.json({ error: claimError.message }, { status: 500 })
    }

    // Cam kalemlerini güncelle
    if (body.items !== undefined) {
      // Mevcut kalemleri sil
      await supabase.from('claim_items').delete().eq('claim_id', id)

      // Yeni kalemleri ekle
      if (body.items.length > 0) {
        const items = body.items.map((item: Record<string, unknown>) => {
          const { id: _clientItemId, ...rest } = item
          void _clientItemId
          return {
            ...rest,
            claim_id: id,
          }
        })

        const { error: itemsError } = await supabase
          .from('claim_items')
          .insert(items)

        if (itemsError) {
          console.error('Cam kalemleri güncelleme hatası:', itemsError)
          return NextResponse.json({ error: 'Cam kalemleri güncellenemedi' }, { status: 500 })
        }
      }
    }

    // Güncellenmiş ihbarı getir
    const { data: fullClaim } = await supabase
      .from('claims')
      .select(`
        *,
        claim_items(*)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({ data: fullClaim })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - İhbar sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    // İhbarın bu tenant'a ait olduğunu kontrol et
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', user.tenantId)
      .single()

    if (!existingClaim) {
      return NextResponse.json({ error: 'İhbar bulunamadı' }, { status: 404 })
    }

    // İhbarı sil (cascade ile kalemler de silinecek)
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('İhbar silme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
