import { redirect } from 'next/navigation'
import { Box } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { PriceQueryClient } from '@/components/price-query/PriceQueryClient'

export default async function FiyatHesaplamaPage() {
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
        <PriceQueryClient />
      </Box>
    </AdminLayout>
  )
}
