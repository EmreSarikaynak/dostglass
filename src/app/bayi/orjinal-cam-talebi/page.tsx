import { redirect } from 'next/navigation'
import { Box, Paper, Typography, Stack, Button } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import Link from 'next/link'

export default async function OrjinalCamTalebiPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'bayi') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Orijinal Cam Talebi Merkezi
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Bayi olarak yeni talepler oluşturabilir, mevcut taleplerinizi görüntüleyip dosya yükleyebilirsiniz.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
            <Button component={Link} href="/bayi/orjinal-cam-talebi/new" variant="contained">
              Yeni Talep Oluştur
            </Button>
            <Button component={Link} href="/bayi/orjinal-cam-talep-listesi" variant="outlined">
              Talep Listesine Git
            </Button>
          </Stack>
        </Paper>
      </Box>
    </AdminLayout>
  )
}
