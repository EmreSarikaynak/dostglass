'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  TaskAlt as TaskAltIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material'
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid'
import { format } from 'date-fns'

type RequestStatus = 'pending' | 'processing' | 'fulfilled' | 'rejected'

interface ReasonOption {
  id: string
  name: string
}

interface UserOption {
  userId: string
  email: string
}

interface AdminOriginalGlassRequestListProps {
  reasons: ReasonOption[]
  dealers: UserOption[]
  admins: UserOption[]
}

interface OriginalGlassRequestRow {
  id: string
  case_files?: { case_number: string | null }
  request_number: string | null
  status: RequestStatus
  created_at: string
  promised_delivery_date: string | null
  termin_date: string | null
  dealer_user_id: string
  dealer_user?: { email?: string | null }
  assigned_admin_id?: string | null
  assigned_admin_user?: { email?: string | null }
  response_notes?: string | null
  promised_delivery_days?: number | null
}

interface OriginalGlassRequestFile {
  id: string
  file_name: string
  mime_type: string
  size: number
  description: string | null
  uploader_id: string
  created_at: string
  visibility: 'tenant' | 'admin'
}

interface StatusFormState {
  status: RequestStatus
  assigned_admin_id: string
  promised_delivery_days: string
  termin_date: string
  response_notes: string
}

const STATUS_INFO: Record<RequestStatus, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> =
  {
    pending: { label: 'Beklemede', color: 'warning' },
    processing: { label: 'İşlemde', color: 'info' },
    fulfilled: { label: 'Tamamlandı', color: 'success' },
    rejected: { label: 'Reddedildi', color: 'error' },
  }

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'pending', label: 'Beklemede' },
  { value: 'processing', label: 'İşlemde' },
  { value: 'fulfilled', label: 'Tamamlandı' },
  { value: 'rejected', label: 'Reddedildi' },
]

