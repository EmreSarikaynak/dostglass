'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Close,
  CloudUpload,
  Delete,
  Image as ImageIcon,
  PictureAsPdf,
  DragIndicator,
} from '@mui/icons-material'
import { HTMLEditor } from '@/components/HTMLEditor'

interface InsuranceCompany {
  id: string
  code: string
  name: string
  logo_url?: string
  work_procedure?: string
  is_active: boolean
}

interface InsuranceDocument {
  id: string
  title: string
  file_url: string
  file_type: string
  file_size?: number
  display_order: number
}

interface Props {
  open: boolean
  company: InsuranceCompany | null
  onClose: () => void
  onSuccess: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

export function InsuranceCompanyDialog({ open, company, onClose, onSuccess }: Props) {
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    logo_url: '',
    work_procedure: '',
    is_active: true,
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [documents, setDocuments] = useState<InsuranceDocument[]>([])
  const [newDocument, setNewDocument] = useState<{ title: string; file: File | null }>({
    title: '',
    file: null,
  })
  const [docPreview, setDocPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (company) {
      setFormData({
        code: company.code || '',
        name: company.name || '',
        logo_url: company.logo_url || '',
        work_procedure: company.work_procedure || '',
        is_active: company.is_active,
      })
      setLogoPreview(company.logo_url || null)
      loadDocuments(company.id)
    } else {
      setFormData({
        code: '',
        name: '',
        logo_url: '',
        work_procedure: '',
        is_active: true,
      })
      setLogoPreview(null)
      setDocuments([])
    }
    setTabValue(0)
    setLogoFile(null)
    setNewDocument({ title: '', file: null })
  }, [company, open])

  const loadDocuments = async (companyId: string) => {
    try {
      const response = await fetch(`/api/insurance-documents?company_id=${companyId}`)
      const result = await response.json()
      if (response.ok) {
        setDocuments(result.data || [])
      }
    } catch (err) {
      console.error('Döküman yükleme hatası:', err)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewDocument({ ...newDocument, file })
      
      // Preview için
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setDocPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setDocPreview(null)
      }
    }
  }

  const uploadFile = async (file: File, type: 'logo' | 'document'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result.url
  }

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.file || !company) {
      alert('Lütfen başlık ve dosya seçin')
      return
    }

    try {
      setUploading(true)
      const fileUrl = await uploadFile(newDocument.file, 'document')

      const response = await fetch('/api/insurance-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insurance_company_id: company.id,
          title: newDocument.title,
          file_url: fileUrl,
          file_type: newDocument.file.type,
          file_size: newDocument.file.size,
          display_order: documents.length,
        }),
      })

      if (response.ok) {
        await loadDocuments(company.id)
        setNewDocument({ title: '', file: null })
        setDocPreview(null)
      }
    } catch (err) {
      console.error('Döküman ekleme hatası:', err)
      alert('Döküman eklenemedi')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/insurance-documents?id=${docId}`, {
        method: 'DELETE',
      })

      if (response.ok && company) {
        await loadDocuments(company.id)
      }
    } catch (err) {
      console.error('Döküman silme hatası:', err)
      alert('Döküman silinemedi')
    }
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      alert('Lütfen kod ve şirket adı girin')
      return
    }

    try {
      setSaving(true)

      // Logo upload
      let logoUrl = formData.logo_url
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logo')
      }

      const body = {
        ...formData,
        logo_url: logoUrl,
        ...(company && { id: company.id }),
      }

      const response = await fetch('/api/parameters/insurance_companies', {
        method: company ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error('Save failed')
      }
    } catch (err) {
      console.error('Kaydetme hatası:', err)
      alert('Kaydetme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PictureAsPdf color="error" />
    if (fileType.includes('image')) return <ImageIcon color="primary" />
    return <ImageIcon />
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {company ? 'Sigorta Şirketi Düzenle' : 'Yeni Sigorta Şirketi'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab label="Genel Bilgiler" />
        <Tab label="Çalışma Prosedürü" />
        <Tab label="Matbuu Evraklar" disabled={!company} />
      </Tabs>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            <TextField
              label="Kod *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Şirket Adı *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Logo Önizleme
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Avatar
                  src={logoPreview || undefined}
                  variant="rounded"
                  sx={{ 
                    width: 100, 
                    height: 100,
                    border: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  {formData.code.substring(0, 2)}
                </Avatar>
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 1 }}
                  >
                    {logoPreview ? 'Değiştir' : 'Logo Yükle'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </Button>
                  {logoPreview && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      ✓ Logo seçildi
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary">
                    Önerilen: 200x200px, PNG/JPG
                  </Typography>
                </Box>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Aktif"
            />
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <HTMLEditor
            value={formData.work_procedure}
            onChange={(value) => setFormData({ ...formData, work_procedure: value })}
            label="Çalışma Prosedürü"
            rows={18}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {company && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Yeni Döküman Ekle
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Başlık"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    fullWidth
                    size="small"
                  />
                  
                  {/* Preview */}
                  {docPreview && (
                    <Box
                      component="img"
                      src={docPreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        maxWidth: 300,
                        height: 150,
                        objectFit: 'contain',
                        border: 2,
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        p: 1,
                      }}
                    />
                  )}
                  
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      fullWidth
                    >
                      {newDocument.file ? newDocument.file.name : 'PDF veya Resim Seç'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,image/*"
                        onChange={handleDocumentFileChange}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleAddDocument}
                      disabled={!newDocument.title || !newDocument.file || uploading}
                      sx={{ minWidth: 120 }}
                    >
                      {uploading ? <CircularProgress size={24} /> : 'Ekle'}
                    </Button>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Mevcut Dökümanlar ({documents.length})
                </Typography>
                <List>
                  {documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <IconButton size="small" sx={{ mr: 1, cursor: 'move' }}>
                        <DragIndicator />
                      </IconButton>
                      {getFileIcon(doc.file_type)}
                      <ListItemText
                        primary={doc.title}
                        secondary={
                          <Box>
                            <Chip
                              label={doc.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {doc.file_size && (
                              <Typography variant="caption" color="text.secondary">
                                {(doc.file_size / 1024).toFixed(2)} KB
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ ml: 2 }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                {documents.length === 0 && (
                  <Alert severity="info">Henüz döküman eklenmemiş</Alert>
                )}
              </Box>
            </Stack>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : company ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

