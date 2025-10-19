'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { ArrowBack, PersonAdd } from '@mui/icons-material'

export function CreateUserForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'bayi'>('bayi')
  const [tenantName, setTenantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
          tenantName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Kullanıcı oluşturulurken bir hata oluştu.')
        setLoading(false)
        return
      }

      setSuccess('Kullanıcı başarıyla oluşturuldu!')
      setEmail('')
      setPassword('')
      setTenantName('')
      setRole('bayi')
      setLoading(false)

      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/admin/users')}
          variant="outlined"
        >
          Geri
        </Button>
        <Typography variant="h5" fontWeight={600}>
          Yeni Kullanıcı Oluştur
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Admin veya bayi kullanıcısı oluşturun. Girdiğiniz firma mevcut değilse otomatik
            oluşturulur.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />

              <TextField
                fullWidth
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                helperText="En az 6 karakter"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={role}
                    label="Rol"
                    onChange={(e) => setRole(e.target.value as 'admin' | 'bayi')}
                  >
                    <MenuItem value="bayi">Bayi</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Firma Adı (Tenant)"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                  helperText="Mevcut değilse oluşturulur"
                />
              </Stack>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<PersonAdd />}
              >
                {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

