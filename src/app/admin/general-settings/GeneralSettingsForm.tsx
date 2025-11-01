'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Stack,
  Tabs,
  Tab,
  InputAdornment,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Chip,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import { useRouter } from 'next/navigation'
import {
  ArrowBack,
  Save,
  Language,
  Business,
  Receipt,
  Email,
  Upload,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Image as ImageIcon,
  Public,
  Phone,
  AccountBalance,
  Percent,
  AttachMoney,
  Notes,
  MailOutline,
  Security,
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface Settings {
  id?: string
  // Site Ayarları
  site_title?: string
  site_description?: string
  site_logo_url?: string
  favicon_url?: string
  // Şirket Bilgileri
  company_name?: string
  company_address?: string
  company_phone?: string
  company_mobile?: string
  company_email?: string
  company_tax_office?: string
  company_tax_number?: string
  company_website?: string
  company_facebook?: string
  company_instagram?: string
  company_twitter?: string
  company_linkedin?: string
  // Fatura & Ticari Ayarlar
  default_vat_rate?: number
  vat_rate_1?: number
  vat_rate_10?: number
  vat_rate_20?: number
  default_payment_term?: number
  default_currency?: string
  currency_symbol?: string
  invoice_note?: string
  invoice_footer?: string
  // E-posta Ayarları
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_secure?: boolean
  email_from_address?: string
  email_from_name?: string
  email_order_confirmation_subject?: string
  email_order_confirmation_body?: string
  email_invoice_subject?: string
  email_invoice_body?: string
  email_welcome_subject?: string
  email_welcome_body?: string
}

interface Props {
  initialSettings: Settings | null
}

export function GeneralSettingsForm({ initialSettings }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  // Site Ayarları
  const [siteTitle, setSiteTitle] = useState(initialSettings?.site_title || 'DostlarGlass')
  const [siteDescription, setSiteDescription] = useState(initialSettings?.site_description || '')
  const [siteLogoUrl, setSiteLogoUrl] = useState(initialSettings?.site_logo_url || '')
  const [faviconUrl, setFaviconUrl] = useState(initialSettings?.favicon_url || '')

  // Şirket Bilgileri
  const [companyName, setCompanyName] = useState(initialSettings?.company_name || '')
  const [companyAddress, setCompanyAddress] = useState(initialSettings?.company_address || '')
  const [companyPhone, setCompanyPhone] = useState(initialSettings?.company_phone || '')
  const [companyMobile, setCompanyMobile] = useState(initialSettings?.company_mobile || '')
  const [companyEmail, setCompanyEmail] = useState(initialSettings?.company_email || '')
  const [companyTaxOffice, setCompanyTaxOffice] = useState(initialSettings?.company_tax_office || '')
  const [companyTaxNumber, setCompanyTaxNumber] = useState(initialSettings?.company_tax_number || '')
  const [companyWebsite, setCompanyWebsite] = useState(initialSettings?.company_website || '')
  const [companyFacebook, setCompanyFacebook] = useState(initialSettings?.company_facebook || '')
  const [companyInstagram, setCompanyInstagram] = useState(initialSettings?.company_instagram || '')
  const [companyTwitter, setCompanyTwitter] = useState(initialSettings?.company_twitter || '')
  const [companyLinkedin, setCompanyLinkedin] = useState(initialSettings?.company_linkedin || '')

  // Fatura & Ticari Ayarlar
  const [defaultVatRate, setDefaultVatRate] = useState(initialSettings?.default_vat_rate || 20)
  const [vatRate1, setVatRate1] = useState(initialSettings?.vat_rate_1 || 1)
  const [vatRate10, setVatRate10] = useState(initialSettings?.vat_rate_10 || 10)
  const [vatRate20, setVatRate20] = useState(initialSettings?.vat_rate_20 || 20)
  const [defaultPaymentTerm, setDefaultPaymentTerm] = useState(initialSettings?.default_payment_term || 30)
  const [defaultCurrency, setDefaultCurrency] = useState(initialSettings?.default_currency || 'TRY')
  const [currencySymbol, setCurrencySymbol] = useState(initialSettings?.currency_symbol || '₺')
  const [invoiceNote, setInvoiceNote] = useState(initialSettings?.invoice_note || '')
  const [invoiceFooter, setInvoiceFooter] = useState(initialSettings?.invoice_footer || '')

  // E-posta Ayarları
  const [smtpHost, setSmtpHost] = useState(initialSettings?.smtp_host || '')
  const [smtpPort, setSmtpPort] = useState(initialSettings?.smtp_port || 587)
  const [smtpUsername, setSmtpUsername] = useState(initialSettings?.smtp_username || '')
  const [smtpPassword, setSmtpPassword] = useState(initialSettings?.smtp_password || '')
  const [emailFromAddress, setEmailFromAddress] = useState(initialSettings?.email_from_address || '')
  const [emailFromName, setEmailFromName] = useState(initialSettings?.email_from_name || '')
  const [emailOrderConfirmationSubject, setEmailOrderConfirmationSubject] = useState(
    initialSettings?.email_order_confirmation_subject || 'Sipariş Onayı - #{order_number}'
  )
  const [emailOrderConfirmationBody, setEmailOrderConfirmationBody] = useState(
    initialSettings?.email_order_confirmation_body || ''
  )
  const [emailInvoiceSubject, setEmailInvoiceSubject] = useState(
    initialSettings?.email_invoice_subject || 'Fatura - #{invoice_number}'
  )
  const [emailInvoiceBody, setEmailInvoiceBody] = useState(initialSettings?.email_invoice_body || '')
  const [emailWelcomeSubject, setEmailWelcomeSubject] = useState(
    initialSettings?.email_welcome_subject || 'Hoş Geldiniz!'
  )
  const [emailWelcomeBody, setEmailWelcomeBody] = useState(initialSettings?.email_welcome_body || '')

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    if (type === 'logo') {
      setUploadingLogo(true)
    } else {
      setUploadingFavicon(true)
    }

    try {
      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Yükleme başarısız')
      }

      if (type === 'logo') {
        setSiteLogoUrl(data.url)
      } else {
        setFaviconUrl(data.url)
      }

      setSuccess('Dosya başarıyla yüklendi')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Dosya yüklenirken hata oluştu')
      setTimeout(() => setError(''), 5000)
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false)
      } else {
        setUploadingFavicon(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const settings = {
        // Site Ayarları
        site_title: siteTitle,
        site_description: siteDescription,
        site_logo_url: siteLogoUrl,
        favicon_url: faviconUrl,
        // Şirket Bilgileri
        company_name: companyName,
        company_address: companyAddress,
        company_phone: companyPhone,
        company_mobile: companyMobile,
        company_email: companyEmail,
        company_tax_office: companyTaxOffice,
        company_tax_number: companyTaxNumber,
        company_website: companyWebsite,
        company_facebook: companyFacebook,
        company_instagram: companyInstagram,
        company_twitter: companyTwitter,
        company_linkedin: companyLinkedin,
        // Fatura & Ticari Ayarlar
        default_vat_rate: parseFloat(String(defaultVatRate)),
        vat_rate_1: parseFloat(String(vatRate1)),
        vat_rate_10: parseFloat(String(vatRate10)),
        vat_rate_20: parseFloat(String(vatRate20)),
        default_payment_term: parseInt(String(defaultPaymentTerm)),
        default_currency: defaultCurrency,
        currency_symbol: currencySymbol,
        invoice_note: invoiceNote,
        invoice_footer: invoiceFooter,
        // E-posta Ayarları
        smtp_host: smtpHost,
        smtp_port: parseInt(String(smtpPort)),
        smtp_username: smtpUsername,
        smtp_password: smtpPassword,
        smtp_secure: true,
        email_from_address: emailFromAddress,
        email_from_name: emailFromName,
        email_order_confirmation_subject: emailOrderConfirmationSubject,
        email_order_confirmation_body: emailOrderConfirmationBody,
        email_invoice_subject: emailInvoiceSubject,
        email_invoice_body: emailInvoiceBody,
        email_welcome_subject: emailWelcomeSubject,
        email_welcome_body: emailWelcomeBody,
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt başarısız')
      }

      setSuccess('Ayarlar başarıyla kaydedildi')
      
      // Sayfayı yenile
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(2, 86, 145, 0.1) 0%, rgba(0, 44, 81, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(2, 86, 145, 0.05) 0%, rgba(0, 44, 81, 0.05) 100%)',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => router.push('/admin/settings')}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary">
                Genel Ayarlar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistem genelindeki ayarları buradan yönetebilirsiniz
              </Typography>
            </Box>
          </Box>
          <Chip label={loading ? 'Kaydediliyor...' : 'Hazır'} color={loading ? 'warning' : 'success'} />
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  minHeight: 72,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <Tab icon={<Language sx={{ fontSize: 28 }} />} label="Site Ayarları" iconPosition="start" />
              <Tab icon={<Business sx={{ fontSize: 28 }} />} label="Şirket Bilgileri" iconPosition="start" />
              <Tab icon={<Receipt sx={{ fontSize: 28 }} />} label="Fatura & Ticari" iconPosition="start" />
              <Tab icon={<Email sx={{ fontSize: 28 }} />} label="E-posta" iconPosition="start" />
            </Tabs>
          </Box>
          <CardContent sx={{ p: 4 }}>

            {/* TAB 1: Site Ayarları */}
            <TabPanel value={activeTab} index={0}>
              <Stack spacing={4}>
                {/* SEO & Görünüm Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Public color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      SEO & Görünüm
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Site Başlığı *"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                        required
                        helperText="Tarayıcı sekmesinde ve arama motorlarında görünecek başlık"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Language />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Site Açıklaması"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        helperText="SEO için meta açıklama (150-160 karakter)"
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Logo & Favicon Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <ImageIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Logo & Favicon
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: 2,
                          borderStyle: 'dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          textAlign: 'center',
                          bgcolor: 'background.paper',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(2, 86, 145, 0.05)' : 'rgba(2, 86, 145, 0.02)',
                          },
                        }}
                      >
                        <Stack spacing={2} alignItems="center">
                          {siteLogoUrl ? (
                            <Avatar
                              src={siteLogoUrl}
                              alt="Logo"
                              variant="rounded"
                              sx={{ width: 120, height: 80, mb: 1 }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 120,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
                            </Box>
                          )}
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<Upload />}
                            disabled={uploadingLogo}
                            size="large"
                          >
                            {uploadingLogo ? 'Yükleniyor...' : 'Logo Seç'}
                            <input
                              type="file"
                              hidden
                              accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp,image/gif"
                              onChange={(e) => handleLogoUpload(e, 'logo')}
                            />
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            Önerilen: 200x60px
                            <br />
                            JPG, PNG, SVG, WebP (Max: 5MB)
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: 2,
                          borderStyle: 'dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          textAlign: 'center',
                          bgcolor: 'background.paper',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(2, 86, 145, 0.05)' : 'rgba(2, 86, 145, 0.02)',
                          },
                        }}
                      >
                        <Stack spacing={2} alignItems="center">
                          {faviconUrl ? (
                            <Avatar
                              src={faviconUrl}
                              alt="Favicon"
                              variant="rounded"
                              sx={{ width: 64, height: 64, mb: 1 }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 32, color: 'action.disabled' }} />
                            </Box>
                          )}
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<Upload />}
                            disabled={uploadingFavicon}
                            size="large"
                          >
                            {uploadingFavicon ? 'Yükleniyor...' : 'Favicon Seç'}
                            <input
                              type="file"
                              hidden
                              accept="image/jpeg,image/jpg,image/png,image/ico,image/x-icon"
                              onChange={(e) => handleLogoUpload(e, 'favicon')}
                            />
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            Önerilen: 32x32px
                            <br />
                            ICO, PNG, JPG (Max: 1MB)
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </TabPanel>

            {/* TAB 2: Şirket Bilgileri */}
            <TabPanel value={activeTab} index={1}>
              <Stack spacing={4}>
                {/* Temel Bilgiler Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Business color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Temel Bilgiler
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Firma Adı *"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="E-posta"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Telefon"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        placeholder="0212 123 45 67"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Mobil"
                        value={companyMobile}
                        onChange={(e) => setCompanyMobile(e.target.value)}
                        placeholder="0532 123 45 67"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Adres"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Firma adresinizi buraya yazınız..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Web Sitesi"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://www.example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Public />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Vergi Bilgileri Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <AccountBalance color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Vergi Bilgileri
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vergi Dairesi"
                        value={companyTaxOffice}
                        onChange={(e) => setCompanyTaxOffice(e.target.value)}
                        placeholder="Örn: Kadıköy"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vergi Numarası"
                        value={companyTaxNumber}
                        onChange={(e) => setCompanyTaxNumber(e.target.value)}
                        placeholder="10 haneli vergi numarası"
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Sosyal Medya Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Public color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Sosyal Medya
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Facebook"
                        value={companyFacebook}
                        onChange={(e) => setCompanyFacebook(e.target.value)}
                        placeholder="https://facebook.com/..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Facebook color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Instagram"
                        value={companyInstagram}
                        onChange={(e) => setCompanyInstagram(e.target.value)}
                        placeholder="https://instagram.com/..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Instagram sx={{ color: '#E4405F' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Twitter"
                        value={companyTwitter}
                        onChange={(e) => setCompanyTwitter(e.target.value)}
                        placeholder="https://twitter.com/..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Twitter sx={{ color: '#1DA1F2' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="LinkedIn"
                        value={companyLinkedin}
                        onChange={(e) => setCompanyLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkedIn sx={{ color: '#0A66C2' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </TabPanel>

            {/* TAB 3: Fatura & Ticari Ayarlar */}
            <TabPanel value={activeTab} index={2}>
              <Stack spacing={4}>
                {/* KDV Oranları Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Percent color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      KDV Oranları (%)
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Varsayılan KDV"
                        type="number"
                        value={defaultVatRate}
                        onChange={(e) => setDefaultVatRate(parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="KDV %1"
                        type="number"
                        value={vatRate1}
                        onChange={(e) => setVatRate1(parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="KDV %10"
                        type="number"
                        value={vatRate10}
                        onChange={(e) => setVatRate10(parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="KDV %20"
                        type="number"
                        value={vatRate20}
                        onChange={(e) => setVatRate20(parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Ödeme & Para Birimi Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <AttachMoney color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Ödeme & Para Birimi
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Varsayılan Ödeme Vadesi"
                        type="number"
                        value={defaultPaymentTerm}
                        onChange={(e) => setDefaultPaymentTerm(parseInt(e.target.value))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">gün</InputAdornment>,
                        }}
                        helperText="Örn: 30, 45, 60"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Para Birimi"
                        value={defaultCurrency}
                        onChange={(e) => setDefaultCurrency(e.target.value)}
                        placeholder="TRY"
                        helperText="TRY, USD, EUR, vb."
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Para Birimi Sembolü"
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        placeholder="₺"
                        helperText="₺, $, €, vb."
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Fatura Notları Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Notes color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Fatura Notları
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Fatura İçi Not"
                        value={invoiceNote}
                        onChange={(e) => setInvoiceNote(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Fatura üzerinde görünecek notlarınızı buraya yazınız..."
                        helperText="Fatura içinde görünen standart not"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Fatura Alt Bilgi"
                        value={invoiceFooter}
                        onChange={(e) => setInvoiceFooter(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Fatura altında görünecek bilgileri buraya yazınız..."
                        helperText="Fatura alt kısmında görünen bilgiler (şirket bilgileri, teşekkür mesajı vb.)"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </TabPanel>

            {/* TAB 4: E-posta Ayarları */}
            <TabPanel value={activeTab} index={3}>
              <Stack spacing={4}>
                {/* SMTP Ayarları Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Security color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      SMTP Ayarları
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                        helperText="E-posta sunucusu adresi"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                        placeholder="587"
                        helperText="Genellikle 587 veya 465"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Kullanıcı Adı"
                        value={smtpUsername}
                        onChange={(e) => setSmtpUsername(e.target.value)}
                        placeholder="kullanici@example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Şifre"
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Security />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Gönderen Bilgileri Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <MailOutline color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Gönderen Bilgileri
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Gönderen E-posta"
                        type="email"
                        value={emailFromAddress}
                        onChange={(e) => setEmailFromAddress(e.target.value)}
                        placeholder="noreply@dostlarglass.com"
                        helperText="Gönderen e-posta adresi"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Gönderen Adı"
                        value={emailFromName}
                        onChange={(e) => setEmailFromName(e.target.value)}
                        placeholder="DostlarGlass"
                        helperText="E-postalarda görünecek isim"
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* E-posta Şablonları Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'),
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Notes color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        E-posta Şablonları
                      </Typography>
                    </Box>
                    <Chip
                      label="Değişkenler: #{order_number}, #{customer_name}, #{amount}"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Divider textAlign="left" sx={{ mb: 2 }}>
                        <Chip label="Sipariş Onayı" size="small" />
                      </Divider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Konu"
                        value={emailOrderConfirmationSubject}
                        onChange={(e) => setEmailOrderConfirmationSubject(e.target.value)}
                        placeholder="Sipariş Onayı - #{order_number}"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="İçerik"
                        value={emailOrderConfirmationBody}
                        onChange={(e) => setEmailOrderConfirmationBody(e.target.value)}
                        multiline
                        rows={4}
                        placeholder="Sayın #{customer_name}, siparişiniz alınmıştır..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider textAlign="left" sx={{ my: 2 }}>
                        <Chip label="Fatura" size="small" />
                      </Divider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Konu"
                        value={emailInvoiceSubject}
                        onChange={(e) => setEmailInvoiceSubject(e.target.value)}
                        placeholder="Fatura - #{invoice_number}"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="İçerik"
                        value={emailInvoiceBody}
                        onChange={(e) => setEmailInvoiceBody(e.target.value)}
                        multiline
                        rows={4}
                        placeholder="Sayın #{customer_name}, faturanız hazırlanmıştır..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider textAlign="left" sx={{ my: 2 }}>
                        <Chip label="Hoş Geldiniz" size="small" />
                      </Divider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Konu"
                        value={emailWelcomeSubject}
                        onChange={(e) => setEmailWelcomeSubject(e.target.value)}
                        placeholder="Hoş Geldiniz!"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="İçerik"
                        value={emailWelcomeBody}
                        onChange={(e) => setEmailWelcomeBody(e.target.value)}
                        multiline
                        rows={4}
                        placeholder="Hoş geldiniz #{customer_name}..."
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </TabPanel>

            {/* Kaydet Butonu */}
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(2, 86, 145, 0.1)' : 'rgba(2, 86, 145, 0.05)',
                border: 1,
                borderColor: 'primary.main',
                borderStyle: 'dashed',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Ayarları Kaydet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yaptığınız değişiklikleri kaydetmek için butona tıklayın
                  </Typography>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<Save />}
                  sx={{
                    minWidth: 200,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </form>
    </Box>
  )
}
