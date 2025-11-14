'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

type RequestStatus = 'pending' | 'processing' | 'fulfilled' | 'rejected'

interface OriginalGlassRequestFile {
  id: string
  tenant_id: string
  request_id: string
  uploader_id: string
  storage_key: string
  file_name: string
  mime_type: string
  size: number
  description: string | null
  visibility: 'tenant' | 'admin'
  created_at: string
  uploader_user?: { email?: string | null }
}

interface OriginalGlassRequestLog {
  id: string
  tenant_id: string
  request_id: string
  actor_id: string
  action: 'status_change' | 'note_added' | 'file_upload' | 'assignment_change' | 'update'
  payload: Record<string, unknown>
  created_at: string
  actor_user?: { email?: string | null }
}

interface OriginalGlassRequest {
  id: string
  case_files?: { id: string; case_number: string | null }
  request_number: string | null
  status: RequestStatus
  notes: string | null
  response_notes: string | null
  promised_delivery_date: string | null
  promised_delivery_days: number | null
  termin_date: string | null
  created_at: string
  updated_at: string
  plate: string | null
  chassis_no: string | null
  model_year: number | null
  vehicle_brand?: { name: string | null }
  vehicle_model?: { name: string | null }
  vehicle_submodel?: string | null
  glass_type?: { name: string | null }
  glass_color?: { name: string | null }
  glass_features?: string | null
  euro_code?: string | null
  glass_part_code?: string | null
  glass_price?: number | null
  discount_rate?: number | null
  currency?: string | null
  insurance_company?: { name: string | null }
  policy_number?: string | null
  policy_type?: string | null
  insured_name?: string | null
  insured_phone?: string | null
  claim_number?: string | null
  files: OriginalGlassRequestFile[]
  logs: OriginalGlassRequestLog[]
  dealer_user?: { email?: string | null }
  assigned_admin_user?: { email?: string | null }
  assigned_admin_id?: string | null
  dealer_user_id?: string
}

const STATUS_INFO: Record<RequestStatus, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> =
  {
    pending: { label: 'Beklemede', color: 'warning' },
    processing: { label: 'İşlemde', color: 'info' },
    fulfilled: { label: 'Tamamlandı', color: 'success' },
    rejected: { label: 'Reddedildi', color: 'error' },
  }

const TAB_KEYS = ['details', 'files', 'logs'] as const

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR')
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('tr-TR')
}

const formatCurrency = (value?: number | null, currency = 'TRY') => {
  if (value == null) return '-'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    minimumFractionDigits: 2,
  }).format(value)
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const toDateInput = (value?: string | null) => {
  if (!value) return ''
  return value.includes('T') ? value.split('T')[0] : value
}

interface AdminUserOption {
  userId: string
  email: string
}

interface OriginalGlassRequestDetailProps {
  requestId: string
  currentUserId: string
  role: 'admin' | 'bayi'
  adminUsers?: AdminUserOption[]
}

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'pending', label: 'Beklemede' },
  { value: 'processing', label: 'İşlemde' },
  { value: 'fulfilled', label: 'Tamamlandı' },
  { value: 'rejected', label: 'Reddedildi' },
]

