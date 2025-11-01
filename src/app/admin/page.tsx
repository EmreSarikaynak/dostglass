import { redirect } from 'next/navigation'
import { Box, Typography } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function AdminPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Hoş Geldiniz, {user.tenantName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sistem özeti ve detaylı analiz
        </Typography>

        <DashboardClient />
      </Box>
    </AdminLayout>
  )
}
