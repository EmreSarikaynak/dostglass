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

  // Bayi bilgileri
  const [companyName, setCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [iban, setIban] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      interface RequestBody {
        email: string
        password: string
        role: 'admin' | 'bayi'
        tenantName: string
        dealerInfo?: {
          companyName: string
          contactPerson: string
          phone: string
          mobile: string
          email: string
          address: string
          city: string
          district: string
          postalCode: string
          taxOffice: string
          taxNumber: string
          iban: string
          notes: string
        }
      }

      const requestBody: RequestBody = {
        email,
        password,
        role,
        tenantName,
      }

      // Eğer bayi ise ek bilgileri ekle
      if (role === 'bayi') {
        requestBody.dealerInfo = {
          companyName,
          contactPerson,
          phone,
          mobile,
          email,
          address,
          city,
          district,
          postalCode,
          taxOffice,
          taxNumber,
          iban,
          notes,
        }
      }

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
      // Bayi bilgilerini temizle
      setCompanyName('')
      setContactPerson('')
      setPhone('')
      setMobile('')
      setAddress('')
      setCity('')
      setDistrict('')
      setPostalCode('')
      setTaxOffice('')
      setTaxNumber('')
      setIban('')
      setNotes('')
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

              {/* Bayi ise ek bilgiler */}
              {role === 'bayi' && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Bayi Bilgileri
                  </Typography>

                  <TextField
                    fullWidth
                    label="Firma Adı *"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={role === 'bayi'}
                  />

                  <TextField
                    fullWidth
                    label="Yetkili Kişi"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0212 123 45 67"
                    />
                    <TextField
                      fullWidth
                      label="Mobil"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="0532 123 45 67"
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Adres"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    multiline
                    rows={2}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="İl"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="İlçe"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                    <TextField
                      label="Posta Kodu"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      sx={{ width: { xs: '100%', sm: '150px' } }}
                    />
                  </Stack>

                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Fatura Bilgileri
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Vergi Dairesi *"
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      required={role === 'bayi'}
                    />
                    <TextField
                      fullWidth
                      label="Vergi Numarası *"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      required={role === 'bayi'}
                      placeholder="1234567890"
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="IBAN"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />

                  <TextField
                    fullWidth
                    label="Notlar"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Ek bilgiler..."
                  />
                </>
              )}

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

