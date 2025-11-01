'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  Add,
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { AnnouncementModal } from './AnnouncementModal'
import { DeleteConfirmDialog } from '@/components/settings/DeleteConfirmDialog'

interface Announcement {
  id: string
  title: string
  content: string
  is_active: boolean
  valid_from: string
  valid_until: string | null
  priority: number
  created_at: string
}

export function AnnouncementsClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Announcement | null>(null)
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error)
      setSnackbar({ open: true, message: 'Duyurular yüklenemedi', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      setSnackbar({ 
        open: true, 
        message: `Duyuru ${!currentStatus ? 'aktif' : 'pasif'} edildi`, 
        severity: 'success' 
      })
      loadAnnouncements()
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
      setSnackbar({ open: true, message: 'Durum güncellenemedi', severity: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', deletingItem.id)

      if (error) throw error

      setSnackbar({ open: true, message: 'Duyuru silindi', severity: 'success' })
      setDeleteDialogOpen(false)
      setDeletingItem(null)
      loadAnnouncements()
    } catch (error) {
      console.error('Silme hatası:', error)
      setSnackbar({ open: true, message: 'Duyuru silinemedi', severity: 'error' })
    }
  }

  const handleSave = async () => {
    setModalOpen(false)
    setEditingItem(null)
    loadAnnouncements()
    setSnackbar({ 
      open: true, 
      message: editingItem ? 'Duyuru güncellendi' : 'Duyuru oluşturuldu', 
      severity: 'success' 
    })
  }

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Başlık',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'is_active',
      headerName: 'Durum',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Aktif' : 'Pasif'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Öncelik',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value > 5 ? 'error' : params.value > 0 ? 'warning' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'valid_from',
      headerName: 'Başlangıç',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        format(new Date(params.value as string), 'dd MMM yyyy', { locale: tr })
      ),
    },
    {
      field: 'valid_until',
      headerName: 'Bitiş',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.value 
          ? format(new Date(params.value as string), 'dd MMM yyyy', { locale: tr })
          : <Chip label="Süresiz" size="small" variant="outlined" />
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleToggleActive(params.row.id, params.row.is_active)}
            title={params.row.is_active ? 'Pasif Yap' : 'Aktif Yap'}
          >
            {params.row.is_active ? <ToggleOn color="success" /> : <ToggleOff />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setEditingItem(params.row)
              setModalOpen(true)
            }}
            title="Düzenle"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setDeletingItem(params.row)
              setDeleteDialogOpen(true)
            }}
            title="Sil"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(2, 86, 145, 0.15)',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Duyuru Yönetimi
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingItem(null)
                setModalOpen(true)
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #025691 0%, #002C51 100%)',
                boxShadow: '0 4px 12px rgba(2, 86, 145, 0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0373C4 0%, #025691 100%)',
                  boxShadow: '0 6px 16px rgba(2, 86, 145, 0.35)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Yeni Duyuru
            </Button>
          </Box>

          <DataGrid
            rows={announcements}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(2, 86, 145, 0.08)' 
                  : 'rgba(2, 86, 145, 0.04)',
              },
              '& .MuiDataGrid-columnHeaders': {
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(2, 86, 145, 0.15) 0%, rgba(0, 44, 81, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(2, 86, 145, 0.05) 0%, rgba(0, 44, 81, 0.05) 100%)',
                borderRadius: '8px 8px 0 0',
              },
              borderRadius: 2,
            }}
          />
        </CardContent>
      </Card>

      <AnnouncementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSave}
        announcement={editingItem}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingItem(null)
        }}
        onConfirm={handleDelete}
        itemName={deletingItem?.title || ''}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

