import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// İstatistikler - SADECE ADMIN
export async function GET(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    
    // SADECE ADMIN ERİŞEBİLİR
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim - Sadece admin' }, { status: 403 })
    }

    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    // En çok sorgulanan ürünler (product_code bazında)
    const { data: topProducts } = await supabase
      .from('price_query_logs')
      .select('selected_product_code')
      .not('selected_product_code', 'is', null)
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false })

    // Ürün kodlarını say
    const productCounts: Record<string, number> = {}
    topProducts?.forEach(log => {
      const code = log.selected_product_code
      if (code) {
        productCounts[code] = (productCounts[code] || 0) + 1
      }
    })

    // En çok aranan 10 ürün
    const topProductsList = Object.entries(productCounts)
      .map(([code, count]) => ({ product_code: code, query_count: count }))
      .sort((a, b) => b.query_count - a.query_count)
      .slice(0, 10)

    // Ürün detaylarını getir
    const productCodes = topProductsList.map(p => p.product_code)
    const { data: productDetails } = await supabase
      .from('glass_prices_detailed')
      .select('product_code, stock_name, vehicle_brand_name, vehicle_model_name, glass_position_name, price_colorless')
      .in('product_code', productCodes)
      .eq('is_active', true)

    // Detayları birleştir
    const topProductsWithDetails = topProductsList.map(item => {
      const detail = productDetails?.find(p => p.product_code === item.product_code)
      return {
        ...item,
        stock_name: detail?.stock_name || 'Bilinmiyor',
        vehicle_brand_name: detail?.vehicle_brand_name || '-',
        vehicle_model_name: detail?.vehicle_model_name || '-',
        glass_position_name: detail?.glass_position_name || '-',
        price_colorless: detail?.price_colorless || 0,
      }
    })

    // En çok aranan kategoriler
    const { data: categoryLogs } = await supabase
      .from('price_query_logs')
      .select('vehicle_category_id, vehicle_categories(name)')
      .not('vehicle_category_id', 'is', null)
      .gte('created_at', fromDate.toISOString())

    const categoryCounts: Record<string, { name: string; count: number }> = {}
    categoryLogs?.forEach((log: { vehicle_category_id: string; vehicle_categories?: Array<{ name?: string }> | { name?: string } | null }) => {
      const id = log.vehicle_category_id
      const category = unwrapRelation(log.vehicle_categories)
      const name = category?.name || 'Bilinmiyor'
      if (!categoryCounts[id]) {
        categoryCounts[id] = { name, count: 0 }
      }
      categoryCounts[id].count++
    })

    const topCategories = Object.values(categoryCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Toplam arama sayısı
    const { count: totalSearches } = await supabase
      .from('price_query_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate.toISOString())

    // Kullanıcı başına arama sayısı
    const { data: userSearches } = await supabase
      .from('price_query_logs')
      .select('user_id, tenant_id')
      .gte('created_at', fromDate.toISOString())

    // Tenant bilgilerini getir
    const { data: tenantsData } = await supabase
      .from('tenants')
      .select('id, company_name')

    const tenantMap: Record<string, string> = {}
    tenantsData?.forEach(t => {
      tenantMap[t.id] = t.company_name
    })

    const userCounts: Record<string, { name: string; count: number }> = {}
    userSearches?.forEach((log: { user_id: string; tenant_id: string }) => {
      const id = log.user_id
      const name = tenantMap[log.tenant_id] || 'Bilinmiyor'
      if (!userCounts[id]) {
        userCounts[id] = { name, count: 0 }
      }
      userCounts[id].count++
    })

    const topUsers = Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      period_days: days,
      total_searches: totalSearches || 0,
      top_products: topProductsWithDetails,
      top_categories: topCategories,
      top_users: topUsers,
    })
  } catch (error) {
    console.error('Price query stats error:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınırken hata oluştu' },
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
