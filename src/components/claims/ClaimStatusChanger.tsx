'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle,
  PlayArrow,
  Send,
  Cancel,
  Edit,
} from '@mui/icons-material'

interface ClaimStatusChangerProps {
  claimId: string
  currentStatus: string
  onStatusChanged: () => void
}

const statusConfig: Record<string, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error'; icon: React.ReactNode }> = {
  draft: { label: 'Taslak', color: 'default', icon: <Edit fontSize="small" /> },
  submitted: { label: 'Gönderildi', color: 'info', icon: <Send fontSize="small" /> },
  in_progress: { label: 'İşlemde', color: 'warning', icon: <PlayArrow fontSize="small" /> },
  completed: { label: 'Tamamlandı', color: 'success', icon: <CheckCircle fontSize="small" /> },
  cancelled: { label: 'İptal Edildi', color: 'error', icon: <Cancel fontSize="small" /> },
}

const statusTransitions: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'submitted', 'cancelled'],
  completed: [],
  cancelled: ['submitted'],
}

export function ClaimStatusChanger({ claimId, currentStatus, onStatusChanged }: ClaimStatusChangerProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allowedStatuses = statusTransitions[currentStatus] || []

  const handleOpen = (status: string) => {
    setSelectedStatus(status)
    setOpen(true)
    setError(null)
    setNotes('')
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedStatus(null)
    setNotes('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedStatus) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, notes }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Durum güncellenemedi')
      }

      handleClose()
      onStatusChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (allowedStatuses.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Bu ihbarın durumu değiştirilemez (mevcut durum: <strong>{statusConfig[currentStatus]?.label}</strong>)
      </Alert>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        Durum Değiştir
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        {allowedStatuses.map((status) => {
          const config = statusConfig[status]
          return (
            <Button
              key={status}
              variant="outlined"
              color={config.color}
              startIcon={config.icon}
              onClick={() => handleOpen(status)}
              sx={{ fontWeight: 600 }}
            >
              {config.label}
            </Button>
          )
        })}
      </Stack>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Durum Değiştir
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mevcut Durum
            </Typography>
            <Chip
              label={statusConfig[currentStatus]?.label}
              color={statusConfig[currentStatus]?.color}
              icon={statusConfig[currentStatus]?.icon}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Yeni Durum
            </Typography>
            <Chip
              label={selectedStatus ? statusConfig[selectedStatus]?.label : ''}
              color={selectedStatus ? statusConfig[selectedStatus]?.color : 'default'}
              icon={selectedStatus ? statusConfig[selectedStatus]?.icon : undefined}
              sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}
            />
          </Box>

          <TextField
            label="Not (Opsiyonel)"
            multiline
            rows={4}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Durum değişikliği hakkında açıklama ekleyin..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Durumu Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

