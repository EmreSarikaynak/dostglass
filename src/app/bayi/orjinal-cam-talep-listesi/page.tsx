import { redirect } from 'next/navigation'
import { Box } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { OriginalGlassRequestList } from './OriginalGlassRequestList'

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
        <OriginalGlassRequestList />
      </Box>
    </AdminLayout>
  )
}
