'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Switch,
} from '@mui/material'
import { Add, Edit, Delete, Business } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { InsuranceCompanyDialog } from './InsuranceCompanyDialog'

interface InsuranceCompany {
  id: string
  code: string
  name: string
  logo_url?: string
  work_procedure?: string
  is_active: boolean
  created_at: string
}

export function InsuranceCompaniesManagement() {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/parameters/insurance_companies')
      const result = await response.json()
      
      if (response.ok) {
        setCompanies(result.data || [])
      } else {
        showSnackbar('Veriler yüklenemedi', 'error')
      }
    } catch (err) {
      console.error('Yükleme hatası:', err)
      showSnackbar('Bir hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => {
    setSelectedCompany(null)
    setDialogOpen(true)
  }

  const handleEdit = (company: InsuranceCompany) => {
    setSelectedCompany(company)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sigorta şirketini silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/parameters/insurance_companies?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showSnackbar('Sigorta şirketi silindi', 'success')
        loadCompanies()
      } else {
        showSnackbar('Silme işlemi başarısız', 'error')
      }
    } catch (err) {
      console.error('Silme hatası:', err)
      showSnackbar('Bir hata oluştu', 'error')
    }
  }

  const handleSaveSuccess = () => {
    setDialogOpen(false)
    loadCompanies()
    showSnackbar(selectedCompany ? 'Güncellendi' : 'Eklendi', 'success')
  }

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      const company = companies.find(c => c.id === id)
      if (!company) return

      const response = await fetch('/api/parameters/insurance_companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...company, id, is_active: newStatus }),
      })

      if (response.ok) {
        showSnackbar('Durum güncellendi', 'success')
        loadCompanies()
      } else {
        showSnackbar('Durum güncellenemedi', 'error')
      }
    } catch (err) {
      console.error('Durum güncelleme hatası:', err)
      showSnackbar('Bir hata oluştu', 'error')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'logo_url',
      headerName: 'Logo',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.value || undefined}
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        >
          <Business />
        </Avatar>
      ),
    },
    { field: 'code', headerName: 'Kod', width: 100 },
    { field: 'name', headerName: 'Şirket Adı', flex: 1, minWidth: 200 },
    {
      field: 'is_active',
      headerName: 'Durum',
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={!!params.value}
          onChange={(e) => handleStatusChange(params.row.id as string, e.target.checked)}
          color="success"
          size="small"
        />
      ),
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
            onClick={() => handleEdit(params.row as InsuranceCompany)}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id as string)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            🏢 Sigorta Şirketleri Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Anlaşmalı sigorta şirketlerini yönetin, logo yükleyin, çalışma prosedürlerini düzenleyin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          size="large"
        >
          Yeni Şirket Ekle
        </Button>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={companies}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{
              bgcolor: 'background.paper',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </CardContent>
      </Card>

      <InsuranceCompanyDialog
        open={dialogOpen}
        company={selectedCompany}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSaveSuccess}
      />

      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  )
}
