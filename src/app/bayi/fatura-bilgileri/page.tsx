import { redirect } from 'next/navigation'
import { Box, Paper, Typography } from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { getSystemSettings } from '@/lib/getSystemSettings'

export default async function FaturaBilgileriPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'bayi') {
    redirect('/')
  }

  const settings = await getSystemSettings()

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Fatura Bilgileri
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Güncel fatura ve ticari bilgileriniz aşağıda listelenmiştir.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Şirket Adı
              </Typography>
              <Typography variant="body1">{settings.company_name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Vergi Dairesi
              </Typography>
              <Typography variant="body1">{settings.company_tax_office || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Vergi Numarası
              </Typography>
              <Typography variant="body1">{settings.company_tax_number || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Telefon
              </Typography>
              <Typography variant="body1">{settings.company_phone || settings.company_mobile || '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Adres
              </Typography>
              <Typography variant="body1">{settings.company_address || '-'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </AdminLayout>
  )
}
