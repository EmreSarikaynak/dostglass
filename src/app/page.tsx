import { redirect } from 'next/navigation'
import { Box, Container, Typography, Paper } from '@mui/material'
import { getUserAndRole } from '@/lib/auth'
import { AppBar } from '@/components/AppBar'

export default async function HomePage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  // Admin ise admin paneline yönlendir
  if (user.role === 'admin') {
    redirect('/admin')
  }

  // Bayi için ana sayfa
  return (
    <Box>
      <AppBar userEmail={user.email} userName={user.tenantName} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bayi Paneli
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Hoş geldiniz, {user.tenantName}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bu sayfa bayi kullanıcıları için tasarlanmıştır.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}
