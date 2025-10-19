'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material'
import { DirectionsCar } from '@mui/icons-material'

interface AddBrandModalProps {
  open: boolean
  onClose: () => void
  onSave: (brandName: string) => Promise<void>
  categoryName: string
}

export function AddBrandModal({
  open,
  onClose,
  onSave,
  categoryName,
}: AddBrandModalProps) {
  const [brandName, setBrandName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!brandName.trim()) {
      setError('Marka adı boş olamaz')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSave(brandName.trim())
      // Başarılı - modal'ı kapat ve formu temizle
      setBrandName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marka eklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setBrandName('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DirectionsCar />
        Yeni Marka Ekle
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Seçili kategori bilgisi */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Seçili Kategori
            </Typography>
            <Chip label={categoryName} color="primary" size="small" />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            required
            fullWidth
            label="Marka Adı"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value)
              setError('')
            }}
            placeholder="Örn: Toyota, BMW, Audi"
            helperText="Eklemek istediğiniz marka adını girin"
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !brandName.trim()}
        >
          {loading ? 'Ekleniyor...' : 'Marka Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

