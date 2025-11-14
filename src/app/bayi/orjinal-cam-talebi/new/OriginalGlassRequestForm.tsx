'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import type { UserWithRole } from '@/lib/auth'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface Option {
  id: string
  name: string
}

interface OriginalGlassRequestFormProps {
  user: UserWithRole
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  const parts = []
  if (digits.length > 0) {
    parts.push(digits.substring(0, 3))
  }
  if (digits.length > 3) {
    parts.push(digits.substring(3, 6))
  }
  if (digits.length > 6) {
    parts.push(digits.substring(6, 8))
  }
  if (digits.length > 8) {
    parts.push(digits.substring(8, 10))
  }
  if (parts.length === 0) return ''
  const [first, ...rest] = parts
  return `${first}${rest.length ? ' ' + rest.join(' ') : ''}`
}

const todayLabel = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date())

export function OriginalGlassRequestForm({ user }: OriginalGlassRequestFormProps) {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const [reasons, setReasons] = useState<Option[]>([])
  const [insuranceCompanies, setInsuranceCompanies] = useState<Option[]>([])
  const [vehicleBrands, setVehicleBrands] = useState<Option[]>([])
  const [vehicleModels, setVehicleModels] = useState<Option[]>([])
  const [glassTypes, setGlassTypes] = useState<Option[]>([])
  const [glassColors, setGlassColors] = useState<Option[]>([])

  const [form, setForm] = useState({
    request_reason_id: '',
    promised_delivery_days: '',
    notes: '',
    plate: '',
    chassis_no: '',
    model_year: '',
    vehicle_brand_id: '',
    vehicle_model_id: '',
    vehicle_submodel: '',
    glass_type_id: '',
    glass_color_id: '',
    glass_features: '',
    euro_code: '',
    glass_part_code: '',
    glass_price: '',
    discount_rate: '',
    currency: 'TRY',
    insurance_company_id: '',
    policy_number: '',
    policy_type: '',
    insured_name: '',
    insured_phone: '',
    claim_number: '',
    termin_date: '',
  })

  const showMessage = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    setForm((prev) => ({
      ...prev,
      [field]: field === 'insured_phone' ? formatPhone(value) : value,
    }))
  }

  const handleSelectChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value as string
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  useEffect(() => {
    const loadLookups = async () => {
      try {
        setLoading(true)

        const [
          reasonsRes,
          insuranceRes,
          brandsRes,
          glassTypesRes,
          glassColorsRes,
        ] = await Promise.all([
          supabase.from('original_glass_request_reasons').select('id, name').eq('is_active', true).order('name', { ascending: true }),
          supabase.from('insurance_companies').select('id, name').eq('is_active', true).order('name', { ascending: true }),
          supabase.from('vehicle_brands').select('id, name').eq('is_active', true).order('name', { ascending: true }),
          supabase.from('vehicle_glass_types').select('id, name').eq('is_active', true).order('name', { ascending: true }),
          supabase.from('glass_colors').select('id, name').eq('is_active', true).order('name', { ascending: true }),
        ])

        if (reasonsRes.error) throw reasonsRes.error
        if (insuranceRes.error) throw insuranceRes.error
        if (brandsRes.error) throw brandsRes.error
        if (glassTypesRes.error) throw glassTypesRes.error
        if (glassColorsRes.error) throw glassColorsRes.error

        setReasons(reasonsRes.data ?? [])
        setInsuranceCompanies(insuranceRes.data ?? [])
        setVehicleBrands(brandsRes.data ?? [])
        setGlassTypes(glassTypesRes.data ?? [])
        setGlassColors(glassColorsRes.data ?? [])
      } catch (error) {
        console.error('Lookup yüklenemedi:', error)
        showMessage('Parametreler yüklenemedi, lütfen sayfayı yenileyin.', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadLookups()
  }, [supabase])

  useEffect(() => {
    const loadModels = async () => {
      if (!form.vehicle_brand_id) {
        setVehicleModels([])
        setForm((prev) => ({ ...prev, vehicle_model_id: '' }))
        return
      }

      const { data, error } = await supabase
        .from('vehicle_models')
        .select('id, name')
        .eq('is_active', true)
        .eq('brand_id', form.vehicle_brand_id)
        .order('name', { ascending: true })

      if (error) {
        console.error('Araç modelleri yüklenemedi:', error)
        showMessage('Araç modelleri yüklenemedi', 'error')
        return
      }

      setVehicleModels(data ?? [])
    }

    loadModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vehicle_brand_id])

  const handleReset = () => {
    setForm({
      request_reason_id: '',
      promised_delivery_days: '',
      notes: '',
      plate: '',
      chassis_no: '',
      model_year: '',
      vehicle_brand_id: '',
      vehicle_model_id: '',
      vehicle_submodel: '',
      glass_type_id: '',
      glass_color_id: '',
      glass_features: '',
      euro_code: '',
      glass_part_code: '',
      glass_price: '',
      discount_rate: '',
      currency: 'TRY',
      insurance_company_id: '',
      policy_number: '',
      policy_type: '',
      insured_name: '',
      insured_phone: '',
      claim_number: '',
      termin_date: '',
    })
  }

  const validate = () => {
    const requiredFields: (keyof typeof form)[] = [
      'request_reason_id',
      'plate',
      'vehicle_brand_id',
      'glass_type_id',
      'insurance_company_id',
      'insured_phone',
    ]

    for (const field of requiredFields) {
      if (!form[field]) {
        return false
      }
    }

    const phoneDigits = form.insured_phone.replace(/\D/g, '')
    return phoneDigits.length === 10
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) {
      showMessage('Lütfen zorunlu alanları doldurun ve telefon formatını kontrol edin.', 'error')
      return
    }

    try {
      setSaving(true)

      const payload = {
        request_reason_id: form.request_reason_id,
        promised_delivery_days: form.promised_delivery_days ? Number(form.promised_delivery_days) : null,
        notes: form.notes || null,
        plate: form.plate.trim().toUpperCase(),
        chassis_no: form.chassis_no || null,
        model_year: form.model_year ? Number(form.model_year) : null,
        vehicle_brand_id: form.vehicle_brand_id,
        vehicle_model_id: form.vehicle_model_id || null,
        vehicle_submodel: form.vehicle_submodel || null,
        glass_type_id: form.glass_type_id,
        glass_color_id: form.glass_color_id || null,
        glass_features: form.glass_features || null,
        euro_code: form.euro_code || null,
        glass_part_code: form.glass_part_code || null,
        glass_price: form.glass_price ? Number(form.glass_price) : null,
        discount_rate: form.discount_rate ? Number(form.discount_rate) : null,
        currency: form.currency || 'TRY',
        insurance_company_id: form.insurance_company_id,
        policy_number: form.policy_number || null,
        policy_type: form.policy_type || null,
        insured_name: form.insured_name || null,
        insured_phone: form.insured_phone.replace(/\D/g, ''),
        claim_number: form.claim_number || null,
        termin_date: form.termin_date || null,
      }

      const response = await fetch('/api/original-glass-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Talep kaydedilemedi')
      }

      showMessage('Talep başarıyla oluşturuldu. Talep listesine yönlendiriliyorsunuz.', 'success')

      setTimeout(() => {
        router.push('/bayi/orjinal-cam-talep-listesi')
      }, 1200)
    } catch (error) {
      console.error('Talep kaydı hatası:', error)
      showMessage(
        error instanceof Error ? error.message : 'Talep kaydedilirken bir hata oluştu',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Yeni Orijinal Cam Talebi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Talep bilgilerini eksiksiz doldurduktan sonra kaydedebilirsiniz.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={saving}
          >
            Formu Temizle
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            Talep Oluştur
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Dosya yükleme işlemi talep sonrasında yapılabilir.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Oluşturan Bilgileri
              </Typography>
              <TextField
                label="Bayi / Firma"
                value={user.tenantName}
                disabled
                fullWidth
              />
              <TextField label="Oluşturan Kullanıcı" value={user.email} disabled fullWidth />
              <TextField label="Oluşturma Tarihi" value={todayLabel} disabled fullWidth />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Talep Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    required
                    label="Talep Sebebi"
                    value={form.request_reason_id}
                    onChange={handleSelectChange('request_reason_id')}
                    fullWidth
                    disabled={loading || saving}
                  >
                    {reasons.map((reason) => (
                      <MenuItem key={reason.id} value={reason.id}>
                        {reason.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Termin Günü (Gün)"
                    type="number"
                    value={form.promised_delivery_days}
                    onChange={handleChange('promised_delivery_days')}
                    fullWidth
                    inputProps={{ min: 0 }}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Termin Tarihi"
                    type="date"
                    value={form.termin_date}
                    onChange={handleChange('termin_date')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notlar"
                    value={form.notes}
                    onChange={handleChange('notes')}
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={saving}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Araç Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Plaka"
                    value={form.plate}
                    onChange={handleChange('plate')}
                    required
                    fullWidth
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Şasi No"
                    value={form.chassis_no}
                    onChange={handleChange('chassis_no')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Model Yılı"
                    value={form.model_year}
                    onChange={handleChange('model_year')}
                    fullWidth
                    type="number"
                    inputProps={{ min: 1900, max: 2100 }}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    required
                    label="Araç Markası"
                    value={form.vehicle_brand_id}
                    onChange={handleSelectChange('vehicle_brand_id')}
                    fullWidth
                    disabled={loading || saving}
                  >
                    {vehicleBrands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label="Araç Modeli"
                    value={form.vehicle_model_id}
                    onChange={handleSelectChange('vehicle_model_id')}
                    fullWidth
                    disabled={!form.vehicle_brand_id || saving}
                  >
                    {vehicleModels.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Alt Model / Donanım"
                    value={form.vehicle_submodel}
                    onChange={handleChange('vehicle_submodel')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Cam Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    required
                    label="Cam Tipi"
                    value={form.glass_type_id}
                    onChange={handleSelectChange('glass_type_id')}
                    fullWidth
                    disabled={loading || saving}
                  >
                    {glassTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label="Cam Rengi"
                    value={form.glass_color_id}
                    onChange={handleSelectChange('glass_color_id')}
                    fullWidth
                    disabled={loading || saving}
                  >
                    {glassColors.map((color) => (
                      <MenuItem key={color.id} value={color.id}>
                        {color.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Cam Özellikleri"
                    value={form.glass_features}
                    onChange={handleChange('glass_features')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Euro Kod"
                    value={form.euro_code}
                    onChange={handleChange('euro_code')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Cam Parça Kodu"
                    value={form.glass_part_code}
                    onChange={handleChange('glass_part_code')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Cam Fiyatı"
                    value={form.glass_price}
                    onChange={handleChange('glass_price')}
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, step: '0.01' }}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="İskonto Oranı (%)"
                    value={form.discount_rate}
                    onChange={handleChange('discount_rate')}
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: '0.01' }}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Para Birimi"
                    value={form.currency}
                    onChange={handleChange('currency')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Sigorta Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    required
                    label="Sigorta Şirketi"
                    value={form.insurance_company_id}
                    onChange={handleSelectChange('insurance_company_id')}
                    fullWidth
                    disabled={loading || saving}
                  >
                    {insuranceCompanies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Poliçe Numarası"
                    value={form.policy_number}
                    onChange={handleChange('policy_number')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Poliçe Türü"
                    value={form.policy_type}
                    onChange={handleChange('policy_type')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Sigortalı Adı"
                    value={form.insured_name}
                    onChange={handleChange('insured_name')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    label="Sigortalı Telefonu (5XX XXX XX XX)"
                    value={form.insured_phone}
                    onChange={handleChange('insured_phone')}
                    fullWidth
                    disabled={saving}
                    inputProps={{ maxLength: 13 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Hasar / Dosya No"
                    value={form.claim_number}
                    onChange={handleChange('claim_number')}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 2000 : 4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  )
}
