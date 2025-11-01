import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    
    // Arama parametreleri
    const searchTerm = searchParams.get('q') || ''
    const vehicleCategoryId = searchParams.get('vehicle_category_id') || ''
    const vehicleBrandId = searchParams.get('vehicle_brand_id') || ''
    const vehicleModelId = searchParams.get('vehicle_model_id') || ''
    const glassPositionId = searchParams.get('glass_position_id') || ''
    const glassTypeId = searchParams.get('glass_type_id') || ''
    const glassBrandId = searchParams.get('glass_brand_id') || ''
    const glassColorId = searchParams.get('glass_color_id') || ''
    const hasCamera = searchParams.get('has_camera')
    const hasSensor = searchParams.get('has_sensor')
    const isEncapsulated = searchParams.get('is_encapsulated')
    const limit = parseInt(searchParams.get('limit') || '200')

    // Query builder
    let query = supabase
      .from('glass_prices_detailed')
      .select('*')
      .eq('is_active', true)

    // Genel arama (ürün adı, stok kodu, özellikler)
    // Sadece arama terimi varsa uygula
    if (searchTerm) {
      query = query.or(
        `stock_name.ilike.%${searchTerm}%,` +
        `position_text.ilike.%${searchTerm}%,` +
        `features.ilike.%${searchTerm}%,` +
        `product_code.ilike.%${searchTerm}%,` +
        `alternative_codes.cs.{${searchTerm}}`
      )
    }

    // Araç filtreleri - bağımsız çalışır
    // NOT: glass_prices tablosunda vehicle_category_id NULL olduğu için
    // kategori seçilince o kategoriye ait markaları bulup filtreliyoruz
    if (vehicleCategoryId) {
      // Kategoriye ait markaları bul
      const { data: brandsInCategory } = await supabase
        .from('vehicle_brands')
        .select('id')
        .eq('category_id', vehicleCategoryId)
        .eq('is_active', true)
      
      const brandIds = brandsInCategory?.map(b => b.id) || []
      if (brandIds.length > 0) {
        query = query.in('vehicle_brand_id', brandIds)
      } else {
        // Kategoride hiç marka yoksa boş sonuç dön
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }
    if (vehicleBrandId) {
      query = query.eq('vehicle_brand_id', vehicleBrandId)
    }
    if (vehicleModelId) {
      query = query.eq('vehicle_model_id', vehicleModelId)
    }

    // Cam filtreleri
    if (glassPositionId) {
      query = query.eq('glass_position_id', glassPositionId)
    }
    if (glassTypeId) {
      query = query.eq('glass_type_id', glassTypeId)
    }
    if (glassBrandId) {
      query = query.eq('glass_brand_id', glassBrandId)
    }
    if (glassColorId) {
      query = query.eq('glass_color_id', glassColorId)
    }

    // Özellik filtreleri
    if (hasCamera === 'true') {
      query = query.eq('has_camera', true)
    }
    if (hasSensor === 'true') {
      query = query.eq('has_sensor', true)
    }
    if (isEncapsulated === 'true') {
      query = query.eq('is_encapsulated', true)
    }

    // Sıralama ve limit
    query = query
      .order('vehicle_brand_name', { ascending: true })
      .order('vehicle_model_name', { ascending: true })
      .order('glass_position_name', { ascending: true })
      .limit(limit)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ 
      results: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Price query search error:', error)
    return NextResponse.json(
      { error: 'Fiyat sorgulaması sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

