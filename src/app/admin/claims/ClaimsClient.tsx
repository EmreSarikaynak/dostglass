'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'

interface Claim {
  id: string
  claim_number: string
  status: string
  policy_number: string
  vehicle_plate: string
  incident_date: string
  created_at: string
  insurance_companies: { name: string }
  incident_types: { name: string }
  damage_types: { name: string }
  vehicle_brands: { name: string }
  vehicle_models: { name: string }
  claim_items: Record<string, unknown>[]
}

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  draft: { label: 'Taslak', color: 'default' },
  submitted: { label: 'Gönderildi', color: 'info' },
  in_progress: { label: 'İşlemde', color: 'warning' },
  completed: { label: 'Tamamlandı', color: 'success' },
  cancelled: { label: 'İptal', color: 'error' }
}

export default function ClaimsClient() {
  const router = useRouter()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25
  })
  const [totalCount, setTotalCount] = useState(0)

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1),
        limit: String(paginationModel.pageSize)
      })

      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }

      const response = await fetch(`/api/claims?${params}`)
      const result = await response.json()

      if (response.ok) {
        setClaims(result.data)
        setTotalCount(result.pagination.total)
      } else {
        console.error('İhbarlar yüklenirken hata:', result.error)
      }
    } catch (error) {
      console.error('İhbarlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, filterStatus])

  const handleView = (id: string) => {
    router.push(`/admin/claims/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/claims/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ihbarı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/claims/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchClaims()
      } else {
        const result = await response.json()
        alert(result.error || 'İhbar silinemedi')
      }
    } catch (error) {
      console.error('İhbar silme hatası:', error)
      alert('İhbar silinirken bir hata oluştu')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Görüntüle">
            <IconButton size="small" color="info" onClick={() => handleView(params.row.id)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Düzenle">
            <IconButton size="small" color="primary" onClick={() => handleEdit(params.row.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    },
    {
      field: 'claim_number',
      headerName: 'İhbar No',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 130,
      renderCell: (params) => {
        const statusInfo = STATUS_LABELS[params.value] || { label: params.value, color: 'default' }
        return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
      }
    },
    {
      field: 'insurance_companies',
      headerName: 'Sigorta Şirketi',
      width: 180,
      valueGetter: (value: any) => value?.name || '-'
    },
    {
      field: 'policy_number',
      headerName: 'Poliçe No',
      width: 140
    },
    {
      field: 'vehicle_plate',
      headerName: 'Plaka',
      width: 120
    },
    {
      field: 'vehicle_brands',
      headerName: 'Araç Marka',
      width: 130,
      valueGetter: (value: any) => value?.name || '-'
    },
    {
      field: 'vehicle_models',
      headerName: 'Araç Model',
      width: 130,
      valueGetter: (value: any) => value?.name || '-'
    },
    {
      field: 'incident_types',
      headerName: 'Olay Türü',
      width: 130,
      valueGetter: (value: any) => value?.name || '-'
    },
    {
      field: 'damage_types',
      headerName: 'Hasar Türü',
      width: 130,
      valueGetter: (value: any) => value?.name || '-'
    },
    {
      field: 'incident_date',
      headerName: 'Olay Tarihi',
      width: 120,
      valueGetter: (value: any) => value ? new Date(value as string).toLocaleDateString('tr-TR') : '-'
    },
    {
      field: 'created_at',
      headerName: 'Oluşturma Tarihi',
      width: 150,
      valueGetter: (value: any) => new Date(value as string).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          İhbarlar
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchClaims}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/admin/claims/new')}
          >
            Yeni İhbar
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            label="Durum"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="draft">Taslak</MenuItem>
            <MenuItem value="submitted">Gönderildi</MenuItem>
            <MenuItem value="in_progress">İşlemde</MenuItem>
            <MenuItem value="completed">Tamamlandı</MenuItem>
            <MenuItem value="cancelled">İptal</MenuItem>
          </TextField>
        </Stack>
      </Card>

      {/* DataGrid */}
      <Card>
        <DataGrid
          rows={claims}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={totalCount}
          paginationMode="server"
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        />
      </Card>
    </Box>
  )
}

