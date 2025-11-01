import { redirect } from 'next/navigation'
import { Box } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { PriceQueryClient } from '@/components/price-query/PriceQueryClient'

export default async function AdminPriceQueryPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <Box>
        <PriceQueryClient />
      </Box>
    </AdminLayout>
  )
}

