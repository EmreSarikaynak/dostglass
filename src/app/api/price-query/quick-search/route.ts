import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Hızlı autocomplete araması
export async function GET(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, stock_code, vehicle, glass

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions: Array<{ type: string; value: string; label: string; id?: string }> = []

    // Stok kodu araması
    if (type === 'all' || type === 'stock_code') {
      const { data: stockCodes } = await supabase
        .from('glass_prices')
        .select('product_code, stock_name')
        .eq('is_active', true)
        .or(`product_code.ilike.%${query}%`)
        .limit(5)

      stockCodes?.forEach(item => {
        suggestions.push({
          type: 'stock_code',
          value: item.product_code,
          label: `${item.product_code} - ${item.stock_name.substring(0, 50)}...`
        })
      })
    }

    // Araç markası araması
    if (type === 'all' || type === 'vehicle') {
      const { data: brands } = await supabase
        .from('vehicle_brands')
        .select('id, name')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(5)

      brands?.forEach(item => {
        suggestions.push({
          type: 'vehicle_brand',
          value: item.name,
          label: `Marka: ${item.name}`,
          id: item.id
        })
      })
    }

    // Araç modeli araması
    if (type === 'all' || type === 'vehicle') {
      const { data: models } = await supabase
        .from('vehicle_models')
        .select(`
          id, 
          name,
          vehicle_brands!inner(name)
        `)
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(5)

      models?.forEach((item: { id: string; name: string; vehicle_brands?: Array<{ name?: string }> | { name?: string } | null }) => {
        const brandName = unwrapRelation(item.vehicle_brands)?.name || ''
        suggestions.push({
          type: 'vehicle_model',
          value: item.name,
          label: `Model: ${brandName} ${item.name}`.trim(),
          id: item.id
        })
      })
    }

    // Cam pozisyonu araması
    if (type === 'all' || type === 'glass') {
      const { data: positions } = await supabase
        .from('glass_positions')
        .select('id, name')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(5)

      positions?.forEach(item => {
        suggestions.push({
          type: 'glass_position',
          value: item.name,
          label: `Cam: ${item.name}`,
          id: item.id
        })
      })
    }

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 10) 
    })
  } catch (error) {
    console.error('Quick search error:', error)
    return NextResponse.json(
      { error: 'Arama sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

function unwrapRelation<T extends { name?: string }>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] ?? null : null
  }
  return value
}
