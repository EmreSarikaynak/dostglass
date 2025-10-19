import { Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { AdminLayout } from '@/components/AdminLayout'
import { getUserAndRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AnnouncementDetail } from './AnnouncementDetail'

export const metadata = {
  title: 'Duyuru Detayı | DostGlass',
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
          <AnnouncementDetail id={id} />
        </Suspense>
      </Box>
    </AdminLayout>
  )
}