export function OriginalGlassRequestDetail({ requestId, currentUserId, role, adminUsers }: OriginalGlassRequestDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const adminOptions = adminUsers ?? []

  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<OriginalGlassRequest | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [adminForm, setAdminForm] = useState({
    status: 'pending' as RequestStatus,
    assigned_admin_id: '',
    promised_delivery_days: '',
    termin_date: '',
    response_notes: '',
  })
  const [adminSaving, setAdminSaving] = useState(false)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const index = tabParam ? TAB_KEYS.indexOf(tabParam as typeof TAB_KEYS[number]) : -1
    if (index >= 0 && index !== activeTab) {
      setActiveTab(index)
    }
    if (!tabParam && activeTab !== 0) {
      setActiveTab(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const showMessage = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/original-glass-requests/${requestId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kayıt getirilemedi')
      }

      setRequest(result.data as OriginalGlassRequest)
    } catch (err) {
      console.error('Talep detay yüklenemedi:', err)
      setError(err instanceof Error ? err.message : 'Talep detayları getirilemedi')
    } finally {
      setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  useEffect(() => {
    if (role === 'admin' && request) {
      setAdminForm({
        status: request.status,
        assigned_admin_id: request.assigned_admin_id || '',
        promised_delivery_days:
          request.promised_delivery_days != null ? String(request.promised_delivery_days) : '',
        termin_date: toDateInput(request.termin_date || request.promised_delivery_date),
        response_notes: request.response_notes || '',
      })
    }
  }, [role, request])

  const handleRefresh = () => {
    fetchRequest()
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    const key = TAB_KEYS[newValue]
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'details') {
      params.delete('tab')
    } else {
      params.set('tab', key)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleAdminStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm((prev) => ({ ...prev, status: event.target.value as RequestStatus }))
  }

  const handleAdminAssignChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm((prev) => ({ ...prev, assigned_admin_id: event.target.value }))
  }

  const handleAdminInputChange = (field: 'promised_delivery_days' | 'termin_date' | 'response_notes') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAdminForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleAdminSave = async () => {
    if (!request) return
    try {
      setAdminSaving(true)
      const payload = {
        status: adminForm.status,
        assigned_admin_id: adminForm.assigned_admin_id || null,
        response_notes: adminForm.response_notes || null,
        promised_delivery_days: adminForm.promised_delivery_days
          ? Number(adminForm.promised_delivery_days)
          : null,
        termin_date: adminForm.termin_date || null,
      }

      const response = await fetch(`/api/original-glass-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Talep güncellenemedi')
      }

      showMessage('Talep bilgileri güncellendi.', 'success')
      fetchRequest()
    } catch (error) {
      console.error('Talep güncellenemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Talep güncellenemedi',
        'error'
      )
    } finally {
      setAdminSaving(false)
    }
  }

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    setSelectedFiles(Array.from(files))
  }

  const resetUploadState = () => {
    setSelectedFiles([])
    setDescription('')
    setUploading(false)
    setUploadDialogOpen(false)
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      showMessage('Lütfen en az bir dosya seçin.', 'error')
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

    for (const file of selectedFiles) {
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
      setUploading(true)
      const formData = new FormData()
      if (description) {
        formData.append('description', description)
      }
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/original-glass-requests/${requestId}/files`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Dosya yüklenemedi')
      }

      showMessage('Dosya yükleme işlemi tamamlandı.', 'success')

      setTimeout(() => {
        resetUploadState()
        fetchRequest()
      }, 500)
    } catch (error) {
      console.error('Dosya yüklenemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu',
        'error'
      )
      setUploading(false)
    }
  }

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(
        `/api/original-glass-requests/${requestId}/files/${fileId}/url`
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Dosya bağlantısı oluşturulamadı')
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

  const handleDelete = async (fileId: string) => {
    if (!confirm('Dosyayı silmek istediğinize emin misiniz?')) return

    try {
      const response = await fetch(
        `/api/original-glass-requests/${requestId}/files/${fileId}`,
        { method: 'DELETE' }
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Dosya silinemedi')
      }
      showMessage('Dosya silindi.', 'success')
      fetchRequest()
    } catch (error) {
      console.error('Dosya silinemedi:', error)
      showMessage(
        error instanceof Error ? error.message : 'Dosya silinemedi',
        'error'
      )
    }
  }

  const canDeleteFile = (file: OriginalGlassRequestFile) =>
    role === 'admin' || file.uploader_id === currentUserId

  const renderDetailField = (label: string, value: string | number | null | undefined) => (
    <Grid item xs={12} md={6}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {value ?? '-'}
      </Typography>
    </Grid>
  )

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Talep yükleniyor...
        </Typography>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Yeniden Dene
        </Button>
      </Stack>
    )
  }

  if (!request) {
    return (
      <Alert severity="warning">
        Talep kaydı bulunamadı. Lütfen liste üzerinden tekrar deneyiniz.
      </Alert>
    )
  }

  const statusInfo = STATUS_INFO[request.status]

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {request.request_number || 'Talep Detayı'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Chip label={statusInfo.label} color={statusInfo.color} />
            <Typography variant="body2" color="text.secondary">
              Dosya No: {request.case_files?.case_number || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Oluşturma: {formatDateTime(request.created_at)}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => {
              setUploadDialogOpen(true)
              setActiveTab(1)
            }}
          >
            Dosya Yükle
          </Button>
        </Stack>
      </Stack>

      {role === 'admin' && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Yönetim Güncellemesi
            </Typography>
            <Alert severity="info">
              Talep durumunu güncelleyebilir, admin atanabilir ve geri bildirim notu bırakabilirsiniz.
            </Alert>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Durum"
                value={adminForm.status}
                onChange={handleAdminStatusChange}
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
                value={adminForm.assigned_admin_id}
                onChange={handleAdminAssignChange}
                fullWidth
              >
                <MenuItem value="">Seçilmedi</MenuItem>
                {(role === 'admin' ? adminOptions : []).map((admin) => (
                  <MenuItem key={admin.userId} value={admin.userId}>
                    {admin.email}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Termin Günü (Gün)"
                type="number"
                value={adminForm.promised_delivery_days}
                onChange={handleAdminInputChange('promised_delivery_days')}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Termin Tarihi"
                type="date"
                value={adminForm.termin_date}
                onChange={handleAdminInputChange('termin_date')}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              label="Geri Bildirim Notu"
              multiline
              minRows={3}
              value={adminForm.response_notes}
              onChange={handleAdminInputChange('response_notes')}
              fullWidth
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleRefresh} disabled={adminSaving}>
                Yenile
              </Button>
              <Button
                variant="contained"
                onClick={handleAdminSave}
                disabled={adminSaving}
              >
                Güncelle
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined">
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Talep Bilgisi" />
          <Tab label={`Dosyalar (${request.files.length})`} />
          <Tab label={`Loglar (${request.logs.length})`} />
        </Tabs>

        <Divider />

        {/* Detay Tabı */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Genel Bilgiler
            </Typography>
            <Grid container spacing={2}>
              {renderDetailField('Talep No', request.request_number)}
              {renderDetailField('Dosya No', request.case_files?.case_number)}
              {renderDetailField('Durum', statusInfo.label)}
              {renderDetailField(
                'Termin Tarihi',
                formatDate(request.promised_delivery_date || request.termin_date)
              )}
              {renderDetailField(
                'Taahhüt Gün Sayısı',
                request.promised_delivery_days != null ? `${request.promised_delivery_days} gün` : '-'
              )}
              {renderDetailField('Bayi Kullanıcısı', request.dealer_user?.email || '-')}
              {renderDetailField('Atanan Admin', request.assigned_admin_user?.email || '-')}
            </Grid>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom mt={4}>
              Araç Bilgileri
            </Typography>
            <Grid container spacing={2}>
              {renderDetailField('Plaka', request.plate)}
              {renderDetailField('Şasi No', request.chassis_no)}
              {renderDetailField('Model Yılı', request.model_year)}
              {renderDetailField('Marka', request.vehicle_brand?.name)}
              {renderDetailField('Model', request.vehicle_model?.name)}
              {renderDetailField('Alt Model', request.vehicle_submodel)}
            </Grid>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom mt={4}>
              Cam Bilgileri
            </Typography>
            <Grid container spacing={2}>
              {renderDetailField('Cam Tipi', request.glass_type?.name)}
              {renderDetailField('Cam Rengi', request.glass_color?.name)}
              {renderDetailField('Özellikler', request.glass_features)}
              {renderDetailField('Euro Kod', request.euro_code)}
              {renderDetailField('Parça Kodu', request.glass_part_code)}
              {renderDetailField('Fiyat', formatCurrency(request.glass_price, request.currency || 'TRY'))}
              {renderDetailField(
                'İskonto',
                request.discount_rate != null ? `% ${request.discount_rate}` : '-'
              )}
              {renderDetailField('Para Birimi', request.currency)}
            </Grid>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom mt={4}>
              Sigorta Bilgileri
            </Typography>
            <Grid container spacing={2}>
              {renderDetailField('Sigorta Şirketi', request.insurance_company?.name)}
              {renderDetailField('Poliçe No', request.policy_number)}
              {renderDetailField('Poliçe Tipi', request.policy_type)}
              {renderDetailField('Sigortalı Adı', request.insured_name)}
              {renderDetailField(
                'Sigortalı Telefonu',
                request.insured_phone ? request.insured_phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4') : '-'
              )}
              {renderDetailField('Hasar / Dosya No', request.claim_number)}
            </Grid>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom mt={4}>
              Notlar
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Bayi Notları
                </Typography>
                <Typography variant="body1">{request.notes || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Admin Geri Bildirimi
                </Typography>
                <Typography variant="body1">{request.response_notes || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Dosyalar Tabı */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Yüklenen Dosyalar
              </Typography>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Dosya Yükle
              </Button>
            </Stack>

            {request.files.length === 0 ? (
              <Alert severity="info">Bu talebe ait henüz dosya yüklenmemiş.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dosya Adı</TableCell>
                    <TableCell>Boyut</TableCell>
                    <TableCell>Yükleyen</TableCell>
                    <TableCell>Yüklenme Tarihi</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {request.files.map((file) => (
                    <TableRow key={file.id} hover>
                      <TableCell>{file.file_name}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{file.uploader_user?.email || file.uploader_id}</TableCell>
                      <TableCell>{formatDateTime(file.created_at)}</TableCell>
                      <TableCell>{file.description || '-'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" color="primary" onClick={() => handleDownload(file.id)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          {canDeleteFile(file) && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(file.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* Loglar Tabı */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              İşlem Geçmişi
            </Typography>

            {request.logs.length === 0 ? (
              <Alert severity="info">Henüz log kaydı bulunmuyor.</Alert>
            ) : (
              <Stack spacing={2}>
                {request.logs.map((log) => (
                  <Paper key={log.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formatDateTime(log.created_at)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {log.actor_user?.email || log.actor_id}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      İşlem: {log.action.replace('_', ' ')}
                    </Typography>
                    {log.payload && (
                      <Box
                        component="pre"
                        sx={{
                          mt: 1,
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          p: 1.5,
                          fontSize: '0.85rem',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(log.payload, null, 2)}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={uploadDialogOpen} onClose={resetUploadState} fullWidth maxWidth="sm">
        <DialogTitle>Dosya Yükle</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              type="file"
              inputProps={{ multiple: true, accept: '.pdf,.jpg,.jpeg,.png,.docx,.xlsx' }}
              onChange={handleFileSelection}
              fullWidth
            />
            <TextField
              label="Açıklama"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            {selectedFiles.length > 0 && (
              <Alert severity="info">
                {selectedFiles.length} dosya seçildi. Maksimum 10MB ve sadece PDF, JPG, PNG, DOCX, XLSX
                dosyaları desteklenir.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetUploadState} disabled={uploading}>
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
            onClick={handleUpload}
            disabled={uploading}
          >
            Yükle
          </Button>
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
