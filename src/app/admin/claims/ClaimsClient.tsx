'use client'

import { useState, useEffect, Fragment } from 'react'
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
  Tooltip,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Divider,
  CircularProgress,
  useMediaQuery
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  LocalShipping as LocalShippingIcon,
  Timer as TimerIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ReceiptLong as ReceiptLongIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Print as PrintIcon
} from '@mui/icons-material'
import { alpha, useTheme, Theme } from '@mui/material/styles'

interface Claim {
  id: string
  claim_number: string
  status: string
  policy_number: string
  vehicle_plate: string
  incident_date: string
  created_at: string
  insured_name?: string | null
  notes?: string | null
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

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: '#64748b',
  submitted: '#0284c7',
  in_progress: '#f59e0b',
  completed: '#22c55e',
  cancelled: '#ef4444'
}

const getRowStyles = (status: string, theme: Theme) => {
  const base = STATUS_COLOR_MAP[status] || theme.palette.primary.main
  const bannerBg = alpha(base, theme.palette.mode === 'dark' ? 0.45 : 0.2)
  const rowBg = alpha(base, theme.palette.mode === 'dark' ? 0.25 : 0.08)
  const textColor = theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a'
  const borderColor = alpha(base, theme.palette.mode === 'dark' ? 0.6 : 0.25)
  return { base, bannerBg, rowBg, textColor, borderColor }
}

const SHIPPING_STATUS_MAP: Record<string, { label: string; color: 'error' | 'success' | 'warning' | 'info' }> = {
  draft: { label: 'Beklemede', color: 'warning' },
  submitted: { label: 'Gönderildi', color: 'info' },
  in_progress: { label: 'İşlemde', color: 'warning' },
  completed: { label: 'Geldi', color: 'success' },
  cancelled: { label: 'Red', color: 'error' }
}

const getShippingStatus = (status: string) => SHIPPING_STATUS_MAP[status] || { label: 'Bilinmiyor', color: 'info' }

const getDocumentStatus = (claim: Claim) => {
  const complete = Boolean(claim.claim_items?.length)
  return complete
    ? { label: 'Eksiksiz', color: 'success' as const }
    : { label: 'Eksik', color: 'warning' as const }
}

const getReflectionStatus = () => ({ label: 'Beklemede', color: 'info' as const })

const calculateDelayDays = (incidentDate?: string | null) => {
  if (!incidentDate) return '-'
  const date = new Date(incidentDate)
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  return diff < 0 ? 0 : diff
}

interface ClaimsClientProps {
  userRole?: 'admin' | 'bayi'
}

