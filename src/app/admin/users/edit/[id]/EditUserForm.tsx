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
import { ArrowBack, Save } from '@mui/icons-material'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface Tenant {
  id: string
  name: string
}

interface DealerInfo {
  id?: string
  company_name: string
  contact_person: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  district: string
  postal_code: string
  tax_office: string
  tax_number: string
  iban: string
  notes: string
}

interface User {
  id: string
  email: string
  role: string
  tenantId: string
  tenantName: string
  dealerInfo?: DealerInfo
}

interface EditUserFormProps {
  user: User
  tenants: Tenant[]
}

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

export function EditUserForm({ user, tenants }: EditUserFormProps) {
  const router = useRouter()
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState<'admin' | 'bayi'>(user.role as 'admin' | 'bayi')
  const [tenantId, setTenantId] = useState(user.tenantId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // İl ve İlçe state'leri
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)

  // Bayi bilgileri
  const [contactPerson, setContactPerson] = useState(user.dealerInfo?.contact_person || '')
  const [phone, setPhone] = useState(user.dealerInfo?.phone || '')
  const [mobile, setMobile] = useState(user.dealerInfo?.mobile || '')
  const [address, setAddress] = useState(user.dealerInfo?.address || '')
  const [city, setCity] = useState(user.dealerInfo?.city || 'AĞRI') // Varsayılan olarak AĞRI
  const [district, setDistrict] = useState(user.dealerInfo?.district || '')
  const [postalCode, setPostalCode] = useState(user.dealerInfo?.postal_code || '')
  const [taxOffice, setTaxOffice] = useState(user.dealerInfo?.tax_office || '')
  const [taxNumber, setTaxNumber] = useState(user.dealerInfo?.tax_number || '')
  const [iban, setIban] = useState(user.dealerInfo?.iban || '')
  const [notes, setNotes] = useState(user.dealerInfo?.notes || '')

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
        
        // Mevcut şehir varsa city_id'yi bul, yoksa AĞRI'yı varsayılan yap
        const currentCity = data.find(c => c.name === city)
        if (currentCity) {
          setSelectedCityId(currentCity.id)
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
    } else {
      setDistricts([])
    }
  }, [selectedCityId])

  // İl değiştiğinde
  const handleCityChange = (cityName: string) => {
    setCity(cityName)
    const selectedCity = cities.find(c => c.name === cityName)
    setSelectedCityId(selectedCity ? selectedCity.id : null)
    // İl değiştiğinde ilçeyi sıfırla
    setDistrict('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      interface RequestBody {
        email: string
        role: 'admin' | 'bayi'
        tenantId: string
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
        role,
        tenantId,
      }

      // Eğer bayi ise ek bilgileri ekle
      if (role === 'bayi') {
        requestBody.dealerInfo = {
          companyName: user.tenantName, // Firma adı tenant adı ile aynı
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

      const response = await fetch(`/api/admin/update-user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Kullanıcı güncellenirken bir hata oluştu.')
        setLoading(false)
        return
      }

      setSuccess('Kullanıcı başarıyla güncellendi!')
      setLoading(false)

      setTimeout(() => {
        router.push('/admin/users')
        router.refresh()
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
          Kullanıcı Düzenle
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Kullanıcı bilgilerini güncelleyin.
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
                  <FormControl fullWidth required>
                    <InputLabel>Firma *</InputLabel>
                    <Select
                      value={tenantId}
                      label="Firma *"
                      onChange={(e) => setTenantId(e.target.value)}
                    >
                      {tenants.map((tenant) => (
                        <MenuItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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

              {/* Kaydet Butonu - En Altta */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<Save />}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? 'Güncelleniyor...' : 'Kaydet'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

