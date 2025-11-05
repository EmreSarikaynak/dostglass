import { redirect } from 'next/navigation'
import { Box, Paper, Typography } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'

export default async function GelenMesajlarPage() {
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
            Gelen Mesajlar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Henüz mesaj kutusu bulunmuyor. Merkezden gelen duyurular için lütfen Duyurular bölümünü takip edin.
          </Typography>
        </Paper>
      </Box>
    </AdminLayout>
  )
}
