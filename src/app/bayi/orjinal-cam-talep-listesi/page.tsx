import { redirect } from 'next/navigation'
import { Box, Paper, Typography } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'

export default async function OrjinalCamTalepListesiPage() {
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
            Orijinal Cam Talep Listesi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Geçmiş talep kayıtları yakında burada listelenecek.
          </Typography>
        </Paper>
      </Box>
    </AdminLayout>
  )
}
