import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { Box, Card, CardContent, Typography, Alert } from '@mui/material'
import { Description } from '@mui/icons-material'

export default async function PoliciesPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Poliçe Yönetimi
        </Typography>

        <Card sx={{ mt: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Description sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Sigorta Poliçeleri
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Bu bölümde tüm sigorta poliçelerini görüntüleyebilir ve yönetebilirsiniz.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Geliştirme aşamasında...
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  )
}

