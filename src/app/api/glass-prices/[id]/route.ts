import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

// GET - Tek cam fiyatını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('glass_prices_detailed')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', user.tenantId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Cam fiyatını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const updateData = body.item || body // { item: {...} } veya direkt {...} formatını destekle
    
    console.log('🔄 PUT isteği alındı:', { id, updateData })
    
    const supabase = getSupabaseAdmin()

    // View'den gelen ek alanları temizle
    const allowedFields = [
      'product_code', 'stock_name', 'supplier', 'category', 'position_text',
      'features', 'price_colorless', 'price_colored', 'price_double_color',
      'thickness_mm', 'width_mm', 'height_mm', 'area_m2', 'hole_info',
      'has_camera', 'has_sensor', 'is_encapsulated', 'is_active',
      'vehicle_brand_id', 'vehicle_model_id'
    ]
    
    const cleanedData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key]
        return obj
      }, {})

    console.log('✅ Temizlenmiş veri:', cleanedData)

    const { data, error } = await supabase
      .from('glass_prices')
      .update(cleanedData)
      .eq('id', id)
      .eq('tenant_id', user.tenantId)
      .select()
      .single()

    if (error) {
      console.error('❌ Güncelleme hatası:', error)
      return NextResponse.json({ 
        error: 'Güncellenemedi', 
        details: error.message,
        hint: error.hint 
      }, { status: 500 })
    }

    console.log('✅ Güncelleme başarılı:', data)
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('❌ API hatası:', error)
    return NextResponse.json({ 
      error: 'Sunucu hatası', 
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE - Cam fiyatını sil (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('glass_prices')
      .update({ is_active: false })
      .eq('id', id)
      .eq('tenant_id', user.tenantId)

    if (error) {
      console.error('Silme hatası:', error)
      return NextResponse.json({ error: 'Silinemedi' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

