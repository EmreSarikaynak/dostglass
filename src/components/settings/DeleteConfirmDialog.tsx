'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'
import { Warning } from '@mui/icons-material'

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  itemName?: string
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="error" />
        Silme Onayı
      </DialogTitle>
      <DialogContent>
        <Typography>
          {itemName ? (
            <>
              <strong>{itemName}</strong> kaydını silmek istediğinizden emin misiniz?
            </>
          ) : (
            'Bu kaydı silmek istediğinizden emin misiniz?'
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Bu işlem geri alınamaz.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Sil
        </Button>
      </DialogActions>
    </Dialog>
  )
}

