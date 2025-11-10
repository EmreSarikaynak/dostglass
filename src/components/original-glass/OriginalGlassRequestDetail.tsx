'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography,
  Button,
  Stack,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import type { UserWithRole } from '@/lib/auth'
import { supabaseBrowser } from '@/lib/supabaseClient'

type RequestStatus = 'pending' | 'processing' | 'fulfilled' | 'rejected'

interface OriginalGlassRequestDetailProps {
  requestId: string
  currentUserId: string
  role: 'admin' | 'bayi'
  adminUsers?: Array<{ userId: string; email: string }>
}

interface RequestData {
  id: string
  case_files?: { id: string; case_number: string | null }
  request_number: string | null
  status: RequestStatus
  created_at: string
  updated_at: string
  request_reason?: { id: string; name: string | null }
  vehicle_brand?: { id: string; name: string | null }
  vehicle_model?: { id: string; name: string | null }
  glass_type?: { id: string; name: string | null }
  glass_color?: { id: string; name: string | null }
  insurance_company?: { id: string; name: string | null }
  promised_delivery_days: number | null
  promised_delivery_date: string | null
  termin_date: string | null
  notes: string | null
  response_notes: string | null
  plate: string
  chassis_no: string | null
  model_year: number | null
  vehicle_submodel: string | null
  glass_features: string | null
  euro_code: string | null
  glass_part_code: string | null
  glass_price: number | null
  discount_rate: number | null
  currency: string | null
  policy_number: string | null
  policy_type: string | null
  insured_name: string | null
  insured_phone: string
  claim_number: string | null
  files?: Array<{
    id: string
    file_name: string
    mime_type: string
    size: number
    description: string | null
    created_at: string
    uploader_user?: { email: string | null }
  }>
  logs?: Array<{
    id: string
    action: string
    payload: any
    created_at: string
    actor_user?: { email: string | null }
  }>
  dealer_user?: { email: string | null }
  assigned_admin_user?: { email: string | null }
}

const STATUS_LABELS: Record<RequestStatus, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  pending: { label: 'Beklemede', color: 'warning' },
  processing: { label: 'İşlemde', color: 'info' },
  fulfilled: { label: 'Tamamlandı', color: 'success' },
  rejected: { label: 'Reddedildi', color: 'error' },
}

const ACTION_LABELS: Record<string, string> = {
  status_change: 'Durum Değişikliği',
  note_added: 'Not Eklendi',
  file_upload: 'Dosya Yüklendi',
  assignment_change: 'Atama Değişikliği',
  update: 'Güncelleme',
}

