import { redirect } from 'next/navigation'
import { Box, Typography } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { PriceQueryStats } from '@/components/admin/PriceQueryStats'

export default async function PriceQueryStatsPage() {
  const user = await getUserAndRole()

  // SADECE ADMIN ERİŞEBİLİR
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
          📊 Fiyat Sorgulama Analizi
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Bayilerin ve kullanıcıların fiyat sorgulama davranışlarını takip edin
        </Typography>

        <PriceQueryStats showHeader={false} />
      </Box>
    </AdminLayout>
  )
}
