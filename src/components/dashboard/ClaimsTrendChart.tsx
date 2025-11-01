'use client'

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ClaimsTrendChartProps {
  data: Array<{ date: string; count: number; label: string }>
  period: number
}

export function ClaimsTrendChart({ data, period }: ClaimsTrendChartProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
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
          İhbar Trendi (Son {period} Gün)
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
              <XAxis
                dataKey="label"
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
              <Line
                type="monotone"
                dataKey="count"
                stroke="#025691"
                strokeWidth={3}
                dot={{ fill: '#025691', r: 4 }}
                activeDot={{ r: 6, fill: '#0373C4' }}
                name="İhbar Sayısı"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

