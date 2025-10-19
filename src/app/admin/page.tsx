import { redirect } from 'next/navigation'
import { Box, Card, CardContent, Typography, Stack } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { People, Assignment, DirectionsCar, TrendingUp } from '@mui/icons-material'

export default async function AdminPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: '12',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Aktif İhbarlar',
      value: '28',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Araç Kayıtları',
      value: '156',
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Bu Ay İşlem',
      value: '47',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ]

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Hoş Geldiniz, {user.tenantName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sistem özeti ve hızlı erişim
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }} flexWrap="wrap">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                minWidth: 220,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Hızlı İşlemler
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Sol menüden istediğiniz işleme erişebilirsiniz.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Card
                  sx={{
                    flex: 1,
                    bgcolor: '#f5f5f5',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#e0e0e0' },
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" fontWeight={600}>
                      ✅ Tüm sistemler normal çalışıyor
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </AdminLayout>
  )
}
