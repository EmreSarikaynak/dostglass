'use client'

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TopListsChartProps {
  insuranceCompanies: Array<{ name: string; count: number }>
  vehicleBrands: Array<{ name: string; count: number }>
}

export function TopListsChart({ insuranceCompanies, vehicleBrands }: TopListsChartProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(2, 86, 145, 0.15)',
            height: '100%',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 3,
              }}
            >
              En Çok Kullanılan Sigorta Şirketleri
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insuranceCompanies}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                  <XAxis
                    type="number"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '12px' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '11px' }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      color: theme.palette.text.primary,
                    }}
                    labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#0373C4"
                    name="İhbar Sayısı"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(2, 86, 145, 0.15)',
            height: '100%',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 3,
              }}
            >
              En Çok İşlem Yapılan Araç Markaları
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vehicleBrands}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                  <XAxis
                    type="number"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '12px' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '11px' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      color: theme.palette.text.primary,
                    }}
                    labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#025691"
                    name="İhbar Sayısı"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
