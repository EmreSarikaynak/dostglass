import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı kontrolü
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // 7 veya 30 gün
    const days = parseInt(period)

    // Son N günün tarihlerini oluştur
    const dates: string[] = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }

    // İhbar Trendleri - Son N gün
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const { data: claimsData, error: claimsError } = await supabase
      .from('claims')
      .select('created_at, status')
      .gte('created_at', periodStart.toISOString())

    if (claimsError) throw claimsError

    // Günlük ihbar sayılarını hesapla
    const claimsByDate = dates.map(date => {
      const count = claimsData?.filter(claim => 
        claim.created_at.startsWith(date)
      ).length || 0
      return { date, count, label: formatDate(date) }
    })

    // Durum Dağılımı
    const { data: statusData, error: statusError } = await supabase
      .from('claims')
      .select('status')

    if (statusError) throw statusError

    const statusMap: Record<string, number> = {
      draft: 0,
      submitted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    }

    statusData?.forEach(claim => {
      if (claim.status in statusMap) {
        statusMap[claim.status]++
      }
    })

    const statusDistribution = [
      { name: 'Taslak', value: statusMap.draft, color: '#8B929C' },
      { name: 'Gönderildi', value: statusMap.submitted, color: '#0373C4' },
      { name: 'İşlemde', value: statusMap.in_progress, color: '#025691' },
      { name: 'Tamamlandı', value: statusMap.completed, color: '#00A86B' },
      { name: 'İptal', value: statusMap.cancelled, color: '#DC3545' }
    ].filter(item => item.value > 0)

    // En Çok Kullanılan Sigorta Şirketleri
    const { data: insuranceData, error: insuranceError } = await supabase
      .from('claims')
      .select(`
        insurance_company_id,
        insurance_companies(name)
      `)
      .not('insurance_company_id', 'is', null)

    if (insuranceError) throw insuranceError

    const insuranceMap: Record<string, number> = {}
    insuranceData?.forEach((claim: { insurance_companies?: { name?: string } | null }) => {
      const name = claim.insurance_companies?.name || 'Bilinmiyor'
      insuranceMap[name] = (insuranceMap[name] || 0) + 1
    })

    const topInsuranceCompanies = Object.entries(insuranceMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Aylık İstatistikler (Son 6 ay)
    const monthlyData: Array<{month: string, claims: number, completed: number, revenue: number}> = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now)
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      // Ay içindeki ihbarlar
      const { count: monthClaims, error: monthClaimsError } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      if (monthClaimsError) throw monthClaimsError

      // Ay içinde tamamlanan ihbarlar
      const { count: monthCompleted, error: monthCompletedError } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('updated_at', monthStart.toISOString())
        .lte('updated_at', monthEnd.toISOString())

      if (monthCompletedError) throw monthCompletedError

      // Ay içindeki toplam gelir (claim_items)
      const { data: claimsForRevenue, error: claimsRevenueError } = await supabase
        .from('claims')
        .select('id')
        .eq('status', 'completed')
        .gte('updated_at', monthStart.toISOString())
        .lte('updated_at', monthEnd.toISOString())

      if (claimsRevenueError) throw claimsRevenueError

      let monthRevenue = 0
      if (claimsForRevenue && claimsForRevenue.length > 0) {
        const claimIds = claimsForRevenue.map(c => c.id)
        const { data: itemsData, error: itemsError } = await supabase
          .from('claim_items')
          .select('total_amount')
          .in('claim_id', claimIds)

        if (itemsError) throw itemsError
        monthRevenue = itemsData?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0
      }

      monthlyData.push({
        month: formatMonth(monthDate),
        claims: monthClaims || 0,
        completed: monthCompleted || 0,
        revenue: monthRevenue
      })
    }

    // En Çok İşlem Yapılan Araç Markaları
    const { data: vehicleBrandsData, error: vehicleBrandsError } = await supabase
      .from('claims')
      .select(`
        vehicle_brand_id,
        vehicle_brands(name)
      `)
      .not('vehicle_brand_id', 'is', null)

    if (vehicleBrandsError) throw vehicleBrandsError

    const brandMap: Record<string, number> = {}
    vehicleBrandsData?.forEach((claim: { vehicle_brands?: { name?: string } | null }) => {
      const name = claim.vehicle_brands?.name || 'Bilinmiyor'
      brandMap[name] = (brandMap[name] || 0) + 1
    })

    const topVehicleBrands = Object.entries(brandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    return NextResponse.json({
      claimsTrend: claimsByDate,
      statusDistribution,
      topInsuranceCompanies,
      monthlyStats: monthlyData,
      topVehicleBrands,
      period: days
    })
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json(
      { error: 'Grafik verileri yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Tarih formatlama yardımcı fonksiyonu
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth() + 1
  return `${day}/${month}`
}

// Ay formatlama yardımcı fonksiyonu
function formatMonth(date: Date): string {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

