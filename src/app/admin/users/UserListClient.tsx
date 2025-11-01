'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add, Search, Edit, Delete } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface User {
  id: string
  email: string
  role: string
  tenantName: string
  createdAt: string
}

interface UserListClientProps {
  users: User[]
}

export function UserListClient({ users }: UserListClientProps) {
  const router = useRouter()
  const supabase = supabaseBrowser()
  const [searchText, setSearchText] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.tenantName.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/edit/${userId}`)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      // user_tenants tablosundan kullanıcıyı sil
      const { error: tenantError } = await supabase
        .from('user_tenants')
        .delete()
        .eq('user_id', userToDelete.id)

      if (tenantError) throw tenantError

      // Auth kullanıcısını silmek için API çağrısı gerekli
      // (Bu işlem service role gerektirdiği için backend'de yapılmalı)
      const response = await fetch(`/api/admin/delete-user/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Kullanıcı silinemedi')

      // Sayfayı yenile
      router.refresh()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error)
      alert('Kullanıcı silinirken bir hata oluştu.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: 'E-posta',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'tenantName',
      headerName: 'Firma',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'admin' ? 'Admin' : 'Bayi'}
          color={params.value === 'admin' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Kayıt Tarihi',
      width: 150,
      valueFormatter: (value) => {
        try {
          return format(new Date(value), 'dd MMM yyyy', { locale: tr })
        } catch {
          return '-'
        }
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => handleEditUser(params.row.id)}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => handleDeleteClick(params.row)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Kullanıcı Listesi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/admin/users/new')}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="E-posta veya firma adı ile ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        <DataGrid
          rows={filteredUsers}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
          }}
        />
      </Card>

      {/* Silme Onay Dialogu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Kullanıcıyı Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{userToDelete?.email}</strong> kullanıcısını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

