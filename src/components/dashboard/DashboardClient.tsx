'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import {
  People,
  Assignment,
  DirectionsCar,
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material'
import { ClaimsTrendChart } from './ClaimsTrendChart'
import { StatusDistributionChart } from './StatusDistributionChart'
import { MonthlyStatsChart } from './MonthlyStatsChart'
import { TopListsChart } from './TopListsChart'

interface StatData {
  value: number
  change: number
  period?: number
  new?: number
}

interface DashboardStats {
  totalUsers: StatData
  activeClaims: StatData
  vehicles: StatData
  completedClaims: StatData
}

interface ChartData {
  claimsTrend: Array<{ date: string; count: number; label: string }>
  statusDistribution: Array<{ name: string; value: number; color: string }>
  topInsuranceCompanies: Array<{ name: string; count: number }>
  monthlyStats: Array<{ month: string; claims: number; completed: number; revenue: number }>
  topVehicleBrands: Array<{ name: string; count: number }>
  period: number
}

export function DashboardClient() {
  const theme = useTheme()
  const [period, setPeriod] = useState<string>('30')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [charts, setCharts] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsResponse, chartsResponse] = await Promise.all([
        fetch(`/api/dashboard/stats?period=${period}`),
        fetch(`/api/dashboard/charts?period=${period}`),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      if (chartsResponse.ok) {
        const chartsData = await chartsResponse.json()
        setCharts(chartsData)
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handlePeriodChange = (_event: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod)
    }
  }

  const renderTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp sx={{ fontSize: 20, color: '#00A86B' }} />
    } else if (change < 0) {
      return <TrendingDown sx={{ fontSize: 20, color: '#DC3545' }} />
    } else {
      return <Remove sx={{ fontSize: 20, color: '#8B929C' }} />
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return '#00A86B'
    if (change < 0) return '#DC3545'
    return '#8B929C'
  }

  const statCards = stats
    ? [
        {
          title: 'Toplam Kullanıcı',
          value: stats.totalUsers.value.toString(),
          change: stats.totalUsers.change,
          icon: <People sx={{ fontSize: 40 }} />,
          bgGradient: 'linear-gradient(135deg, #025691 0%, #0373C4 100%)',
        },
        {
          title: 'Aktif İhbarlar',
          value: stats.activeClaims.value.toString(),
          change: stats.activeClaims.change,
          icon: <Assignment sx={{ fontSize: 40 }} />,
          bgGradient: 'linear-gradient(135deg, #002C51 0%, #004080 100%)',
        },
        {
          title: 'Araç Kayıtları',
          value: stats.vehicles.value.toString(),
          change: stats.vehicles.change,
          icon: <DirectionsCar sx={{ fontSize: 40 }} />,
          bgGradient: 'linear-gradient(135deg, #025691 0%, #002C50 100%)',
        },
        {
          title: `Son ${period} Gün Tamamlanan`,
          value: stats.completedClaims.value.toString(),
          change: stats.completedClaims.change,
          icon: <TrendingUp sx={{ fontSize: 40 }} />,
          bgGradient: 'linear-gradient(135deg, #002C50 0%, #0C0B1B 100%)',
        },
      ]
    : []

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#025691' }} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Dönem Seçici */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          aria-label="dönem seçimi"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: 2,
              px: 3,
              py: 1,
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #025691 0%, #0373C4 100%)',
                color: 'white',
                borderColor: '#025691',
                '&:hover': {
                  background: 'linear-gradient(135deg, #014070 0%, #025691 100%)',
                },
              },
            },
          }}
        >
          <ToggleButton value="7">Son 7 Gün</ToggleButton>
          <ToggleButton value="30">Son 30 Gün</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* İstatistik Kartları */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }} flexWrap="wrap">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
              minWidth: 220,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(2, 86, 145, 0.15)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(2, 86, 145, 0.25)',
                transform: 'translateY(-6px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: stat.bgGradient,
              },
            }}
          >
            <CardContent sx={{ pt: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#8B929C',
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 'bold',
                      background: stat.bgGradient,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Chip
                    icon={renderTrendIcon(stat.change)}
                    label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                    size="small"
                    sx={{
                      backgroundColor: `${getChangeColor(stat.change)}20`,
                      color: getChangeColor(stat.change),
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    background: stat.bgGradient,
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(2, 86, 145, 0.25)',
                  }}
                >
                  {stat.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Grafikler */}
      {charts && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* İhbar Trendi */}
            <Grid item xs={12} md={6}>
              <ClaimsTrendChart data={charts.claimsTrend} period={charts.period} />
            </Grid>

            {/* Durum Dağılımı */}
            <Grid item xs={12} md={6}>
              <StatusDistributionChart data={charts.statusDistribution} />
            </Grid>

            {/* Aylık İstatistikler */}
            <Grid item xs={12}>
              <MonthlyStatsChart data={charts.monthlyStats} />
            </Grid>

            {/* Top Listeler */}
            <Grid item xs={12}>
              <TopListsChart
                insuranceCompanies={charts.topInsuranceCompanies}
                vehicleBrands={charts.topVehicleBrands}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
