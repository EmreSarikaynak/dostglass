import { redirect } from 'next/navigation'
import { Box, Paper, Typography } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'

export default async function YansitmaBilgileriPage() {
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
            Yansıtma Bilgileri
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Yansıtma oranları ve anlaşma koşulları kısa süre içinde bu alanda listelenecek.
          </Typography>
        </Paper>
      </Box>
    </AdminLayout>
  )
}
