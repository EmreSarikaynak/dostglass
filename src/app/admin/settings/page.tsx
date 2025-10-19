import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material'
import { Settings, List } from '@mui/icons-material'
import Link from 'next/link'

export default async function SettingsPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Sistem Ayarları
        </Typography>

        <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
          <Card
            component={Link}
            href="/admin/settings-params"
            sx={{
              flex: 1,
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <List sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Parametrik Veriler
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Sigorta şirketleri, araç markaları, cam tipleri ve diğer dropdown verilerini
                yönetin.
              </Typography>
              <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                Parametreleri Yönet
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, opacity: 0.6 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Settings sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Genel Ayarlar
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Sistem genelindeki ayarları yapılandırın.
              </Typography>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }} disabled>
                Yakında
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </AdminLayout>
  )
}

