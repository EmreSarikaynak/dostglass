import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

// GET - Cam fiyatlarını listele
export async function GET(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleBrandId = searchParams.get('vehicle_brand_id')
    const vehicleModelId = searchParams.get('vehicle_model_id')
    const glassPositionId = searchParams.get('glass_position_id')
    const category = searchParams.get('category')
    const supplier = searchParams.get('supplier')
    const search = searchParams.get('search')
    const detailed = searchParams.get('detailed') === 'true'

    const supabase = getSupabaseAdmin()
    
    // Detaylı view mi yoksa normal tablo mu?
    const tableName = detailed ? 'glass_prices_detailed' : 'glass_prices'
    
    let query = supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', user.tenantId)
      .order('created_at', { ascending: false })

    // Filtreler
    if (vehicleBrandId) query = query.eq('vehicle_brand_id', vehicleBrandId)
    if (vehicleModelId) query = query.eq('vehicle_model_id', vehicleModelId)
    if (glassPositionId) query = query.eq('glass_position_id', glassPositionId)
    if (category) query = query.eq('category', category)
    if (supplier) query = query.eq('supplier', supplier)
    
    // Arama (full-text search)
    if (search) {
      query = query.or(`stock_name.ilike.%${search}%,product_code.ilike.%${search}%,features.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Cam fiyatları yükleme hatası:', error)
      return NextResponse.json({ error: 'Veriler yüklenemedi' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni cam fiyatı ekle
export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('glass_prices')
      .insert({
        ...body,
        tenant_id: user.tenantId,
        created_by: user.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Cam fiyatı ekleme hatası:', error)
      return NextResponse.json({ error: 'Eklenemedi' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
