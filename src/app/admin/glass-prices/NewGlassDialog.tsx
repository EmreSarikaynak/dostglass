'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import Grid2 from '@mui/material/GridLegacy'
import CircularProgress from '@mui/material/CircularProgress'

type LookupOption = {
  id: string
  name: string
}

type NewGlassDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess: (created?: Record<string, unknown>) => void
  suppliers: string[]
  categories: string[]
}

type FormState = {
  product_code: string
  stock_name: string
  alternative_codes: string
  supplier: string
  category: string
  price_colorless: string
  price_colored: string
  price_double_color: string
  position_text: string
  features: string
  hole_info: string
  thickness_mm: string
  width_mm: string
  height_mm: string
  area_m2: string
  model_year_start: string
  model_year_end: string
  notes: string
  has_camera: boolean
  has_sensor: boolean
  is_encapsulated: boolean
  is_acoustic: boolean
  is_heated: boolean
  is_active: boolean
}

const initialForm: FormState = {
  product_code: '',
  stock_name: '',
  alternative_codes: '',
  supplier: '',
  category: '',
  price_colorless: '',
  price_colored: '',
  price_double_color: '',
  position_text: '',
  features: '',
  hole_info: '',
  thickness_mm: '',
  width_mm: '',
  height_mm: '',
  area_m2: '',
  model_year_start: '',
  model_year_end: '',
  notes: '',
  has_camera: false,
  has_sensor: false,
  is_encapsulated: false,
  is_acoustic: false,
  is_heated: false,
  is_active: true,
}

