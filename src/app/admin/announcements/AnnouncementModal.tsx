'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  Stack,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { tr } from 'date-fns/locale'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { HTMLEditor } from '@/components/HTMLEditor'

interface AnnouncementModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  announcement?: {
    id: string
    title: string
    content: string
    is_active: boolean
    valid_from: string
    valid_until: string | null
    priority: number
  } | null
}

export function AnnouncementModal({ open, onClose, onSave, announcement }: AnnouncementModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [priority, setPriority] = useState(0)
  const [validFrom, setValidFrom] = useState<Date | null>(new Date())
  const [validUntil, setValidUntil] = useState<Date | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title)
      setContent(announcement.content)
      setIsActive(announcement.is_active)
      setPriority(announcement.priority)
      setValidFrom(new Date(announcement.valid_from))
      setValidUntil(announcement.valid_until ? new Date(announcement.valid_until) : null)
    } else {
      setTitle('')
      setContent('')
      setIsActive(true)
      setPriority(0)
      setValidFrom(new Date())
      setValidUntil(null)
    }
    setError('')
  }, [announcement, open])

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  }), [])

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image',
  ]

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Başlık zorunludur')
      return
    }

    if (!content.trim() || content === '<p><br></p>') {
      setError('İçerik zorunludur')
      return
    }

    setSaving(true)
    setError('')

    try {
      const supabase = supabaseBrowser()
      const data = {
        title: title.trim(),
        content,
        is_active: isActive,
        priority,
        valid_from: validFrom?.toISOString(),
        valid_until: validUntil?.toISOString() || null,
      }

      if (announcement) {
        // Güncelle
        const { error: updateError } = await supabase
          .from('announcements')
          .update(data)
          .eq('id', announcement.id)

        if (updateError) throw updateError
      } else {
        // Yeni oluştur
        const { error: insertError } = await supabase
          .from('announcements')
          .insert(data)

        if (insertError) throw insertError
      }

      onSave()
    } catch (err) {
      console.error('Kaydetme hatası:', err)
      setError('Duyuru kaydedilemedi. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            height: '90vh',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(2, 86, 145, 0.15)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          {announcement ? 'Duyuru Düzenle' : 'Yeni Duyuru Oluştur'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Başlık"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              placeholder="Duyuru başlığını girin"
            />

            <Box>
              <Box sx={{ mb: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                İçerik *
              </Box>
              <Box sx={{ 
                '& .ql-container': { 
                  minHeight: '300px',
                  fontSize: '14px',
                  borderRadius: '0 0 8px 8px',
                },
                '& .ql-toolbar': {
                  borderRadius: '8px 8px 0 0',
                  background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f7fa',
                },
                '& .ql-editor': {
                  minHeight: '300px',
                },
                '& .ql-editor.ql-blank::before': {
                  color: '#8B929C',
                  fontStyle: 'normal',
                },
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              }}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Duyuru içeriğini buraya yazın..."
                />
              </Box>
            </Box>

            <TextField
              label="Öncelik"
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              fullWidth
              helperText="Yüksek değer = Carousel'da önce gösterilir (0-10 arası önerilir)"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <DateTimePicker
                label="Başlangıç Tarihi"
                value={validFrom}
                onChange={setValidFrom}
                slotProps={{
                  textField: { fullWidth: true, required: true }
                }}
              />

              <DateTimePicker
                label="Bitiş Tarihi"
                value={validUntil}
                onChange={setValidUntil}
                slotProps={{
                  textField: { 
                    fullWidth: true,
                    helperText: 'Boş bırakılırsa süresiz geçerli olur'
                  }
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Aktif"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 3,
              color: '#8B929C',
              '&:hover': {
                bgcolor: 'rgba(139, 146, 156, 0.1)',
              },
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
              boxShadow: '0 4px 12px rgba(2, 86, 145, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0373C4 0%, #025691 100%)',
                boxShadow: '0 6px 16px rgba(2, 86, 145, 0.35)',
              },
            }}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}
