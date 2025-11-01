'use client'

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyStatsChartProps {
  data: Array<{
    month: string
    claims: number
    completed: number
    revenue: number
  }>
}

export function MonthlyStatsChart({ data }: MonthlyStatsChartProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(2, 86, 145, 0.15)',
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
          Aylık İstatistikler (Son 6 Ay)
        </Typography>
        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
              <XAxis
                dataKey="month"
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '12px' }}
                allowDecimals={false}
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
              <Legend
                wrapperStyle={{ 
                  fontSize: '12px',
                  color: theme.palette.text.primary,
                }}
                iconType="circle"
              />
              <Bar
                dataKey="claims"
                fill="#025691"
                name="Toplam İhbar"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="completed"
                fill="#00A86B"
                name="Tamamlanan"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