const numberOrNull = (value: string) => {
  if (!value?.trim()) return null
  const normalized = value.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function NewGlassDialog({
  open,
  onClose,
  onSuccess,
  suppliers,
  categories,
}: NewGlassDialogProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleCategories, setVehicleCategories] = useState<LookupOption[]>([])
  const [vehicleBrands, setVehicleBrands] = useState<LookupOption[]>([])
  const [vehicleModels, setVehicleModels] = useState<LookupOption[]>([])
  const [glassPositions, setGlassPositions] = useState<LookupOption[]>([])
  const [glassTypes, setGlassTypes] = useState<LookupOption[]>([])
  const [glassBrands, setGlassBrands] = useState<LookupOption[]>([])
  const [glassColors, setGlassColors] = useState<LookupOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState<LookupOption | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<LookupOption | null>(null)
  const [selectedModel, setSelectedModel] = useState<LookupOption | null>(null)
  const [selectedGlassPosition, setSelectedGlassPosition] = useState<LookupOption | null>(null)
  const [selectedGlassType, setSelectedGlassType] = useState<LookupOption | null>(null)
  const [selectedGlassBrand, setSelectedGlassBrand] = useState<LookupOption | null>(null)
  const [selectedGlassColor, setSelectedGlassColor] = useState<LookupOption | null>(null)
  const [lookupsLoading, setLookupsLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false
    const fetchLookups = async () => {
      setLookupsLoading(true)
      try {
        const [categoryRes, positionRes, typeRes, brandRes, colorRes] = await Promise.all([
          fetch('/api/parameters/vehicle_categories?only_active=true'),
          fetch('/api/parameters/glass_positions?only_active=true'),
          fetch('/api/parameters/vehicle_glass_types?only_active=true'),
          fetch('/api/parameters/glass_brands?only_active=true'),
          fetch('/api/parameters/glass_colors?only_active=true'),
        ])

        if (!cancelled) {
          const categoryJson = await categoryRes.json()
          const positionJson = await positionRes.json()
          const typeJson = await typeRes.json()
          const brandJson = await brandRes.json()
          const colorJson = await colorRes.json()

          setVehicleCategories(
            (categoryJson.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )

          setGlassPositions(
            (positionJson.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )

          setGlassTypes(
            (typeJson.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )

          setGlassBrands(
            (brandJson.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )

          setGlassColors(
            (colorJson.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Lookup yükleme hatası:', err)
        }
      } finally {
        if (!cancelled) {
          setLookupsLoading(false)
        }
      }
    }

    fetchLookups()

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open || !selectedCategory?.id) {
      setVehicleBrands([])
      setSelectedBrand(null)
      return
    }

    let cancelled = false
    const fetchBrands = async () => {
      try {
        const res = await fetch(`/api/parameters/vehicle_brands?category_id=${selectedCategory.id}`)
        const json = await res.json()
        if (!cancelled) {
          setVehicleBrands(
            (json.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Marka yükleme hatası:', err)
        }
      }
    }

    fetchBrands()

    return () => {
      cancelled = true
    }
  }, [open, selectedCategory?.id])

  useEffect(() => {
    if (!open || !selectedBrand?.id) {
      setVehicleModels([])
      setSelectedModel(null)
      return
    }

    let cancelled = false
    const fetchModels = async () => {
      try {
        const res = await fetch(`/api/parameters/vehicle_models?brand_id=${selectedBrand.id}`)
        const json = await res.json()
        if (!cancelled) {
          setVehicleModels(
            (json.data || []).map((item: Record<string, unknown>) => ({
              id: String(item.id),
              name: String(item.name ?? ''),
            }))
          )
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Model yükleme hatası:', err)
        }
      }
    }

    fetchModels()

    return () => {
      cancelled = true
    }
  }, [open, selectedBrand?.id])

  useEffect(() => {
    if (!open) {
      setForm(initialForm)
      setError(null)
      setSelectedCategory(null)
      setSelectedBrand(null)
      setSelectedModel(null)
      setSelectedGlassPosition(null)
      setSelectedGlassType(null)
      setSelectedGlassBrand(null)
      setSelectedGlassColor(null)
    }
  }, [open])

  const supplierOptions = useMemo(
    () => [...suppliers].sort((a, b) => a.localeCompare(b)),
    [suppliers]
  )
  const categoryOptions = useMemo(
    () => [...categories].sort((a, b) => a.localeCompare(b)),
    [categories]
  )

  const handleFormChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value as never }))
  }

  const handleSubmit = async () => {
    if (!form.product_code.trim()) {
      setError('Ürün kodu zorunludur.')
      return
    }

    if (!form.stock_name.trim()) {
      setError('Stok adı zorunludur.')
      return
    }

    const basePrice = numberOrNull(form.price_colorless)
    if (basePrice === null || basePrice <= 0) {
      setError('Renksiz fiyat geçerli bir değer olmalıdır.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
    const payload = {
      product_code: form.product_code.trim(),
      stock_name: form.stock_name.trim(),
      alternative_codes: form.alternative_codes
        ? form.alternative_codes
            .split(',')
            .map((code) => code.trim())
            .filter((code) => code.length > 0)
        : null,
      supplier: form.supplier.trim() || null,
      category: form.category.trim() || null,
      price_colorless: basePrice,
      price_colored: numberOrNull(form.price_colored),
      price_double_color: numberOrNull(form.price_double_color),
      position_text: selectedGlassPosition?.name || form.position_text.trim() || null,
      features: form.features.trim() || null,
      hole_info: form.hole_info.trim() || null,
      thickness_mm: numberOrNull(form.thickness_mm),
      width_mm: numberOrNull(form.width_mm),
      height_mm: numberOrNull(form.height_mm),
      area_m2: numberOrNull(form.area_m2),
      model_year_start: form.model_year_start.trim() || null,
      model_year_end: form.model_year_end.trim() || null,
      notes: form.notes.trim() || null,
      has_camera: form.has_camera,
      has_sensor: form.has_sensor,
      is_encapsulated: form.is_encapsulated,
      is_acoustic: form.is_acoustic,
      is_heated: form.is_heated,
      is_active: form.is_active,
      vehicle_category_id: selectedCategory?.id ?? null,
      vehicle_brand_id: selectedBrand?.id ?? null,
      vehicle_model_id: selectedModel?.id ?? null,
      glass_position_id: selectedGlassPosition?.id ?? null,
      glass_type_id: selectedGlassType?.id ?? null,
      glass_brand_id: selectedGlassBrand?.id ?? null,
      glass_color_id: selectedGlassColor?.id ?? null,
    }

    const response = await fetch('/api/glass-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        const message = result.error || 'Cam kaydı oluşturulamadı.'
        setError(message)
        return
      }

      onSuccess(result.data)
      setForm(initialForm)
      setSelectedCategory(null)
      setSelectedBrand(null)
      setSelectedModel(null)
      setSelectedGlassPosition(null)
      setSelectedGlassType(null)
      setSelectedGlassBrand(null)
      setSelectedGlassColor(null)
    } catch (err) {
      console.error('Cam ekleme hatası:', err)
      setError('Cam kaydı eklenirken bir hata oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Yeni Cam Fiyatı Ekle
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {lookupsLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Referans listeleri yükleniyor...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Grid2 container spacing={2}>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Ürün Kodu *"
                value={form.product_code}
                onChange={handleFormChange('product_code')}
                fullWidth
                required
              />
            </Grid2>
            <Grid2 item xs={12} md={8}>
              <TextField
                label="Stok Adı / Ürün Tanımı *"
                value={form.stock_name}
                onChange={handleFormChange('stock_name')}
                fullWidth
                required
              />
            </Grid2>
            <Grid2 item xs={12}>
              <TextField
                label="Alternatif Kodlar (virgülle ayırın)"
                value={form.alternative_codes}
                onChange={handleFormChange('alternative_codes')}
                fullWidth
                helperText="Örn: UG1234, EL-5678"
              />
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={supplierOptions}
                value={form.supplier}
                onChange={(_, value) =>
                  setForm((prev) => ({ ...prev, supplier: value ?? '' }))
                }
                onInputChange={(_, value) =>
                  setForm((prev) => ({ ...prev, supplier: value ?? '' }))
                }
                renderInput={(params) => <TextField {...params} label="Tedarikçi" fullWidth />}
              />
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={categoryOptions}
                value={form.category}
                onChange={(_, value) =>
                  setForm((prev) => ({ ...prev, category: value ?? '' }))
                }
                onInputChange={(_, value) =>
                  setForm((prev) => ({ ...prev, category: value ?? '' }))
                }
                renderInput={(params) => <TextField {...params} label="Kategori" fullWidth />}
              />
            </Grid2>
          </Grid2>

          <Divider />

          <Grid2 container spacing={2}>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Fiyat (Renksiz) *"
                value={form.price_colorless}
                onChange={handleFormChange('price_colorless')}
                type="number"
                fullWidth
                required
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Fiyat (Renkli)"
                value={form.price_colored}
                onChange={handleFormChange('price_colored')}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Fiyat (Çift Renk)"
                value={form.price_double_color}
                onChange={handleFormChange('price_double_color')}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <TextField
                label="Model Yılı (Başlangıç)"
                value={form.model_year_start}
                onChange={handleFormChange('model_year_start')}
                fullWidth
                placeholder="Örn: 2010"
              />
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <TextField
                label="Model Yılı (Bitiş)"
                value={form.model_year_end}
                onChange={handleFormChange('model_year_end')}
                fullWidth
                placeholder="Örn: 2015"
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Kalınlık (mm)"
                value={form.thickness_mm}
                onChange={handleFormChange('thickness_mm')}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.1' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="En (mm)"
                value={form.width_mm}
                onChange={handleFormChange('width_mm')}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '1' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Boy (mm)"
                value={form.height_mm}
                onChange={handleFormChange('height_mm')}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '1' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Alan (m²)"
                value={form.area_m2}
                onChange={handleFormChange('area_m2')}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <TextField
                label="Delik Bilgisi"
                value={form.hole_info}
                onChange={handleFormChange('hole_info')}
                fullWidth
              />
            </Grid2>
          </Grid2>

          <Divider />

          <Grid2 container spacing={2}>
            <Grid2 item xs={12} md={4}>
              <Autocomplete
                options={vehicleCategories}
                value={selectedCategory}
                onChange={(_, value) => {
                  setSelectedCategory(value)
                  setSelectedBrand(null)
                  setSelectedModel(null)
                }}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Araç Kategorisi" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <Autocomplete
                options={vehicleBrands}
                value={selectedBrand}
                onChange={(_, value) => {
                  setSelectedBrand(value)
                  setSelectedModel(null)
                }}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Araç Markası" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={!vehicleBrands.length}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <Autocomplete
                options={vehicleModels}
                value={selectedModel}
                onChange={(_, value) => setSelectedModel(value)}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Araç Modeli" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={!vehicleModels.length}
              />
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={glassPositions.map((item) => item.name)}
                value={selectedGlassPosition?.name ?? form.position_text}
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    const matched = glassPositions.find((option) => option.name === value) || null
                    setSelectedGlassPosition(matched)
                    if (!matched) {
                      setForm((prev) => ({ ...prev, position_text: value }))
                    }
                  } else {
                    setSelectedGlassPosition(null)
                  }
                }}
                onInputChange={(_, value) => {
                  const matched = glassPositions.find((option) => option.name === value) || null
                  setSelectedGlassPosition(matched)
                  setForm((prev) => ({ ...prev, position_text: value }))
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cam Konumu"
                    fullWidth
                  />
                )}
              />
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <TextField
                label="Özellikler"
                value={form.features}
                onChange={handleFormChange('features')}
                fullWidth
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <Autocomplete
                options={glassTypes}
                value={selectedGlassType}
                onChange={(_, value) => setSelectedGlassType(value)}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Cam Tipi" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <Autocomplete
                options={glassBrands}
                value={selectedGlassBrand}
                onChange={(_, value) => setSelectedGlassBrand(value)}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Cam Markası" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid2>
            <Grid2 item xs={12} md={4}>
              <Autocomplete
                options={glassColors}
                value={selectedGlassColor}
                onChange={(_, value) => setSelectedGlassColor(value)}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Cam Rengi" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid2>
            <Grid2 item xs={12}>
              <TextField
                label="Notlar"
                value={form.notes}
                onChange={handleFormChange('notes')}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid2>
          </Grid2>

          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Özellikler
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.has_camera}
                    onChange={handleFormChange('has_camera')}
                  />
                }
                label="Kamera"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.has_sensor}
                    onChange={handleFormChange('has_sensor')}
                  />
                }
                label="Sensör"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_encapsulated}
                    onChange={handleFormChange('is_encapsulated')}
                  />
                }
                label="Enkapsüle"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_acoustic}
                    onChange={handleFormChange('is_acoustic')}
                  />
                }
                label="Akustik"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_heated}
                    onChange={handleFormChange('is_heated')}
                  />
                }
                label="Isıtmalı"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={handleFormChange('is_active')}
                  />
                }
                label="Aktif"
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Vazgeç
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress color="inherit" size={18} /> : null}
        >
          {submitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
