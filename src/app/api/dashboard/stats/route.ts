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
    const period = searchParams.get('period') || '30' // 7, 30, veya 'all'

    // Tarih hesaplamaları
    const now = new Date()
    const periodStart = period === 'all' 
      ? new Date('2020-01-01') 
      : new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)
    
    const previousPeriodStart = period === 'all'
      ? new Date('2020-01-01')
      : new Date(periodStart.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Toplam Kullanıcı Sayısı
    const { count: totalUsers, error: usersError } = await supabase
      .from('user_tenants')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    // Yeni Kullanıcılar (Son Dönem)
    const { data: newUsersData, error: newUsersError } = await supabase
      .from('user_tenants')
      .select('user_id')
      .gte('created_at', periodStart.toISOString())

    if (newUsersError) throw newUsersError

    // Önceki Dönem Kullanıcılar
    const { data: prevNewUsersData, error: prevNewUsersError } = await supabase
      .from('user_tenants')
      .select('user_id')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString())

    if (prevNewUsersError) throw prevNewUsersError

    // Aktif İhbarlar (draft, submitted, in_progress)
    const { count: activeClaims, error: activeClaimsError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'submitted', 'in_progress'])

    if (activeClaimsError) throw activeClaimsError

    // Bu Dönem İhbarlar
    const { count: periodClaims, error: periodClaimsError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString())

    if (periodClaimsError) throw periodClaimsError

    // Önceki Dönem İhbarlar
    const { count: prevPeriodClaims, error: prevPeriodClaimsError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString())

    if (prevPeriodClaimsError) throw prevPeriodClaimsError

    // Toplam Araç Kayıtları (unique plates)
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('claims')
      .select('vehicle_plate')
      .not('vehicle_plate', 'is', null)

    if (vehiclesError) throw vehiclesError

    const uniqueVehicles = new Set(vehiclesData.map(v => v.vehicle_plate)).size

    // Bu Dönem Araçlar
    const { data: periodVehiclesData, error: periodVehiclesError } = await supabase
      .from('claims')
      .select('vehicle_plate')
      .not('vehicle_plate', 'is', null)
      .gte('created_at', periodStart.toISOString())

    if (periodVehiclesError) throw periodVehiclesError

    const periodUniqueVehicles = new Set(periodVehiclesData.map(v => v.vehicle_plate)).size

    // Önceki Dönem Araçlar
    const { data: prevPeriodVehiclesData, error: prevPeriodVehiclesError } = await supabase
      .from('claims')
      .select('vehicle_plate')
      .not('vehicle_plate', 'is', null)
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString())

    if (prevPeriodVehiclesError) throw prevPeriodVehiclesError

    const prevPeriodUniqueVehicles = new Set(prevPeriodVehiclesData.map(v => v.vehicle_plate)).size

    // Tamamlanan İşlemler
    const { count: completedClaims, error: completedError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('updated_at', periodStart.toISOString())

    if (completedError) throw completedError

    // Önceki Dönem Tamamlanan
    const { count: prevCompletedClaims, error: prevCompletedError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('updated_at', previousPeriodStart.toISOString())
      .lt('updated_at', periodStart.toISOString())

    if (prevCompletedError) throw prevCompletedError

    // Değişim yüzdelerini hesapla
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return NextResponse.json({
      stats: {
        totalUsers: {
          value: totalUsers || 0,
          change: calculateChange(newUsersData?.length || 0, prevNewUsersData?.length || 0),
          new: newUsersData?.length || 0
        },
        activeClaims: {
          value: activeClaims || 0,
          change: calculateChange(periodClaims || 0, prevPeriodClaims || 0),
          period: periodClaims || 0
        },
        vehicles: {
          value: uniqueVehicles,
          change: calculateChange(periodUniqueVehicles, prevPeriodUniqueVehicles),
          period: periodUniqueVehicles
        },
        completedClaims: {
          value: completedClaims || 0,
          change: calculateChange(completedClaims || 0, prevCompletedClaims || 0),
          period: completedClaims || 0
        }
      },
      period: parseInt(period)
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

