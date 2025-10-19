import { Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { AdminLayout } from '@/components/AdminLayout'
import { getUserAndRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AnnouncementsClient } from './AnnouncementsClient'

export const metadata = {
  title: 'Duyurular | DostGlass',
}

export default async function AnnouncementsPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout
      userEmail={user.email}
      tenantName={user.tenantName}
    >
      <Box sx={{ p: 3 }}>
        <Suspense fallback={<CircularProgress />}>
          <AnnouncementsClient />
        </Suspense>
      </Box>
    </AdminLayout>
  )
}

