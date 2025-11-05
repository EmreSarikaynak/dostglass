'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import {
  TrendingUp,
  Category,
  Person,
  LocalOffer,
} from '@mui/icons-material'

interface TopProduct {
  product_code: string
  query_count: number
  stock_name: string
  vehicle_brand_name: string
  vehicle_model_name: string
  glass_position_name: string
  price_colorless: number
}

interface TopCategory {
  name: string
  count: number
}

interface TopUser {
  name: string
  count: number
}

interface StatsData {
  period_days: number
  total_searches: number
  top_products: TopProduct[]
  top_categories: TopCategory[]
  top_users: TopUser[]
}

interface PriceQueryStatsProps {
  showHeader?: boolean
}

export function PriceQueryStats({ showHeader = true }: PriceQueryStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>('30')

  useEffect(() => {
    let isActive = true

    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/price-query/stats?days=${period}`)
        if (!res.ok) {
          throw new Error('İstatistikler yüklenemedi')
        }
        const data = await res.json()
        if (isActive) {
          setStats(data)
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Hata oluştu')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      isActive = false
    }
  }, [period])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!stats) {
    return <Alert severity="info">Henüz veri yok</Alert>
  }

  const periodSelector = (
    <ToggleButtonGroup
      value={period}
      exclusive
      onChange={(_, value) => value && setPeriod(value)}
      size="small"
    >
      <ToggleButton value="7">Son 7 Gün</ToggleButton>
      <ToggleButton value="30">Son 30 Gün</ToggleButton>
      <ToggleButton value="90">Son 90 Gün</ToggleButton>
    </ToggleButtonGroup>
  )

  return (
    <Box>
      {/* Başlık ve Periyot Seçimi */}
      {showHeader ? (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            📊 Fiyat Sorgulama İstatistikleri
          </Typography>
          {periodSelector}
        </Stack>
      ) : (
        <Box display="flex" justifyContent="flex-end" mb={3}>
          {periodSelector}
        </Box>
      )}

      {/* Özet Kartlar */}
      <Box sx={{ mb: 4 }}>
        <Card elevation={3} sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TrendingUp sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  {stats.total_searches}
                </Typography>
                <Typography variant="body1">
                  Toplam Arama (Son {stats.period_days} Gün)
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* İstatistik Kartları */}
      <Stack spacing={3}>
        {/* En Çok Sorgulanan Ürünler */}
        <Card elevation={2}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <LocalOffer color="primary" />
              <Typography variant="h6" fontWeight={700}>
                🔥 En Çok Sorgulanan Ürünler
              </Typography>
            </Stack>
            {stats.top_products.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Stok Kodu</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Ürün Adı</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Araç</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Cam</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Fiyat</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Sorgu Sayısı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.top_products.map((product, index) => (
                      <TableRow key={product.product_code} hover>
                        <TableCell>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color={index === 0 ? 'error' : index === 1 ? 'warning' : index === 2 ? 'success' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary">
                            {product.product_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 250 }}>
                            {product.stock_name.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {product.vehicle_brand_name} {product.vehicle_model_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {product.glass_position_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            {formatPrice(product.price_colorless)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${product.query_count}×`} 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">Henüz ürün sorgulaması yok</Alert>
            )}
          </CardContent>
        </Card>

        {/* Alt Kartlar - 2 Kolon */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* En Çok Aranan Kategoriler */}
          <Card elevation={2} sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Category color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  📁 En Çok Aranan Kategoriler
                </Typography>
              </Stack>
              {stats.top_categories.length > 0 ? (
                <Stack spacing={2}>
                  {stats.top_categories.map((cat, index) => (
                    <Box key={index}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight={600}>
                          {cat.name}
                        </Typography>
                        <Chip label={`${cat.count} arama`} size="small" color="secondary" />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">Henüz kategori araması yok</Alert>
              )}
            </CardContent>
          </Card>

          {/* En Aktif Kullanıcılar/Bayiler */}
          <Card elevation={2} sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Person color="info" />
                <Typography variant="h6" fontWeight={700}>
                  👥 En Aktif Kullanıcılar
                </Typography>
              </Stack>
              {stats.top_users.length > 0 ? (
                <Stack spacing={2}>
                  {stats.top_users.slice(0, 5).map((user, index) => (
                    <Box key={index}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight={600}>
                          {user.name}
                        </Typography>
                        <Chip label={`${user.count} arama`} size="small" color="info" />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">Henüz kullanıcı araması yok</Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  )
}