export default function ClaimsClient({ userRole = 'admin' }: ClaimsClientProps) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const headerBg = theme.palette.mode === 'dark' ? '#0b1729' : '#e6edf5'
  const headerColor = theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a'
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchField, setSearchField] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage)
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
  }, [page, rowsPerPage, filterStatus])

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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDocuments = (id: string) => {
    router.push(`/admin/claims/${id}?tab=documents`)
  }

  const handlePrint = (id: string) => {
    window.open(`/admin/claims/${id}?print=true`, '_blank', 'noopener,noreferrer')
  }

  const canManage = userRole === 'admin'
  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('tr-TR') : '-'
  const formatDateTime = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '-'
  const truncateNote = (text?: string | null) => {
    if (!text) return 'Yönetim notu bulunmuyor'
    return text.length > 90 ? `${text.slice(0, 90)}…` : text
  }
  const tableColumns = [
    { key: 'status', label: 'Kabul / Red' },
    { key: 'date', label: 'Tarihi' },
    { key: 'plate', label: 'Plaka' },
    { key: 'insurance', label: 'Sigorta' },
    { key: 'claimNumber', label: 'Dosya No' },
    { key: 'insured', label: 'Sigortalı' },
    { key: 'shipping', label: 'Gönderim', subLabel: 'Durum' },
    { key: 'delay', label: 'Gecikme', subLabel: 'Gün Sayı' },
    { key: 'documents', label: 'Evrak', subLabel: 'Durum' },
    { key: 'reflection', label: 'Yansıtma', subLabel: 'Fatura' },
    { key: 'detail', label: 'Detay' },
    { key: 'files', label: 'Evrak' },
    { key: 'print', label: 'Yazdır' }
  ]
  const columnCount = tableColumns.length
  const noData = !loading && totalCount === 0

  const paginationComponent = (
    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[10, 25, 50, 100]}
      labelRowsPerPage="Satır / sayfa"
    />
  )
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          İhbarlar
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchClaims}>
            Yenile
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/admin/claims/new')}>
            Yeni İhbar
          </Button>
        </Stack>
      </Box>

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', lg: 'block' } }} />}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flex={1}>
            <TextField
              select
              label="Arama Kriteri"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="plate">Plaka</MenuItem>
              <MenuItem value="policy">Poliçe No</MenuItem>
              <MenuItem value="insured">Sigortalı</MenuItem>
            </TextField>
            <TextField
              label="Arama"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="Plaka, poliçe veya sigortalı adı"
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flex={1}>
            <TextField
              label="Başlangıç"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Bitiş"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flex={1}>
            <TextField
              select
              label="İhbar Durumu"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="draft">Taslak</MenuItem>
              <MenuItem value="submitted">Gönderildi</MenuItem>
              <MenuItem value="in_progress">İşlemde</MenuItem>
              <MenuItem value="completed">Tamamlandı</MenuItem>
              <MenuItem value="cancelled">İptal / Red</MenuItem>
            </TextField>
            <Button
              variant="contained"
              color="primary"
              sx={{ minWidth: 140 }}
              startIcon={<SearchIcon />}
              onClick={fetchClaims}
            >
              Ara
            </Button>
          </Stack>
        </Stack>
      </Card>

      {noData ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Henüz bir ihbar yok
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Yeni ihbar oluşturmak için yukarıdaki &quot;Yeni İhbar&quot; butonunu kullanabilirsiniz.
          </Typography>
        </Card>
      ) : isMobile ? (
        <>
          <Stack spacing={2}>
            {claims.map((claim) => {
              const statusInfo = STATUS_LABELS[claim.status] || { label: claim.status || '-', color: 'default' }
              const statusStyles = getRowStyles(claim.status, theme)
              const incidentLabel = claim.incident_types?.name || '-'
              const damageLabel = claim.damage_types?.name || '-'
              const camCount = claim.claim_items?.length || 0
              const shippingState = getShippingStatus(claim.status)
              const documentState = getDocumentStatus(claim)
              const reflectionState = getReflectionStatus()
              const delayDays = calculateDelayDays(claim.incident_date)

              return (
                <Paper
                  key={claim.id}
                  sx={{
                    border: `1px solid ${statusStyles.borderColor}`,
                    background: statusStyles.rowBg,
                    p: 2
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
                      <Chip size="small" label={statusInfo.label} color={statusInfo.color} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(claim.created_at)}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">{claim.claim_number || '-'}</Typography>
                      <Typography variant="body2">
                        {claim.vehicle_plate || '-'} • {claim.vehicle_brands?.name || '-'} / {claim.vehicle_models?.name || '-'}
                      </Typography>
                      <Typography variant="body2">
                        {claim.insurance_companies?.name || '-'} • Poliçe: {claim.policy_number || '-'}
                      </Typography>
                      <Typography variant="body2">Sigortalı: {claim.insured_name || '-'}</Typography>
                      <Typography variant="body2">
                        {incidentLabel} • {damageLabel}
                      </Typography>
                      <Typography variant="body2">Cam Kalemleri: {camCount}</Typography>
                      <Typography variant="body2">Gönderim: {shippingState.label}</Typography>
                      <Typography variant="body2">Gecikme: {delayDays}</Typography>
                      <Typography variant="body2">Evrak: {documentState.label}</Typography>
                      <Typography variant="body2">Yansıtmalar: {reflectionState.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateNote(claim.notes)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                      <Tooltip title="Detay">
                        <IconButton size="small" color="info" onClick={() => handleView(claim.id)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Evrak">
                        <IconButton size="small" color="primary" onClick={() => handleDocuments(claim.id)}>
                          <InsertDriveFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Yazdır">
                        <IconButton size="small" color="secondary" onClick={() => handlePrint(claim.id)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canManage && (
                        <>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(claim.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" color="error" onClick={() => handleDelete(claim.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              )
            })}
            {loading && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Paper>
            )}
          </Stack>
          <Paper sx={{ mt: 2, p: 1 }}>{paginationComponent}</Paper>
        </>
      ) : (
        <Card sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: headerBg,
                    '& .MuiTableCell-root': {
                      color: headerColor
                    }
                  }}
                >
                  {tableColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2
                      }}
                    >
                      {column.label}
                      {column.subLabel && (
                        <>
                          <br />
                          <Typography component="span" variant="caption" sx={{ color: alpha(headerColor, 0.85) }}>
                            {column.subLabel}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => {
                  const statusInfo = STATUS_LABELS[claim.status] || {
                    label: claim.status || '-',
                    color: 'default'
                  }
                  const statusStyles = getRowStyles(claim.status, theme)
                  const shippingState = getShippingStatus(claim.status)
                  const documentState = getDocumentStatus(claim)
                  const reflectionState = getReflectionStatus()
                  const delayDays = calculateDelayDays(claim.incident_date)

                  return (
                    <Fragment key={claim.id}>
                      <TableRow sx={{ bgcolor: statusStyles.bannerBg }}>
                        <TableCell colSpan={columnCount} sx={{ color: statusStyles.textColor, fontWeight: 600 }}>
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                            <Box>
                              {statusInfo.label} • {claim.claim_number || '-'}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 400 }}>
                              {truncateNote(claim.notes)}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow
                        hover
                        sx={{
                          bgcolor: statusStyles.rowBg,
                          '& td': { borderColor: statusStyles.borderColor }
                        }}
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Chip size="small" label={statusInfo.label} color={statusInfo.color} />
                            <Typography variant="caption" color="text.secondary">
                              Oluşturma: {formatDateTime(claim.created_at)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(claim.incident_date)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Olay Tarihi
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {claim.vehicle_plate || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {claim.vehicle_brands?.name || '-'} / {claim.vehicle_models?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{claim.insurance_companies?.name || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {claim.claim_number || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{claim.insured_name || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocalShippingIcon fontSize="small" color={shippingState.color} />
                            <Typography variant="body2">{shippingState.label}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TimerIcon fontSize="small" color="warning" />
                            <Typography variant="body2">{delayDays}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AssignmentTurnedInIcon fontSize="small" color={documentState.color} />
                            <Typography variant="body2">{documentState.label}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <ReceiptLongIcon fontSize="small" color={reflectionState.color} />
                            <Typography variant="body2">{reflectionState.label}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Detay">
                              <IconButton size="small" color="info" onClick={() => handleView(claim.id)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {canManage && (
                              <Tooltip title="Düzenle">
                                <IconButton size="small" color="primary" onClick={() => handleEdit(claim.id)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Evrak">
                            <IconButton size="small" color="primary" onClick={() => handleDocuments(claim.id)}>
                              <InsertDriveFileIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Yazdır">
                              <IconButton size="small" color="secondary" onClick={() => handlePrint(claim.id)}>
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {canManage && (
                              <Tooltip title="Sil">
                                <IconButton size="small" color="error" onClick={() => handleDelete(claim.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  )
                })}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}

                {!loading && claims.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Filtre kriterlerine uygun ihbar bulunamadı.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          {paginationComponent}
        </Card>
      )}
    </Box>
  )
}
