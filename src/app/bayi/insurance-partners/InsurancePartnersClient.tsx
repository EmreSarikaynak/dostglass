'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import { Close, Description, Policy, Business } from '@mui/icons-material'
// import ReactMarkdown from 'react-markdown'

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
  display_order: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

export function InsurancePartnersClient() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null)
  const [documents, setDocuments] = useState<InsuranceDocument[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/parameters/insurance_companies?only_active=true')
      const result = await response.json()
      
      if (response.ok) {
        setCompanies(result.data || [])
      } else {
        setError('Veriler yüklenemedi')
      }
    } catch (err) {
      console.error('Yükleme hatası:', err)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyClick = async (company: InsuranceCompany) => {
    setSelectedCompany(company)
    setTabValue(0)
    setDialogOpen(true)
    // Load documents
    try {
      const response = await fetch(`/api/insurance-documents?company_id=${company.id}`)
      const result = await response.json()
      if (response.ok) {
        setDocuments(result.data || [])
      }
    } catch (err) {
      console.error('Döküman yükleme hatası:', err)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedCompany(null)
  }

  const getLogoUrl = (company: InsuranceCompany) => {
    return company.logo_url || '/images/default-insurance-logo.png'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          🤝 Anlaşmalı Sigorta Şirketleri
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Anlaşmalı olduğumuz sigorta şirketlerini görüntüleyebilir, çalışma prosedürlerini ve gerekli evrakları inceleyebilirsiniz.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={() => handleCompanyClick(company)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  flex: 1,
                }}
              >
                <Avatar
                  src={getLogoUrl(company)}
                  alt={company.name}
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    '& img': {
                      objectFit: 'contain',
                      p: 1,
                    },
                  }}
                >
                  <Business sx={{ fontSize: 60, color: 'text.secondary' }} />
                </Avatar>
                <Typography
                  variant="h6"
                  align="center"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {company.name}
                </Typography>
                <Chip
                  label={company.code}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {companies.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Henüz anlaşmalı sigorta şirketi bulunmamaktadır.
        </Alert>
      )}

      {/* Detay Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
          },
        }}
      >
        {selectedCompany && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 0,
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={getLogoUrl(selectedCompany)}
                  alt={selectedCompany.name}
                  variant="rounded"
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Business sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedCompany.name}
                  </Typography>
                  <Chip label={selectedCompany.code} size="small" color="primary" />
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} size="large">
                <Close />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 0 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Tab
                  icon={<Policy />}
                  label="Çalışma Prosedürü"
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
                <Tab
                  icon={<Description />}
                  label="Matbuu Evraklar"
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              </Tabs>

              <Box sx={{ px: 3 }}>
                <TabPanel value={tabValue} index={0}>
                  {selectedCompany.work_procedure ? (
                    <Box
                      sx={{
                        '& h1, & h2, & h3': {
                          color: 'primary.main',
                          mt: 2,
                          mb: 1,
                        },
                        '& ul, & ol': {
                          pl: 3,
                        },
                        '& p': {
                          mb: 1.5,
                        },
                        '& strong': {
                          color: 'primary.dark',
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedCompany.work_procedure }}
                    />
                  ) : (
                    <Alert severity="info">
                      Bu sigorta şirketi için henüz çalışma prosedürü tanımlanmamıştır.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {documents.length > 0 ? (
                    <Box>
                      <Grid container spacing={2}>
                        {documents.map((doc) => (
                          <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: 4,
                                },
                              }}
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <CardContent>
                                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                  {doc.file_type.includes('pdf') ? (
                                    <Description sx={{ fontSize: 48, color: 'error.main' }} />
                                  ) : (
                                    <Box
                                      component="img"
                                      src={doc.file_url}
                                      alt={doc.title}
                                      sx={{
                                        width: '100%',
                                        height: 120,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                      }}
                                    />
                                  )}
                                  <Typography variant="body2" fontWeight={600} align="center">
                                    {doc.title}
                                  </Typography>
                                  <Chip
                                    label={doc.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                    size="small"
                                    color="primary"
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Bu sigorta şirketi için henüz matbuu evrak eklenmemiştir.
                    </Alert>
                  )}
                </TabPanel>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  )
}