const filterStatusOptions = [
  { value: 'all', label: 'Tümü' },
  ...STATUS_OPTIONS.map((status) => ({ value: status.value, label: status.label })),
]

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR')
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('tr-TR')
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminOriginalGlassRequestList({ reasons, dealers, admins }: AdminOriginalGlassRequestListProps) {
  const router = useRouter()

  const [filters, setFilters] = useState({
    status: 'all' as 'all' | RequestStatus,
    dealerId: '',
    requestReasonId: '',
    from: '',
    to: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  const [rows, setRows] = useState<OriginalGlassRequestRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  })

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusForm, setStatusForm] = useState<StatusFormState>({
    status: 'pending',
    assigned_admin_id: '',
    promised_delivery_days: '',
    termin_date: '',
    response_notes: '',
  })
  const [statusSaving, setStatusSaving] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<OriginalGlassRequestRow | null>(null)

  const [filesDialogOpen, setFilesDialogOpen] = useState(false)
  const [filesLoading, setFilesLoading] = useState(false)
  const [fileList, setFileList] = useState<OriginalGlassRequestFile[]>([])
  const [fileUploadDescription, setFileUploadDescription] = useState('')
  const [fileUploadQueue, setFileUploadQueue] = useState<File[]>([])
  const [fileUploading, setFileUploading] = useState(false)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const showMessage = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: String(paginationModel.pageSize),
        offset: String(paginationModel.page * paginationModel.pageSize),
      })

      if (appliedFilters.status !== 'all') params.append('status', appliedFilters.status)
      if (appliedFilters.dealerId) params.append('dealer_id', appliedFilters.dealerId)
      if (appliedFilters.requestReasonId) params.append('request_reason_id', appliedFilters.requestReasonId)
      if (appliedFilters.from) params.append('from', appliedFilters.from)
      if (appliedFilters.to) params.append('to', appliedFilters.to)

      const response = await fetch(`/api/admin/original-glass-requests?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Talepler getirilemedi')
      }

      setRows(result.data || [])
      setTotalCount(result.pagination?.total ?? 0)
    } catch (error) {
      console.error('Admin talep listesi yüklenemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Talep listesi yüklenemedi',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, paginationModel.page, paginationModel.pageSize])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleFilterChange = (field: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({ ...prev, status: event.target.value as 'all' | RequestStatus }))
  }

  const applyFilters = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
    setAppliedFilters(filters)
  }

  const resetFilters = () => {
    const reset = { status: 'all' as 'all' | RequestStatus, dealerId: '', requestReasonId: '', from: '', to: '' }
    setFilters(reset)
    setAppliedFilters(reset)
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
  }

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams()
      params.append('format', 'csv')
      if (appliedFilters.status !== 'all') params.append('status', appliedFilters.status)
      if (appliedFilters.dealerId) params.append('dealer_id', appliedFilters.dealerId)
      if (appliedFilters.requestReasonId) params.append('request_reason_id', appliedFilters.requestReasonId)
      if (appliedFilters.from) params.append('from', appliedFilters.from)
      if (appliedFilters.to) params.append('to', appliedFilters.to)

      const response = await fetch(`/api/admin/original-glass-requests?${params.toString()}`)
      const csvText = await response.text()
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `original-glass-requests_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showMessage('CSV dosyası indirildi.', 'success')
    } catch (error) {
      console.error('CSV dışa aktarma hatası:', error)
      showMessage('CSV dosyası oluşturulamadı.', 'error')
    }
  }

  const openStatusDialog = (row: OriginalGlassRequestRow) => {
    setSelectedRequest(row)
    setStatusForm({
      status: row.status,
      assigned_admin_id: row.assigned_admin_id || '',
      promised_delivery_days: row.promised_delivery_days != null ? String(row.promised_delivery_days) : '',
      termin_date: row.termin_date || '',
      response_notes: row.response_notes || '',
    })
    setStatusDialogOpen(true)
  }

  const closeStatusDialog = () => {
    if (!statusSaving) {
      setStatusDialogOpen(false)
      setSelectedRequest(null)
    }
  }

  const handleStatusFormChange =
    (field: keyof StatusFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setStatusForm((prev) => ({ ...prev, [field]: value }))
    }

  const handleStatusSelectChange =
    (field: keyof StatusFormState) => (event: SelectChangeEvent) => {
      setStatusForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const saveStatusUpdate = async () => {
    if (!selectedRequest) return
    try {
      setStatusSaving(true)
      const payload = {
        status: statusForm.status,
        assigned_admin_id: statusForm.assigned_admin_id || null,
        response_notes: statusForm.response_notes || null,
        promised_delivery_days: statusForm.promised_delivery_days
          ? Number(statusForm.promised_delivery_days)
          : null,
        termin_date: statusForm.termin_date || null,
      }

      const response = await fetch(`/api/original-glass-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Talep güncellenemedi')
      }

      showMessage('Talep durumu güncellendi.', 'success')
      setStatusDialogOpen(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (error) {
      console.error('Durum güncellenemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Talep güncellenemedi',
        'error'
      )
    } finally {
      setStatusSaving(false)
    }
  }

  const openFilesDialog = async (row: OriginalGlassRequestRow) => {
    setSelectedRequest(row)
    setFilesDialogOpen(true)
    await loadFiles(row.id)
  }

  const loadFiles = async (requestId: string) => {
    try {
      setFilesLoading(true)
      const response = await fetch(`/api/original-glass-requests/${requestId}/files`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Dosyalar getirilemedi')
      }
      setFileList(result.data || [])
    } catch (error) {
      console.error('Dosyalar getirilemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Dosyalar getirilemedi',
        'error'
      )
    } finally {
      setFilesLoading(false)
    }
  }

  const closeFilesDialog = () => {
    if (fileUploading) return
    setFilesDialogOpen(false)
    setSelectedRequest(null)
    setFileUploadDescription('')
    setFileUploadQueue([])
  }

  const handleFileQueueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    setFileUploadQueue(Array.from(files))
  }

  const uploadFiles = async () => {
    if (!selectedRequest || fileUploadQueue.length === 0) {
      showMessage('Lütfen yüklemek için dosya seçin.', 'error')
      return
    }

    const maxSize = 10 * 1024 * 1024
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    for (const file of fileUploadQueue) {
      if (file.size > maxSize) {
        showMessage(`${file.name} dosyası 10MB limitini aşıyor.`, 'error')
        return
      }
      if (!allowedTypes.includes(file.type)) {
        showMessage(`${file.name} dosya tipi desteklenmiyor.`, 'error')
        return
      }
    }

    try {
      setFileUploading(true)
      const formData = new FormData()
      if (fileUploadDescription) {
        formData.append('description', fileUploadDescription)
      }
      fileUploadQueue.forEach((file) => formData.append('files', file))

      const response = await fetch(`/api/original-glass-requests/${selectedRequest.id}/files`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Dosya yüklenemedi')
      }
      showMessage('Dosyalar yüklendi.', 'success')
      setFileUploadQueue([])
      setFileUploadDescription('')
      loadFiles(selectedRequest.id)
    } catch (error) {
      console.error('Dosya yüklenemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Dosya yüklenemedi',
        'error'
      )
    } finally {
      setFileUploading(false)
    }
  }

  const downloadFile = async (fileId: string) => {
    if (!selectedRequest) return
    try {
      const response = await fetch(
        `/api/original-glass-requests/${selectedRequest.id}/files/${fileId}/url`
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Dosya indirilemedi')
      }
      window.open(result.url, '_blank')
    } catch (error) {
      console.error('Dosya indirilemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Dosya indirilemedi',
        'error'
      )
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!selectedRequest) return
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return
    try {
      const response = await fetch(
        `/api/original-glass-requests/${selectedRequest.id}/files/${fileId}`,
        { method: 'DELETE' }
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Dosya silinemedi')
      }
      showMessage('Dosya silindi.', 'success')
      loadFiles(selectedRequest.id)
    } catch (error) {
      console.error('Dosya silinemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Dosya silinemedi',
        'error'
      )
    }
  }

  const columns = useMemo<GridColDef<OriginalGlassRequestRow>[]>(
    () => [
      {
        field: 'actions',
        headerName: 'İşlemler',
        width: 220,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon fontSize="small" />}
              onClick={() => router.push(`/admin/orjinal-cam-talepleri/${params.row.id}`)}
            >
              Görüntüle
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<TaskAltIcon fontSize="small" />}
              onClick={() => openStatusDialog(params.row)}
            >
              Durum
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FolderIcon fontSize="small" />}
              onClick={() => openFilesDialog(params.row)}
            >
              Dosyalar
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
        field: 'dealer_user',
        headerName: 'Bayi',
        width: 200,
        valueGetter: (_value, row) => row.dealer_user?.email ?? row.dealer_user_id,
      },
      {
        field: 'status',
        headerName: 'Durum',
        width: 140,
        renderCell: (params) => {
          const statusInfo = STATUS_INFO[params.value as RequestStatus]
          return <Chip size="small" label={statusInfo.label} color={statusInfo.color} />
        },
      },
      {
        field: 'created_at',
        headerName: 'Oluşturma',
        width: 170,
        valueGetter: (value) => formatDateTime(value as string),
      },
      {
        field: 'assigned_admin_user',
        headerName: 'Atanan Admin',
        width: 180,
        valueGetter: (_value, row) => row.assigned_admin_user?.email ?? '-',
      },
      {
        field: 'termin_date',
        headerName: 'Termin Tarihi',
        width: 150,
        valueGetter: (value, row) =>
          formatDate(row.promised_delivery_date ?? (value as string | null)),
      },
    ],
    [router]
  )

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Orijinal Cam Talepleri
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm bayilerden gelen orijinal cam taleplerini yönetin, durum güncelleyin ve dosyaları yönetin.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRequests} disabled={loading}>
            Yenile
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/bayi/orjinal-cam-talebi/new')}>
            Yeni Talep Oluştur
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
            CSV Dışa Aktar
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Filtreler
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              size="small"
              label="Durum"
              value={filters.status}
              onChange={handleStatusFilterChange}
              fullWidth
            >
              {filterStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              size="small"
              label="Bayi"
              value={filters.dealerId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, dealerId: event.target.value }))
              }
              fullWidth
            >
              <MenuItem value="">Tümü</MenuItem>
              {dealers.map((dealer) => (
                <MenuItem key={dealer.userId} value={dealer.userId}>
                  {dealer.email}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              size="small"
              label="Talep Sebebi"
              value={filters.requestReasonId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, requestReasonId: event.target.value }))
              }
              fullWidth
            >
              <MenuItem value="">Tümü</MenuItem>
              {reasons.map((reason) => (
                <MenuItem key={reason.id} value={reason.id}>
                  {reason.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              size="small"
              label="Başlangıç"
              type="date"
              value={filters.from}
              onChange={handleFilterChange('from')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              size="small"
              label="Bitiş"
              type="date"
              value={filters.to}
              onChange={handleFilterChange('to')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="contained" onClick={applyFilters}>
                Filtrele
              </Button>
              <Button variant="text" onClick={resetFilters}>
                Temizle
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Card variant="outlined">
        <CardContent>
          <DataGrid
            autoHeight
            disableRowSelectionOnClick
            rows={rows}
            columns={columns}
            rowCount={totalCount}
            loading={loading}
            pageSizeOptions={[10, 20, 50]}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
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

      {/* Durum Güncelleme Diyaloğu */}
      <Dialog open={statusDialogOpen} onClose={closeStatusDialog} fullWidth maxWidth="sm">
        <DialogTitle>Durum Güncelle</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Durum"
              value={statusForm.status}
              onChange={handleStatusSelectChange('status')}
              fullWidth
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Atanan Admin"
              value={statusForm.assigned_admin_id}
              onChange={handleStatusSelectChange('assigned_admin_id')}
              fullWidth
            >
              <MenuItem value="">Seçilmedi</MenuItem>
              {admins.map((admin) => (
                <MenuItem key={admin.userId} value={admin.userId}>
                  {admin.email}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Termin Günü (Gün)"
                type="number"
                value={statusForm.promised_delivery_days}
                onChange={handleStatusFormChange('promised_delivery_days')}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Termin Tarihi"
                type="date"
                value={statusForm.termin_date}
                onChange={handleStatusFormChange('termin_date')}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              label="Geri Bildirim Notu"
              multiline
              minRows={3}
              value={statusForm.response_notes}
              onChange={handleStatusFormChange('response_notes')}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} disabled={statusSaving}>
            Kapat
          </Button>
          <Button
            onClick={saveStatusUpdate}
            variant="contained"
            startIcon={<TaskAltIcon />}
            disabled={statusSaving}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dosyalar Diyaloğu */}
      <Dialog open={filesDialogOpen} onClose={closeFilesDialog} fullWidth maxWidth="md">
        <DialogTitle>Talep Dosyaları</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Stack spacing={2}>
              <Alert severity="info">
                {selectedRequest.request_number || selectedRequest.case_files?.case_number} talebine ait dosyalar.
              </Alert>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  type="file"
                  inputProps={{ multiple: true, accept: '.pdf,.jpg,.jpeg,.png,.docx,.xlsx' }}
                  onChange={handleFileQueueChange}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={uploadFiles}
                  disabled={fileUploading}
                >
                  Yükle
                </Button>
              </Stack>
              <TextField
                label="Dosya Açıklaması"
                value={fileUploadDescription}
                onChange={(event) => setFileUploadDescription(event.target.value)}
                fullWidth
              />
              {fileUploadQueue.length > 0 && (
                <Alert severity="info">
                  {fileUploadQueue.length} dosya seçildi. Maksimum 10MB ve PDF, JPG, PNG, DOCX, XLSX
                  formatları desteklenir.
                </Alert>
              )}

              {filesLoading ? (
                <Alert severity="info">Dosyalar yükleniyor...</Alert>
              ) : fileList.length === 0 ? (
                <Alert severity="warning">Henüz dosya yüklenmemiş.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dosya</TableCell>
                      <TableCell>Boyut</TableCell>
                      <TableCell>Yükleyen</TableCell>
                      <TableCell>Yüklenme Tarihi</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fileList.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.file_name}</TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>{file.uploader_id}</TableCell>
                        <TableCell>{formatDateTime(file.created_at)}</TableCell>
                        <TableCell>{file.description || '-'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" color="primary" onClick={() => downloadFile(file.id)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteFile(file.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFilesDialog}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 2000 : 4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Stack>
  )
}
