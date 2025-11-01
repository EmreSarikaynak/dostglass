'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material'
import { exportClaimToPDF } from '@/utils/claimPDFExport'
import { ClaimStatusChanger } from '@/components/claims/ClaimStatusChanger'

interface ClaimDetail {
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
  insured_types: { name: string }
  license_classes: { name: string }
  vehicle_categories: { name: string }
  vehicle_brands: { name: string }
  vehicle_models: { name: string }
  vehicle_usage_types: { name: string }
  agency_code: string
  agency_name: string
  policy_start_date: string
  policy_end_date: string
  incident_city_id: string
  incident_district_id: string
  insured_name: string
  insured_tax_office: string
  insured_tax_number: string
  insured_phone: string
  insured_mobile: string
  driver_same_as_insured: boolean
  driver_name: string
  driver_tc_number: string
  driver_phone: string
  driver_birth_date: string
  driver_license_date: string
  driver_license_place: string
  driver_license_number: string
  vehicle_model_year: number
  notes: string
  claim_items: ClaimItem[]
}

interface ClaimItem {
  id: string
  glass_positions: { name: string }
  glass_types: { name: string }
  glass_brands: { name: string }
  glass_colors: { name: string }
  glass_operations: { name: string }
  installation_methods: { name: string }
  service_locations: { name: string }
  glass_code: string
  unit_price: number
  quantity: number
  subtotal: number
  vat_rate: number
  vat_amount: number
  total_amount: number
  customer_contribution: boolean
  additional_material_cost?: number
  additional_material_reason?: string
  notes: string
}

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  draft: { label: 'Taslak', color: 'default' },
  submitted: { label: 'Gönderildi', color: 'info' },
  in_progress: { label: 'İşlemde', color: 'warning' },
  completed: { label: 'Tamamlandı', color: 'success' },
  cancelled: { label: 'İptal', color: 'error' }
}

