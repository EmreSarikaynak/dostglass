'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material'

interface ParameterModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
  fields: FieldConfig[]
  title: string
  relatedData?: Record<string, Record<string, unknown>[]> // İlişkisel veriler için
}

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'switch' | 'select'
  required?: boolean
  rows?: number // textarea için satır sayısı
  relatedTable?: string // İlişkisel alan için hangi tablodan veri çekileceği
  relatedLabelKey?: string // İlişkili tabloda gösterilecek alan
}

export function ParameterModal({
  open,
  onClose,
  onSave,
  initialData,
  fields,
  title,
  relatedData = {},
}: ParameterModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      // Yeni kayıt için default değerler
      const defaults: Record<string, unknown> = { is_active: true }
      fields.forEach(field => {
        if (field.type === 'switch') {
          defaults[field.name] = true
        }
      })
      setFormData(defaults)
    }
  }, [initialData, open, fields])

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    // Zorunlu alan kontrolü
    const missingFields = fields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label)

    if (missingFields.length > 0) {
      alert(`Lütfen şu alanları doldurun: ${missingFields.join(', ')}`)
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {fields.map((field) => {
            if (field.type === 'switch') {
              return (
                <FormControlLabel
                  key={field.name}
                  control={
                    <Switch
                      checked={Boolean(formData[field.name])}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                    />
                  }
                  label={field.label}
                />
              )
            }

            if (field.type === 'select' && field.relatedTable) {
              const options = relatedData[field.relatedTable] || []
              return (
                <Autocomplete
                  key={field.name}
                  options={options}
                  getOptionLabel={(option) => String((option as Record<string, unknown>)[field.relatedLabelKey || 'name'] || '')}
                  value={options.find((opt) => (opt as Record<string, unknown>).id === formData[field.name]) || null}
                  onChange={(_, newValue) => handleChange(field.name, (newValue as Record<string, unknown> | null)?.id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field.label}
                      required={field.required}
                    />
                  )}
                />
              )
            }

            if (field.type === 'textarea') {
              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  value={String(formData[field.name] || '')}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  fullWidth
                  multiline
                  rows={field.rows || 4}
                  placeholder="Markdown formatında yazabilirsiniz"
                />
              )
            }

              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  value={String(formData[field.name] || '')}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  fullWidth
                />
              )
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

