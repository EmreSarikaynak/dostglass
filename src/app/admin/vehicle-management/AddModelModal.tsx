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

interface AddModelModalProps {
  open: boolean
  onClose: () => void
  onSave: (modelName: string) => Promise<void>
  brandName: string
  categoryName: string
}

export function AddModelModal({
  open,
  onClose,
  onSave,
  brandName,
  categoryName,
}: AddModelModalProps) {
  const [modelName, setModelName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!modelName.trim()) {
      setError('Model adı boş olamaz')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSave(modelName.trim())
      // Başarılı - modal'ı kapat ve formu temizle
      setModelName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Model eklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setModelName('')
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
        Yeni Model Ekle
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Seçili kategori ve marka bilgisi */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Seçili Kategori & Marka
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={categoryName} color="primary" size="small" />
              <Chip label={brandName} color="primary" variant="outlined" size="small" />
            </Box>
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
            label="Model Adı"
            value={modelName}
            onChange={(e) => {
              setModelName(e.target.value)
              setError('')
            }}
            placeholder="Örn: Corolla, Golf, A3"
            helperText="Eklemek istediğiniz model adını girin"
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
          disabled={loading || !modelName.trim()}
        >
          {loading ? 'Ekleniyor...' : 'Model Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

