'use client'

import { useState, useEffect } from 'react'
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
  Grid,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { ArrowBack, PersonAdd } from '@mui/icons-material'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface City {
  id: string
  name: string
  plate_code: string
}

interface District {
  id: string
  name: string
  city_id: string
}

export function CreateUserForm() {
  const router = useRouter()
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'bayi'>('bayi')
  const [tenantName, setTenantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // İl ve İlçe state'leri
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)

  // Bayi bilgileri
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('AĞRI') // Varsayılan olarak AĞRI
  const [district, setDistrict] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [iban, setIban] = useState('')
  const [notes, setNotes] = useState('')

  // İlleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (!error && data) {
        setCities(data)
        
        // Varsayılan olarak AĞRI'yı seç
        const agriCity = data.find(c => c.name === 'AĞRI')
        if (agriCity) {
          setSelectedCityId(agriCity.id)
        }
      }
    }

    fetchCities()
  }, [])

  // İl seçildiğinde ilçeleri yükle
  useEffect(() => {
    if (selectedCityId) {
      const fetchDistricts = async () => {
        const { data, error } = await supabase
          .from('districts')
          .select('*')
          .eq('city_id', selectedCityId)
          .eq('is_active', true)
          .order('name')
        
        if (!error && data) {
          setDistricts(data)
        }
      }

      fetchDistricts()
      // İl değiştiğinde ilçeyi sıfırla
      setDistrict('')
    } else {
      setDistricts([])
      setDistrict('')
    }
  }, [selectedCityId])

  // İl değiştiğinde
  const handleCityChange = (cityName: string) => {
    setCity(cityName)
    const selectedCity = cities.find(city => city.name === cityName)
    setSelectedCityId(selectedCity ? selectedCity.id : null)
  }

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
          companyName: tenantName, // Firma adı tenant adı ile aynı
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

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
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
              {/* Kullanıcı Hesap Bilgileri */}
              <Typography variant="h6" color="primary" fontWeight={600}>
                Kullanıcı Hesap Bilgileri
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="E-posta *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Şifre *"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    helperText="En az 6 karakter"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Rol *</InputLabel>
                    <Select
                      value={role}
                      label="Rol *"
                      onChange={(e) => setRole(e.target.value as 'admin' | 'bayi')}
                    >
                      <MenuItem value="bayi">Bayi</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Firma Adı (Tenant) *"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                    helperText="Mevcut değilse oluşturulur"
                  />
                </Grid>
              </Grid>

              {/* Bayi Firma Detayları */}
              {role === 'bayi' && (
                <>
                  <Typography variant="h6" color="primary" fontWeight={600} sx={{ mt: 3 }}>
                    Bayi Firma Detayları
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Satır 1: Yetkili Kişi - Telefon */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Yetkili Kişi"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Telefon"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0212 123 45 67"
                      />
                    </Grid>

                    {/* Satır 2: Mobil - Posta Kodu */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Mobil"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="0532 123 45 67"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Posta Kodu"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </Grid>

                    {/* Satır 3: İl - İlçe */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>İl</InputLabel>
                        <Select
                          value={city}
                          label="İl"
                          onChange={(e) => handleCityChange(e.target.value)}
                        >
                          <MenuItem value="">
                            <em>İl Seçiniz</em>
                          </MenuItem>
                          {cities.map((cityItem) => (
                            <MenuItem key={cityItem.id} value={cityItem.name}>
                              {cityItem.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth disabled={!selectedCityId}>
                        <InputLabel>İlçe</InputLabel>
                        <Select
                          value={district}
                          label="İlçe"
                          onChange={(e) => setDistrict(e.target.value)}
                        >
                          <MenuItem value="">
                            <em>{selectedCityId ? 'İlçe Seçiniz' : 'Lütfen Önce İl Seçiniz'}</em>
                          </MenuItem>
                          {districts.map((districtItem) => (
                            <MenuItem key={districtItem.id} value={districtItem.name}>
                              {districtItem.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Satır 4: Vergi Dairesi - Vergi Numarası */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Vergi Dairesi *"
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        required={role === 'bayi'}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Vergi Numarası *"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        required={role === 'bayi'}
                        placeholder="1234567890"
                      />
                    </Grid>

                    {/* Satır 5: IBAN */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="IBAN"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                      />
                    </Grid>

                    {/* Adres - Full Width */}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Adres"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>

                    {/* Notlar - Full Width */}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Notlar"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Ek bilgiler..."
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Kullanıcı Oluştur Butonu - En Altta */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<PersonAdd />}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