export default function ClaimViewClient({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClaim()
  }, [claimId])

  const fetchClaim = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/claims/${claimId}`)
      const result = await response.json()

      if (response.ok) {
        setClaim(result.data)
      } else {
        setError(result.error || 'İhbar yüklenemedi')
      }
    } catch (error) {
      console.error('İhbar yükleme hatası:', error)
      setError('İhbar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (!claim) return
    try {
      exportClaimToPDF(claim as any)
    } catch (error) {
      console.error('PDF export hatası:', error)
      alert('PDF oluşturulurken bir hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu ihbarı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/claims')
      } else {
        const result = await response.json()
        alert(result.error || 'İhbar silinemedi')
      }
    } catch (error) {
      console.error('İhbar silme hatası:', error)
      alert('İhbar silinirken bir hata oluştu')
    }
  }

  const calculateTotals = () => {
    if (!claim?.claim_items) return { subtotal: 0, vat: 0, total: 0 }
    
    const subtotal = claim.claim_items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    const vat = claim.claim_items.reduce((sum, item) => sum + (item.vat_amount || 0), 0)
    const total = claim.claim_items.reduce((sum, item) => sum + (item.total_amount || 0), 0)
    
    return { subtotal, vat, total }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !claim) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'İhbar bulunamadı'}</Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => router.push('/admin/claims')}>
          Geri Dön
        </Button>
      </Box>
    )
  }

  const totals = calculateTotals()
  const statusInfo = STATUS_LABELS[claim.status] || { label: claim.status, color: 'default' }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            İhbar Detayı
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              İhbar No: <strong>{claim.claim_number || '-'}</strong>
            </Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => router.push('/admin/claims')}>
            Geri
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handleExportPDF}>
            Yazdır
          </Button>
          <Button variant="contained" color="error" startIcon={<PdfIcon />} onClick={handleExportPDF}>
            PDF İndir
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => router.push(`/admin/claims/${claimId}/edit`)}>
            Düzenle
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
            Sil
          </Button>
        </Stack>
      </Box>

      {/* Durum Değiştirme - Yeni Component */}
      <Card sx={{ p: 3, mb: 3 }}>
        <ClaimStatusChanger 
          claimId={claimId}
          currentStatus={claim.status}
          onStatusChanged={fetchClaim}
        />
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Sigorta & Poliçe Bilgileri */}
        <Box>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Sigorta & Poliçe Bilgileri
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow label="Sigorta Şirketi" value={claim.insurance_companies?.name} />
              <InfoRow label="Acente Kodu" value={claim.agency_code} />
              <InfoRow label="Acente Adı" value={claim.agency_name} />
              <InfoRow label="Poliçe No" value={claim.policy_number} />
              <InfoRow label="Poliçe Başlangıç" value={claim.policy_start_date ? new Date(claim.policy_start_date).toLocaleDateString('tr-TR') : '-'} />
              <InfoRow label="Poliçe Bitiş" value={claim.policy_end_date ? new Date(claim.policy_end_date).toLocaleDateString('tr-TR') : '-'} />
            </Stack>
          </Card>
        </Box>

        {/* Hasar Bilgileri */}
        <Box>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Hasar Bilgileri
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow label="Olay Türü" value={claim.incident_types?.name} />
              <InfoRow label="Hasar Türü" value={claim.damage_types?.name} />
              <InfoRow label="Olay Tarihi" value={claim.incident_date ? new Date(claim.incident_date).toLocaleDateString('tr-TR') : '-'} />
              <InfoRow label="Olay Yeri (İl/İlçe)" value="-" />
            </Stack>
          </Card>
        </Box>

        {/* Sigortalı Bilgileri */}
        <Box>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Sigortalı Bilgileri
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow label="Sigortalı Tipi" value={claim.insured_types?.name} />
              <InfoRow label="Adı Soyadı" value={claim.insured_name} />
              <InfoRow label="Vergi Dairesi" value={claim.insured_tax_office} />
              <InfoRow label="TC/Vergi No" value={claim.insured_tax_number} />
              <InfoRow label="Telefon" value={claim.insured_phone} />
              <InfoRow label="Cep Telefonu" value={claim.insured_mobile} />
            </Stack>
          </Card>
        </Box>

        {/* Sürücü Bilgileri */}
        <Box>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Sürücü Bilgileri
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow label="Sigortalı ile Aynı" value={claim.driver_same_as_insured ? 'Evet' : 'Hayır'} />
              <InfoRow label="Adı Soyadı" value={claim.driver_name} />
              <InfoRow label="TC No" value={claim.driver_tc_number} />
              <InfoRow label="Telefon" value={claim.driver_phone} />
              <InfoRow label="Doğum Tarihi" value={claim.driver_birth_date ? new Date(claim.driver_birth_date).toLocaleDateString('tr-TR') : '-'} />
              <InfoRow label="Ehliyet Sınıfı" value={claim.license_classes?.name} />
              <InfoRow label="Ehliyet Tarihi" value={claim.driver_license_date ? new Date(claim.driver_license_date).toLocaleDateString('tr-TR') : '-'} />
              <InfoRow label="Ehliyet Yeri" value={claim.driver_license_place} />
              <InfoRow label="Ehliyet No" value={claim.driver_license_number} />
            </Stack>
          </Card>
        </Box>

        {/* Araç Bilgileri */}
        <Box>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Araç Bilgileri
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow label="Plaka" value={claim.vehicle_plate} />
              <InfoRow label="Model Yılı" value={claim.vehicle_model_year?.toString()} />
              <InfoRow label="Kullanım Tipi" value={claim.vehicle_usage_types?.name} />
              <InfoRow label="Araç Kategorisi" value={claim.vehicle_categories?.name} />
              <InfoRow label="Araç Markası" value={claim.vehicle_brands?.name} />
              <InfoRow label="Araç Modeli" value={claim.vehicle_models?.name} />
            </Stack>
          </Card>
        </Box>

        {/* Notlar */}
        {claim.notes && (
          <Box>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Notlar
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {claim.notes}
              </Typography>
            </Card>
          </Box>
        )}

        {/* Cam Kalemleri */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Cam Kalemleri
            </Typography>
            {claim.claim_items && claim.claim_items.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Cam Türü</strong></TableCell>
                      <TableCell><strong>Cam Tipi</strong></TableCell>
                      <TableCell><strong>Cam Markası</strong></TableCell>
                      <TableCell><strong>Cam Kodu</strong></TableCell>
                      <TableCell><strong>Cam Rengi</strong></TableCell>
                      <TableCell><strong>İşlem</strong></TableCell>
                      <TableCell align="right"><strong>Birim Fiyat</strong></TableCell>
                      <TableCell align="center"><strong>Adet</strong></TableCell>
                      <TableCell align="right"><strong>Ara Toplam</strong></TableCell>
                      <TableCell align="right"><strong>KDV</strong></TableCell>
                      <TableCell align="right"><strong>Toplam</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {claim.claim_items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.glass_positions?.name || '-'}</TableCell>
                        <TableCell>{item.glass_types?.name || '-'}</TableCell>
                        <TableCell>{item.glass_brands?.name || '-'}</TableCell>
                        <TableCell>{item.glass_code || '-'}</TableCell>
                        <TableCell>{item.glass_colors?.name || '-'}</TableCell>
                        <TableCell>{item.glass_operations?.name || '-'}</TableCell>
                        <TableCell align="right">{item.unit_price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{item.subtotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</TableCell>
                        <TableCell align="right">{item.vat_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</TableCell>
                        <TableCell align="right"><strong>{item.total_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong></TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={8} align="right"><strong>Ara Toplam:</strong></TableCell>
                      <TableCell align="right"><strong>{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong></TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} align="right"><strong>KDV:</strong></TableCell>
                      <TableCell align="right"><strong>{totals.vat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong></TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} align="right"><strong>Genel Toplam:</strong></TableCell>
                      <TableCell align="right" colSpan={2}>
                        <Typography variant="h6" color="primary">
                          {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">Henüz cam kalemi eklenmemiş</Alert>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '-'}
      </Typography>
    </Box>
  )
}


