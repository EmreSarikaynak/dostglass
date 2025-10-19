import { Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { AdminLayout } from '@/components/AdminLayout'
import { getUserAndRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AnnouncementsListClient } from './AnnouncementsListClient'

export const metadata = {
  title: 'Duyurular | DostGlass',
}

export default async function AnnouncementsListPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminLayout
      userEmail={user.email}
      tenantName={user.tenantName}
    >
      <Box sx={{ p: 3 }}>
        <Suspense fallback={<CircularProgress />}>
          <AnnouncementsListClient userRole={user.role} />
        </Suspense>
      </Box>
    </AdminLayout>
  )
}

