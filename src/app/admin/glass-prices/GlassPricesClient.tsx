'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  IconButton,
  Chip,
  InputAdornment,
  MenuItem,
  Switch,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { 
  Search, 
  Upload, 
  Download,
  Delete, 
  Visibility, 
  Edit, 
  Close,
  Inventory,
  LocalOffer,
  Category,
  CheckCircle
} from '@mui/icons-material'
import { GlassPriceDetailed } from '@/types/glass-price'
import { ExcelImportDialog } from './ExcelImportDialog'

export function GlassPricesClient() {
  const [glassPrices, setGlassPrices] = useState<GlassPriceDetailed[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterStatus, setFilterStatus] = useState('') // '', 'active', 'inactive'
  const [openImportDialog, setOpenImportDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GlassPriceDetailed | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadSupplierAndCategories()
  }, [])

  useEffect(() => {
    loadGlassPrices()
  }, [filterCategory, filterSupplier, filterStatus])

  const loadSupplierAndCategories = async () => {
    try {
      const res = await fetch('/api/glass-prices?detailed=true')
      const data = await res.json()
      const allItems = data.data || []

      // Benzersiz tedarikçiler
      const uniqueSuppliers = [...new Set(allItems.map((item: any) => item.supplier).filter(Boolean))]
      setSuppliers(uniqueSuppliers.sort())

      // Benzersiz kategoriler
      const uniqueCategories = [...new Set(allItems.map((item: any) => item.category).filter(Boolean))]
      setCategories(uniqueCategories.sort())
    } catch (error) {
      console.error('Tedarikçi/Kategori yükleme hatası:', error)
    }
  }

  const loadGlassPrices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        detailed: 'true',
        ...(filterCategory && { category: filterCategory }),
        ...(filterSupplier && { supplier: filterSupplier }),
      })

      const res = await fetch(`/api/glass-prices?${params}`)
      const data = await res.json()
      
      // Client-side durum filtresi
      let filteredData = data.data || []
      if (filterStatus === 'active') {
        filteredData = filteredData.filter((item: any) => item.is_active === true)
      } else if (filterStatus === 'inactive') {
        filteredData = filteredData.filter((item: any) => item.is_active === false)
      }
      
      setGlassPrices(filteredData)
    } catch (error) {
      console.error('Yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGlassPrices()
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/glass-prices?detailed=true&search=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setGlassPrices(data.data || [])
    } catch (error) {
      console.error('Arama hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu cam fiyatını silmek istediğinizden emin misiniz?')) return

    try {
      await fetch(`/api/glass-prices/${id}`, { method: 'DELETE' })
      loadGlassPrices()
    } catch (error) {
      console.error('Silme hatası:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/glass-prices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: { is_active: !currentStatus } }),
      })

      if (response.ok) {
        loadGlassPrices()
      } else {
        console.error('Durum güncellenemedi')
      }
    } catch (error) {
      console.error('Toggle hatası:', error)
    }
  }

  const handleView = (item: GlassPriceDetailed) => {
    setSelectedItem(item)
    setViewDialogOpen(true)
  }

  const handleEdit = (item: GlassPriceDetailed) => {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedItem) return

    try {
      // Sadece glass_prices tablosundaki kolonları gönder
      const updatePayload = {
        product_code: selectedItem.product_code,
        stock_name: selectedItem.stock_name,
        supplier: selectedItem.supplier,
        category: selectedItem.category,
        position_text: selectedItem.position_text,
        features: selectedItem.features,
        price_colorless: selectedItem.price_colorless,
        price_colored: selectedItem.price_colored,
        price_double_color: selectedItem.price_double_color,
        thickness_mm: selectedItem.thickness_mm,
        width_mm: selectedItem.width_mm,
        height_mm: selectedItem.height_mm,
        area_m2: selectedItem.area_m2,
        hole_info: selectedItem.hole_info,
        has_camera: selectedItem.has_camera,
        has_sensor: selectedItem.has_sensor,
        is_encapsulated: selectedItem.is_encapsulated,
        is_active: selectedItem.is_active,
      }

      const response = await fetch(`/api/glass-prices/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: updatePayload }),
      })

      if (response.ok) {
        setEditDialogOpen(false)
        setSelectedItem(null)
        loadGlassPrices()
      } else {
        const errorData = await response.json()
        console.error('API Hatası:', errorData)
        alert(`Güncelleme başarısız: ${errorData.error || 'Bilinmeyen hata'}`)
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('Güncelleme sırasında hata oluştu')
    }
  }

  const handleExportExcel = () => {
    // Excel dışarı aktar fonksiyonu
    const headers = [
      'Ürün Kodu',
      'Stok Adı',
      'Tedarikçi',
      'Kategori',
      'Konum',
      'Özellikler',
      'Fiyat (Renksiz)',
      'Fiyat (Renkli)',
      'Fiyat (Çift Renk)',
      'Kalınlık (MM)',
      'En (MM)',
      'Boy (MM)',
      'Alan (M²)',
      'Delik Bilgisi',
      'Durum'
    ]

    const csvContent = [
      headers.join(','),
      ...glassPrices.map(item => [
        item.product_code,
        `"${item.stock_name}"`,
        item.supplier,
        item.category,
        item.position_text || '',
        `"${item.features || ''}"`,
        item.price_colorless || '',
        item.price_colored || '',
        item.price_double_color || '',
        item.thickness_mm || '',
        item.width_mm || '',
        item.height_mm || '',
        item.area_m2 || '',
        item.hole_info || '',
        item.is_active ? 'Aktif' : 'Pasif'
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `cam-fiyat-listesi-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // İstatistikler için hesaplamalar
  const stats = {
    total: glassPrices.length,
    active: glassPrices.filter(item => item.is_active).length,
    categories: new Set(glassPrices.map(item => item.category)).size,
    suppliers: new Set(glassPrices.map(item => item.supplier)).size
  }

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" color="primary" onClick={() => handleView(params.row)} title="Görüntüle">
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => handleEdit(params.row)} title="Düzenle">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)} title="Sil">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: 'is_active',
      headerName: 'Durum',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={params.value}
            onChange={() => handleToggleActive(params.row.id, params.value)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#4caf50',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#4caf50',
              },
              '& .MuiSwitch-track': {
                backgroundColor: params.value ? '#4caf50' : '#d32f2f',
              },
            }}
          />
          <Typography 
            variant="body2" 
            fontWeight={600} 
            color={params.value ? 'success.main' : 'error.main'}
          >
            {params.value ? 'Aktif' : 'Pasif'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'product_code',
      headerName: 'Ürün Kodu',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'stock_name',
      headerName: 'Stok Adı (Araç + Cam Bilgisi)',
      flex: 1,
      minWidth: 300,
    },
    {
      field: 'price_colorless',
      headerName: 'Fiyat Renksiz',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          {params.value ? `${params.value.toFixed(2)} ₺` : '-'}
        </Typography>
      ),
    },
    {
      field: 'price_colored',
      headerName: 'Fiyat Renkli',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="secondary.main">
          {params.value ? `${params.value.toFixed(2)} ₺` : '-'}
        </Typography>
      ),
    },
    {
      field: 'price_double_color',
      headerName: 'Fiyat Çift Renk',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="warning.main">
          {params.value ? `${params.value.toFixed(2)} ₺` : '-'}
        </Typography>
      ),
    },
    {
      field: 'supplier',
      headerName: 'Tedarikçi',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value || '-'} size="small" variant="filled" color="primary" />
      ),
    },
    {
      field: 'category',
      headerName: 'Kategori',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value || '-'} size="small" color="secondary" />
      ),
    },
    {
      field: 'position_text',
      headerName: 'Konum',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value || '-'} size="small" color="info" variant="outlined" />
      ),
    },
    {
      field: 'features',
      headerName: 'Özellikler',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" noWrap sx={{ maxWidth: 100 }}>{params.value || '-'}</Typography>
          {params.row.has_camera && <Chip label="📷" size="small" color="info" />}
          {params.row.has_sensor && <Chip label="📡" size="small" color="info" />}
          {params.row.is_encapsulated && <Chip label="📦" size="small" color="secondary" />}
        </Box>
      ),
    },
    {
      field: 'thickness_mm',
      headerName: 'Kalınlık',
      width: 90,
      renderCell: (params: GridRenderCellParams) => params.value ? `${params.value} mm` : '-',
    },
    {
      field: 'width_mm',
      headerName: 'En',
      width: 80,
      renderCell: (params: GridRenderCellParams) => params.value || '-',
    },
    {
      field: 'height_mm',
      headerName: 'Boy',
      width: 80,
      renderCell: (params: GridRenderCellParams) => params.value || '-',
    },
    {
      field: 'area_m2',
      headerName: 'M²',
      width: 80,
      renderCell: (params: GridRenderCellParams) => params.value ? params.value.toFixed(2) : '-',
    },
    {
      field: 'hole_info',
      headerName: 'Delik',
      width: 90,
    },
    {
      field: 'created_at',
      headerName: 'Tarih',
      width: 110,
      renderCell: (params: GridRenderCellParams) => 
        params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-',
    },
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          💎 Cam Fiyat Listesi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Download />} 
            onClick={handleExportExcel}
          >
            Excel Dışarı Aktar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Upload />} 
            onClick={() => setOpenImportDialog(true)}
          >
            Excel ile Güncelle / İçeri Aktar
          </Button>
        </Box>
      </Box>

      {/* İstatistik Kutuları */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
                '& .stat-icon': {
                  transform: 'scale(1.2) rotate(10deg)',
                  opacity: 0.5
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.3s',
              },
              '&:hover::before': {
                opacity: 1
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    mb: 1,
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Toplam Ürün
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {stats.total.toLocaleString('tr-TR')}
                </Typography>
              </Box>
              <Inventory 
                className="stat-icon"
                sx={{ 
                  fontSize: 56, 
                  opacity: 0.25,
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                }} 
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)',
                '& .stat-icon': {
                  transform: 'scale(1.2) rotate(10deg)',
                  opacity: 0.5
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.3s',
              },
              '&:hover::before': {
                opacity: 1
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    mb: 1,
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Aktif Ürün
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {stats.active.toLocaleString('tr-TR')}
                </Typography>
              </Box>
              <CheckCircle 
                className="stat-icon"
                sx={{ 
                  fontSize: 56, 
                  opacity: 0.25,
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                }} 
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)',
                '& .stat-icon': {
                  transform: 'scale(1.2) rotate(10deg)',
                  opacity: 0.5
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.3s',
              },
              '&:hover::before': {
                opacity: 1
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    mb: 1,
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Kategori Sayısı
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {stats.categories}
                </Typography>
              </Box>
              <Category 
                className="stat-icon"
                sx={{ 
                  fontSize: 56, 
                  opacity: 0.25,
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                }} 
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(250, 112, 154, 0.4)',
                '& .stat-icon': {
                  transform: 'scale(1.2) rotate(10deg)',
                  opacity: 0.5
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.3s',
              },
              '&:hover::before': {
                opacity: 1
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    mb: 1,
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Tedarikçi Sayısı
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {stats.suppliers}
                </Typography>
              </Box>
              <LocalOffer 
                className="stat-icon"
                sx={{ 
                  fontSize: 56, 
                  opacity: 0.25,
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                }} 
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Filtreler */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Ara... (kod, ürün adı, özellik)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <TextField
            select
            fullWidth
            label="Kategori"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
          >
            <MenuItem value="">Tümü</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Tedarikçi"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            size="small"
          >
            <MenuItem value="">Tümü</MenuItem>
            {suppliers.map((supplier) => (
              <MenuItem key={supplier} value={supplier}>
                {supplier}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Durum"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Pasif</MenuItem>
          </TextField>
          <Button variant="contained" fullWidth onClick={handleSearch} startIcon={<Search />}>
            Ara
          </Button>
        </Box>
      </Card>

      {/* Veri Tablosu */}
      <Card>
        <DataGrid
          rows={glassPrices}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          }}
        />
      </Card>

      {/* Import Dialog */}
      <ExcelImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        onSuccess={() => {
          setOpenImportDialog(false)
          loadGlassPrices()
        }}
      />

      {/* Görüntüleme Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cam Fiyat Detayı
          <IconButton onClick={() => setViewDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Ürün Kodu</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedItem.product_code}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Stok Adı</Typography>
                <Typography variant="body1">{selectedItem.stock_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Tedarikçi</Typography>
                <Chip label={selectedItem.supplier || '-'} size="small" color="primary" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Kategori</Typography>
                <Chip label={selectedItem.category || '-'} size="small" color="secondary" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Konum</Typography>
                <Typography variant="body1">{selectedItem.position_text || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Özellikler</Typography>
                <Typography variant="body1">{selectedItem.features || '-'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Fiyat Renksiz</Typography>
                <Typography variant="body1" fontWeight={600} color="success.main">
                  {selectedItem.price_colorless ? `${selectedItem.price_colorless.toFixed(2)} ₺` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Fiyat Renkli</Typography>
                <Typography variant="body1" fontWeight={600} color="secondary.main">
                  {selectedItem.price_colored ? `${selectedItem.price_colored.toFixed(2)} ₺` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Fiyat Çift Renk</Typography>
                <Typography variant="body1" fontWeight={600} color="warning.main">
                  {selectedItem.price_double_color ? `${selectedItem.price_double_color.toFixed(2)} ₺` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="text.secondary">Kalınlık</Typography>
                <Typography variant="body1">{selectedItem.thickness_mm ? `${selectedItem.thickness_mm} mm` : '-'}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="text.secondary">En</Typography>
                <Typography variant="body1">{selectedItem.width_mm || '-'}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="text.secondary">Boy</Typography>
                <Typography variant="body1">{selectedItem.height_mm || '-'}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="text.secondary">M²</Typography>
                <Typography variant="body1">{selectedItem.area_m2 ? selectedItem.area_m2.toFixed(2) : '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedItem.has_camera && <Chip label="Kameralı" icon={<span>📷</span>} size="small" color="info" />}
                  {selectedItem.has_sensor && <Chip label="Sensörlü" icon={<span>📡</span>} size="small" color="info" />}
                  {selectedItem.is_encapsulated && <Chip label="Enkapsüllü" icon={<span>📦</span>} size="small" color="secondary" />}
                  <Chip 
                    label={selectedItem.is_active ? 'Aktif' : 'Pasif'} 
                    size="small" 
                    color={selectedItem.is_active ? 'success' : 'error'} 
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Düzenleme Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cam Fiyat Düzenle
          <IconButton onClick={() => setEditDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ürün Kodu"
                  value={selectedItem.product_code || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, product_code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stok Adı"
                  value={selectedItem.stock_name || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, stock_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Tedarikçi"
                  value={selectedItem.supplier || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, supplier: e.target.value })}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier} value={supplier}>
                      {supplier}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Kategori"
                  value={selectedItem.category || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Konum"
                  value={selectedItem.position_text || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, position_text: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Özellikler"
                  value={selectedItem.features || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, features: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fiyat Renksiz (₺)"
                  value={selectedItem.price_colorless || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price_colorless: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fiyat Renkli (₺)"
                  value={selectedItem.price_colored || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price_colored: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fiyat Çift Renk (₺)"
                  value={selectedItem.price_double_color || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price_double_color: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kalınlık (mm)"
                  value={selectedItem.thickness_mm || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, thickness_mm: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="En (mm)"
                  value={selectedItem.width_mm || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, width_mm: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Boy (mm)"
                  value={selectedItem.height_mm || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, height_mm: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="M²"
                  value={selectedItem.area_m2 || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, area_m2: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

