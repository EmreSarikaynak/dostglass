'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const defaultAppName = process.env.NEXT_PUBLIC_APP_NAME || 'Dost Glass'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [siteLogoUrl, setSiteLogoUrl] = useState<string | null>(null)
  const [siteTitle, setSiteTitle] = useState(defaultAppName)

  useEffect(() => {
    let isMounted = true

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!response.ok) return
        const settings = await response.json()

        if (!isMounted) return
        if (settings?.site_logo_url) {
          setSiteLogoUrl(settings.site_logo_url)
        }
        if (settings?.site_title) {
          setSiteTitle(settings.site_title)
        }
      } catch (fetchError) {
        console.error('Ayarlar alınamadı:', fetchError)
      }
    }

    fetchSettings()
    return () => {
      isMounted = false
    }
  }, [])

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

  const normalizeSiteTitle = (title?: string | null) => {
    const fallback = 'Dost Glass'
    if (!title) return fallback
    const trimmed = title.trim()
    const normalized = trimmed
      .replace(/Dostlar\s*Glass/gi, 'Dost Glass')
      .replace(/Dost\s*Glass/gi, 'Dost Glass')
      .replace(/DostGlass/gi, 'Dost Glass')
    return normalized || fallback
  }

  const inputFieldSx = {
    mt: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 30px rgba(2, 86, 145, 0.08)',
      '& fieldset': {
        borderColor: 'rgba(2, 86, 145, 0.2)',
      },
      '&:hover fieldset': {
        borderColor: '#025691',
      },
      '&.Mui-focused': {
        boxShadow: '0 12px 35px rgba(2, 86, 145, 0.18)',
        '& fieldset': {
          borderColor: '#025691',
        },
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#025691',
    },
  }

  const currentYear = new Date().getFullYear()
  const displaySiteTitle = normalizeSiteTitle(siteTitle || defaultAppName)

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
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 0 } }}>
        <Card 
          sx={{ 
            width: '100%', 
            maxWidth: 450,
            mx: 'auto',
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(26, 25, 39, 0.95)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            mt: { xs: 4, sm: 0 },
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo Box */}
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: 260, sm: 300 },
                minHeight: 90,
                borderRadius: { xs: 2, sm: 3 },
                background: '#ffffff',
                mx: 'auto',
                mb: { xs: 2.5, sm: 3 },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(2, 86, 145, 0.2)',
                border: '1px solid rgba(2, 86, 145, 0.08)',
              }}
            >
                  {siteLogoUrl ? (
                    <Box
                      component="img"
                      src={siteLogoUrl}
                      alt={`${siteTitle} Logo`}
                  sx={{
                    width: '100%',
                    height: 60,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                  }}
                />
              ) : (
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: '#025691', 
                        fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {displaySiteTitle.slice(0, 12)}
                </Typography>
              )}
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
              {displaySiteTitle}
            </Typography>
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                mb: { xs: 2.5, sm: 4 }, 
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: '#025691' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputFieldSx}
              />
              <TextField
                fullWidth
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: '#025691' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(event) => event.preventDefault()}
                        edge="end"
                        aria-label="Şifreyi göster"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Şifrenizi görmek için gözü kullanabilirsiniz."
                sx={inputFieldSx}
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
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 3,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          © {currentYear} {siteTitle}. Tüm hakları saklıdır. Tasarım & Kodlama {' '}
          <NextLink
            href="https://secesta.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}
          >
            Secesta Software Solutions
          </NextLink>
          .
        </Typography>
      </Container>
    </Box>
  )
}
