'use client'

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, type PieLabelRenderProps } from 'recharts'

interface StatusDistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const toNumber = (value: number | string | undefined) => {
      if (typeof value === 'number') return value
      const parsed = Number(value ?? 0)
      return Number.isFinite(parsed) ? parsed : 0
    }

    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
    } = props
    const cxNumber = toNumber(cx)
    const cyNumber = toNumber(cy)
    const midAngleNumber = toNumber(midAngle)
    const innerRadiusNumber = toNumber(innerRadius)
    const outerRadiusNumber = toNumber(outerRadius)
    const percentNumber = toNumber(percent)

    const radius = innerRadiusNumber + (outerRadiusNumber - innerRadiusNumber) * 0.5
    const x = cxNumber + radius * Math.cos(-midAngleNumber * RADIAN)
    const y = cyNumber + radius * Math.sin(-midAngleNumber * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cxNumber ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percentNumber * 100).toFixed(0)}%`}
      </text>
    )
  }

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
          İhbar Durum Dağılımı
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: theme.palette.text.primary,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: '12px',
                  color: theme.palette.text.primary,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
