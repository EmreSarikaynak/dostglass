'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid'
import { Add as AddIcon, Visibility as VisibilityIcon, CloudUpload as UploadIcon, Refresh as RefreshIcon } from '@mui/icons-material'

type RequestStatus = 'pending' | 'processing' | 'fulfilled' | 'rejected'

interface OriginalGlassRequestRow {
  id: string
  case_files?: { id: string; case_number: string | null }
  request_number: string | null
  created_at: string
  status: RequestStatus
  vehicle_brand?: { id: string; name: string | null }
  vehicle_model?: { id: string; name: string | null }
  promised_delivery_date: string | null
}

const STATUS_OPTIONS: { value: 'all' | RequestStatus; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'processing', label: 'İşlemde' },
  { value: 'fulfilled', label: 'Tamamlandı' },
  { value: 'rejected', label: 'Reddedildi' },
]

const STATUS_LABELS: Record<RequestStatus, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  pending: { label: 'Beklemede', color: 'warning' },
  processing: { label: 'İşlemde', color: 'info' },
  fulfilled: { label: 'Tamamlandı', color: 'success' },
  rejected: { label: 'Reddedildi', color: 'error' },
}

export function OriginalGlassRequestList() {
  const router = useRouter()
  const [rows, setRows] = useState<OriginalGlassRequestRow[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [totalCount, setTotalCount] = useState(0)

  const fetchRequests = useMemo(
    () => async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          limit: String(paginationModel.pageSize),
          offset: String(paginationModel.page * paginationModel.pageSize),
        })

        if (statusFilter !== 'all') {
          params.append('status', statusFilter)
        }

        const response = await fetch(`/api/original-glass-requests?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Talepler getirilemedi')
        }

        setRows(result.data || [])
        setTotalCount(result.pagination?.total ?? 0)
      } catch (error) {
        console.error('Talep listesi yüklenemedi:', error)
      } finally {
        setLoading(false)
      }
    },
    [paginationModel.pageSize, paginationModel.page, statusFilter]
  )

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as 'all' | RequestStatus)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const columns = useMemo<GridColDef<OriginalGlassRequestRow>[]>(
    () => [
      {
        field: 'actions',
        headerName: 'İşlemler',
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon fontSize="small" />}
              onClick={() => router.push(`/bayi/orjinal-cam-talep/${params.row.id}`)}
            >
              Detay
            </Button>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<UploadIcon fontSize="small" />}
              onClick={() => router.push(`/bayi/orjinal-cam-talep/${params.row.id}?tab=files`)}
            >
              Dosya
            </Button>
          </Stack>
        ),
      },
      {
        field: 'case_files.case_number',
        headerName: 'Dosya No',
        width: 140,
        valueGetter: (_value, row) => row.case_files?.case_number ?? '-',
      },
      {
        field: 'request_number',
        headerName: 'Talep No',
        width: 140,
        valueGetter: (value) => value ?? '-',
      },
      {
        field: 'created_at',
        headerName: 'Oluşturma',
        width: 160,
        valueGetter: (value) =>
          value ? new Date(value as string).toLocaleString('tr-TR') : '-',
      },
      {
        field: 'status',
        headerName: 'Durum',
        width: 140,
        renderCell: (params) => {
          const statusInfo = STATUS_LABELS[params.value as RequestStatus]
          return <Chip size="small" label={statusInfo.label} color={statusInfo.color} />
        },
      },
      {
        field: 'vehicle',
        headerName: 'Araç',
        width: 220,
        valueGetter: (_value, row) => {
          const brand = row.vehicle_brand?.name || '-'
          const model = row.vehicle_model?.name || ''
          return `${brand}${model ? ` / ${model}` : ''}`
        },
      },
      {
        field: 'promised_delivery_date',
        headerName: 'Teslim Tarihi',
        width: 160,
        valueGetter: (value) =>
          value ? new Date(value as string).toLocaleDateString('tr-TR') : '-',
      },
    ],
    [router]
  )

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Orijinal Cam Taleplerim
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aktif ve geçmiş tüm orijinal cam taleplerinizi buradan yönetebilirsiniz.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <FormControl size="small">
            <InputLabel>Durum</InputLabel>
            <Select
              label="Durum"
              value={statusFilter}
              onChange={handleStatusChange}
              sx={{ minWidth: 160 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRequests}
            disabled={loading}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/bayi/orjinal-cam-talebi/new')}
          >
            Yeni Talep
          </Button>
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <DataGrid
            autoHeight
            disableRowSelectionOnClick
            rows={rows}
            rowCount={totalCount}
            columns={columns}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            pageSizeOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.default',
                fontWeight: 600,
              },
            }}
          />
        </CardContent>
      </Card>
    </Stack>
  )
}
