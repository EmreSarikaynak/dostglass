import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

// İzin verilen tablolar
const ALLOWED_TABLES = [
  'insurance_companies', 'insured_types', 'cities', 'districts',
  'incident_types', 'damage_types', 'license_classes',
  'vehicle_usage_types', 'vehicle_categories', 'vehicle_brands',
  'vehicle_models', 'vehicle_glass_types', 'glass_positions',
  'glass_operations', 'glass_brands', 'glass_colors',
  'installation_methods', 'service_locations'
]

// GET - Tüm kayıtları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    
    let query = supabase.from(table).select('*').order('created_at', { ascending: false })
    
    // İlçeler için il bilgisini de getir
    if (table === 'districts') {
      query = supabase.from(table).select('*, cities(name)').order('created_at', { ascending: false })
    }
    
    // Araç markaları için kategori bilgisini getir
    if (table === 'vehicle_brands') {
      query = supabase.from(table).select('*, vehicle_categories(name)').order('created_at', { ascending: false })
    }
    
    // Araç modelleri için marka ve kategori bilgisini getir
    if (table === 'vehicle_models') {
      query = supabase.from(table).select('*, vehicle_brands(name, vehicle_categories(name))').order('created_at', { ascending: false })
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Veri getirme hatası:', error)
      return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 })
    }

    // İlişkisel verileri düzleştir (flatten)
    let processedData = data
    
    if (table === 'vehicle_brands' && data) {
      processedData = data.map((item: Record<string, unknown>) => {
        const category = item.vehicle_categories as Record<string, unknown> | null
        return {
          ...item,
          category_name: category?.name || '-',
          vehicle_categories: undefined, // nested object'i kaldır
        }
      })
    }
    
    if (table === 'vehicle_models' && data) {
      processedData = data.map((item: Record<string, unknown>) => {
        const brand = item.vehicle_brands as Record<string, unknown> | null
        const category = brand?.vehicle_categories as Record<string, unknown> | null
        return {
          ...item,
          brand_name: brand?.name || '-',
          category_name: category?.name || '-',
          vehicle_brands: undefined, // nested object'i kaldır
        }
      })
    }

    return NextResponse.json({ data: processedData })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni kayıt ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    // Admin kontrolü
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { table } = await params
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })
    }

    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Ekleme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Kayıt güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { table } = await params
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Güncelleme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Kayıt sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { table } = await params
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Silme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