export function OriginalGlassRequestDetail({ requestId, currentUserId, role }: OriginalGlassRequestDetailProps) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'info'
  
  const [tabValue, setTabValue] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [request, setRequest] = useState<RequestData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [fileDescription, setFileDescription] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    notes: '',
    promised_delivery_days: '',
  })

  const supabase = useMemo(() => supabaseBrowser(), [])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/original-glass-requests/${requestId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Talep getirilemedi')
      }

      setRequest(result.data)
      setEditForm({
        notes: result.data.notes || '',
        promised_delivery_days: result.data.promised_delivery_days?.toString() || '',
      })
    } catch (error) {
      console.error('Talep detayı yüklenemedi:', error)
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequest()
  }, [requestId])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', newValue)
    window.history.replaceState({}, '', url.toString())
  }

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    try {
      setSaving(true)

      const formData = new FormData()
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file)
      })
      if (fileDescription) {
        formData.append('description', fileDescription)
      }

      const response = await fetch(`/api/original-glass-requests/${requestId}/files`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Dosya yüklenemedi')
      }

      setUploadDialogOpen(false)
      setSelectedFiles(null)
      setFileDescription('')
      await fetchRequest()
    } catch (error) {
      console.error('Dosya yükleme hatası:', error)
      setError(error instanceof Error ? error.message : 'Dosya yüklenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/original-glass-requests/${requestId}/files/${fileId}/download`)
      if (!response.ok) {
        throw new Error('Dosya indirilemedi')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Dosya indirme hatası:', error)
      setError('Dosya indirilemedi')
    }
  }

  const handleSaveEdit = async () => {
    if (!request) return

    try {
      setSaving(true)

      const payload: any = {}
      if (editForm.notes !== request.notes) {
        payload.notes = editForm.notes || null
      }
      if (editForm.promised_delivery_days !== request.promised_delivery_days?.toString()) {
        payload.promised_delivery_days = editForm.promised_delivery_days ? Number(editForm.promised_delivery_days) : null
      }

      if (Object.keys(payload).length === 0) {
        setEditMode(false)
        return
      }

      const response = await fetch(`/api/original-glass-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Güncelleme başarısız')
      }

      setRequest(result.data)
      setEditMode(false)
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      setError(error instanceof Error ? error.message : 'Güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !request) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Talep bulunamadı'}</Alert>
      </Box>
    )
  }

  const statusInfo = STATUS_LABELS[request.status]

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Talep Detayı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {request.case_files?.case_number} / {request.request_number}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            label={statusInfo.label}
            color={statusInfo.color}
          />
          {role === 'bayi' && request.status === 'pending' && !editMode && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Düzenle
            </Button>
          )}
        </Stack>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Talep Bilgileri" value="info" />
          <Tab label="Dosyalar" value="files" />
          <Tab label="Log Kayıtları" value="logs" />
        </Tabs>
      </Box>

      {tabValue === 'info' && (
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1" minWidth="300px">
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Temel Bilgiler
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Durum
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        size="small"
                        label={statusInfo.label}
                        color={statusInfo.color}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Oluşturma Tarihi
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(request.created_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Son Güncelleme
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(request.updated_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Talep Sebebi
                    </Typography>
                    <Typography variant="body1">
                      {request.request_reason?.name || '-'}
                    </Typography>
                  </Box>
                  {editMode && role === 'bayi' ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Notlar
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        disabled={saving}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Notlar
                      </Typography>
                      <Typography variant="body1">
                        {request.notes || '-'}
                      </Typography>
                    </Box>
                  )}
                  {editMode && role === 'bayi' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Termin Günü (Gün)
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={editForm.promised_delivery_days}
                        onChange={(e) => setEditForm({ ...editForm, promised_delivery_days: e.target.value })}
                        disabled={saving}
                      />
                    </Box>
                  )}
                  {editMode && role === 'bayi' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleSaveEdit}
                        disabled={saving}
                      >
                        Kaydet
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={() => setEditMode(false)}
                        disabled={saving}
                      >
                        İptal
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth="300px">
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Araç Bilgileri
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Plaka
                    </Typography>
                    <Typography variant="body1">
                      {request.plate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Marka / Model
                    </Typography>
                    <Typography variant="body1">
                      {request.vehicle_brand?.name} {request.vehicle_model?.name || ''}
                    </Typography>
                  </Box>
                  {request.vehicle_submodel && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Alt Model
                      </Typography>
                      <Typography variant="body1">
                        {request.vehicle_submodel}
                      </Typography>
                    </Box>
                  )}
                  {request.model_year && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Model Yılı
                      </Typography>
                      <Typography variant="body1">
                        {request.model_year}
                      </Typography>
                    </Box>
                  )}
                  {request.chassis_no && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Şasi No
                      </Typography>
                      <Typography variant="body1">
                        {request.chassis_no}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth="300px">
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Cam Bilgileri
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Cam Tipi
                    </Typography>
                    <Typography variant="body1">
                      {request.glass_type?.name || '-'}
                    </Typography>
                  </Box>
                  {request.glass_color?.name && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cam Rengi
                      </Typography>
                      <Typography variant="body1">
                        {request.glass_color.name}
                      </Typography>
                    </Box>
                  )}
                  {request.glass_features && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cam Özellikleri
                      </Typography>
                      <Typography variant="body1">
                        {request.glass_features}
                      </Typography>
                    </Box>
                  )}
                  {request.euro_code && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Euro Kod
                      </Typography>
                      <Typography variant="body1">
                        {request.euro_code}
                      </Typography>
                    </Box>
                  )}
                  {request.glass_part_code && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cam Parça Kodu
                      </Typography>
                      <Typography variant="body1">
                        {request.glass_part_code}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth="300px">
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Sigorta Bilgileri
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Sigorta Şirketi
                    </Typography>
                    <Typography variant="body1">
                      {request.insurance_company?.name || '-'}
                    </Typography>
                  </Box>
                  {request.policy_number && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Poliçe Numarası
                      </Typography>
                      <Typography variant="body1">
                        {request.policy_number}
                      </Typography>
                    </Box>
                  )}
                  {request.policy_type && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Poliçe Türü
                      </Typography>
                      <Typography variant="body1">
                        {request.policy_type}
                      </Typography>
                    </Box>
                  )}
                  {request.insured_name && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sigortalı Adı
                      </Typography>
                      <Typography variant="body1">
                        {request.insured_name}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Sigortalı Telefonu
                    </Typography>
                    <Typography variant="body1">
                      {request.insured_phone}
                    </Typography>
                  </Box>
                  {request.claim_number && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Hasar / Dosya No
                      </Typography>
                      <Typography variant="body1">
                        {request.claim_number}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {request.response_notes && (
            <Box flex="1 1 100%">
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Admin Notu
                  </Typography>
                  <Typography variant="body1">
                    {request.response_notes}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {(request.promised_delivery_date || request.termin_date) && (
            <Box flex="1 1 100%">
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Termin Bilgileri
                  </Typography>
                  <Stack spacing={2}>
                    {request.termin_date && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Termin Tarihi
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(request.termin_date)}
                        </Typography>
                      </Box>
                    )}
                    {request.promised_delivery_date && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Taahhüt Edilen Teslim Tarihi
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(request.promised_delivery_date)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}

      {tabValue === 'files' && (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Dosyalar
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Dosya Yükle
              </Button>
            </Stack>
            {request.files && request.files.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dosya Adı</TableCell>
                      <TableCell>Boyut</TableCell>
                      <TableCell>Yükleyen</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {request.files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.file_name}</TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>{file.uploader_user?.email || '-'}</TableCell>
                        <TableCell>{formatDate(file.created_at)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleFileDownload(file.id, file.file_name)}
                            >
                              İndir
                            </Button>
                            {file.uploader_user?.email === currentUserId && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                  // TODO: Implement file delete
                                }}
                              >
                                Sil
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Henüz dosya yüklenmemiş.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 'logs' && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Log Kayıtları
            </Typography>
            {request.logs && request.logs.length > 0 ? (
              <Stack spacing={2}>
                {request.logs.map((log) => (
                  <Paper key={log.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">
                          {ACTION_LABELS[log.action] || log.action}
                        </Typography>
                        {log.payload && typeof log.payload === 'object' && (
                          <Box mt={1}>
                            {Object.entries(log.payload).map(([key, value]) => (
                              <Typography key={key} variant="body2" component="div">
                                <strong>{key}:</strong> {String(value)}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">
                          {log.actor_user?.email || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDate(log.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">
                Henüz log kaydı bulunmuyor.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dosya Yükleme Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dosya Yükle</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Dosya Açıklaması"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Dosya Seç
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => setSelectedFiles(e.target.files)}
              />
            </Button>
            {selectedFiles && selectedFiles.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Seçilen Dosyalar:
                </Typography>
                {Array.from(selectedFiles).map((file, index) => (
                  <Typography key={index} variant="body2">
                    {file.name} ({formatFileSize(file.size)})
                  </Typography>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || saving}
            startIcon={saving ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            Yükle
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
