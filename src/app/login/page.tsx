'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = supabaseBrowser()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Giriş başarısız. E-posta ve şifrenizi kontrol edin.')
        setLoading(false)
        return
      }

      if (data.session) {
        // Kullanıcı rolünü kontrol et
        const { data: userTenant } = await supabase
          .from('user_tenants')
          .select('role')
          .eq('user_id', data.session.user.id)
          .single()

        if (userTenant?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0C0B1B 0%, #002C51 50%, #025691 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="sm">
        <Card 
          sx={{ 
            width: '100%', 
            maxWidth: 450,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(26, 25, 39, 0.95)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo Box */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
                mx: 'auto',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(2, 86, 145, 0.4)',
              }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                DG
              </Typography>
            </Box>

            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {process.env.NEXT_PUBLIC_APP_NAME || 'DostGlass'}
            </Typography>
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                mb: 4, 
                color: '#8B929C',
                fontWeight: 500,
              }}
            >
              Kurumsal Portal Girişi
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
                  boxShadow: '0 4px 15px rgba(2, 86, 145, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0373C4 0%, #025691 100%)',
                    boxShadow: '0 6px 20px rgba(2, 86, 145, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#8B929C',
                  },
                }}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

