'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Collapse,
  Divider,
} from '@mui/material'
import {
  Clear,
  FilterList,
  Download,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Check,
} from '@mui/icons-material'

interface AutocompleteOption {
  label: string
  value: string
  productCode?: string
  stockName?: string
}

interface PriceResult {
  id: string
  product_code: string
  stock_name: string
  vehicle_category_name?: string
  vehicle_brand_name?: string
  vehicle_model_name?: string
  model_year_start?: string
  model_year_end?: string
  glass_position_name?: string
  glass_type_name?: string
  glass_brand_name?: string
  glass_color_name?: string
  price_colorless: number
  price_colored?: number
  price_double_color?: number
  features?: string
  has_camera: boolean
  has_sensor: boolean
  is_encapsulated: boolean
  hole_info?: string
  thickness_mm?: number
  width_mm?: number
  height_mm?: number
}

interface ParameterOption {
  id: string
  name: string
}

export function PriceQueryClient() {
  // Ana arama
  const [searchValue, setSearchValue] = useState<AutocompleteOption | null>(null)
  const [searchInputValue, setSearchInputValue] = useState('')
  const [autocompleteOptions, setAutocompleteOptions] = useState<AutocompleteOption[]>([])
  const [autocompleteLoading, setAutocompleteLoading] = useState(false)
  
  // Sonuçlar
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PriceResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  
  // Filtreler
  const [showFilters, setShowFilters] = useState(false)
  const [vehicleCategories, setVehicleCategories] = useState<ParameterOption[]>([])
  const [vehicleBrands, setVehicleBrands] = useState<ParameterOption[]>([])
  const [vehicleModels, setVehicleModels] = useState<ParameterOption[]>([])
  const [glassPositions, setGlassPositions] = useState<ParameterOption[]>([])
  
  // Seçili filtreler
  const [selectedCategory, setSelectedCategory] = useState<ParameterOption | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<ParameterOption | null>(null)
  const [selectedModel, setSelectedModel] = useState<ParameterOption | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<ParameterOption | null>(null)

  // Dinamik fiyat kolonları
  const [priceColumns, setPriceColumns] = useState<string[]>(['price_colorless', 'price_colored', 'price_double_color'])

  useEffect(() => {
    loadParameters()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadBrandsByCategory(selectedCategory.id)
    } else {
      setVehicleBrands([])
      setSelectedBrand(null)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedBrand) {
      loadModelsByBrand(selectedBrand.id)
    } else {
      setVehicleModels([])
      setSelectedModel(null)
    }
  }, [selectedBrand])

  // Autocomplete - kullanıcı yazmaya başladığında tetiklenir
  useEffect(() => {
    if (searchInputValue.length >= 2) {
      const timer = setTimeout(() => {
        loadAutocomplete(searchInputValue)
      }, 300) // 300ms debounce
      
      return () => clearTimeout(timer)
    } else {
      setAutocompleteOptions([])
    }
  }, [searchInputValue])

  // Sonuçlardan dinamik fiyat kolonlarını belirle
  useEffect(() => {
    if (results.length > 0) {
      const columns = new Set<string>()
      results.forEach(result => {
        if (result.price_colorless > 0) columns.add('price_colorless')
        if (result.price_colored && result.price_colored > 0) columns.add('price_colored')
        if (result.price_double_color && result.price_double_color > 0) columns.add('price_double_color')
      })
      setPriceColumns(Array.from(columns))
    }
  }, [results])

  const loadParameters = async () => {
    try {
      // Araç kategorileri
      const categoriesRes = await fetch('/api/parameters/vehicle_categories')
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setVehicleCategories(data.data || [])
      }

      // Cam pozisyonları
      const positionsRes = await fetch('/api/parameters/glass_positions')
      if (positionsRes.ok) {
        const data = await positionsRes.json()
        setGlassPositions(data.data || [])
      }
    } catch (error) {
      console.error('Parametreler yüklenirken hata:', error)
    }
  }

  const loadBrandsByCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/parameters/vehicle_brands?category_id=${categoryId}`)
      if (res.ok) {
        const data = await res.json()
        setVehicleBrands(data.data || [])
      }
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error)
    }
  }

  const loadModelsByBrand = async (brandId: string) => {
    try {
      const res = await fetch(`/api/parameters/vehicle_models?brand_id=${brandId}`)
      if (res.ok) {
        const data = await res.json()
        setVehicleModels(data.data || [])
      }
    } catch (error) {
      console.error('Modeller yüklenirken hata:', error)
    }
  }

  const loadAutocomplete = async (query: string) => {
    setAutocompleteLoading(true)
    try {
      // Stok kodu ve ürün adı araması
      const params = new URLSearchParams()
      params.append('q', query)
      params.append('limit', '20')

      const res = await fetch(`/api/price-query/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const options: AutocompleteOption[] = data.results.map((item: PriceResult) => ({
          label: `${item.product_code} - ${item.stock_name.substring(0, 60)}...`,
          value: item.product_code,
          productCode: item.product_code,
          stockName: item.stock_name,
        }))
        setAutocompleteOptions(options)
      }
    } catch (error) {
      console.error('Autocomplete hatası:', error)
    } finally {
      setAutocompleteLoading(false)
    }
  }

  const handleSearch = async () => {
    // En az bir arama kriteri olmalı
    if (!searchValue && !selectedCategory && !selectedBrand && !selectedModel && !selectedPosition) {
      return
    }

    setLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams()
      
      // Stok kodu veya ürün adı araması
      if (searchValue) {
        params.append('q', searchValue.value)
      }
      
      // Filtreler
      if (selectedCategory) params.append('vehicle_category_id', selectedCategory.id)
      if (selectedBrand) params.append('vehicle_brand_id', selectedBrand.id)
      if (selectedModel) params.append('vehicle_model_id', selectedModel.id)
      if (selectedPosition) params.append('glass_position_id', selectedPosition.id)

      const res = await fetch(`/api/price-query/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
        
        // Arama logunu kaydet (admin istatistikleri için)
        logSearch({
          search_type: searchValue ? 'quick_search' : 'advanced_filter',
          search_term: searchValue?.value,
          vehicle_category_id: selectedCategory?.id,
          vehicle_brand_id: selectedBrand?.id,
          vehicle_model_id: selectedModel?.id,
          glass_position_id: selectedPosition?.id,
          result_count: data.results?.length || 0,
        })
      }
    } catch (error) {
      console.error('Arama hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const logSearch = async (logData: {
    search_type: string
    search_term?: string
    vehicle_category_id?: string
    vehicle_brand_id?: string
    vehicle_model_id?: string
    glass_position_id?: string
    result_count: number
    selected_product_id?: string
    selected_product_code?: string
  }) => {
    try {
      // Log kaydı başarısız olsa bile kullanıcı deneyimini etkilemesin
      await fetch('/api/price-query/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      })
    } catch (error) {
      // Sessizce hata logla, kullanıcıyı rahatsız etme
      console.debug('Log kaydedilemedi:', error)
    }
  }

  const handleClear = () => {
    setSearchValue(null)
    setSearchInputValue('')
    setAutocompleteOptions([])
    setSelectedCategory(null)
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedPosition(null)
    setResults([])
    setHasSearched(false)
    setPriceColumns(['price_colorless', 'price_colored', 'price_double_color'])
  }

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price)
  }

  const getPriceColumnName = (column: string): string => {
    const names: Record<string, string> = {
      price_colorless: 'Renksiz',
      price_colored: 'Renkli',
      price_double_color: 'Çift Renk / Mavi',
    }
    return names[column] || column
  }

  const getPrice = (result: PriceResult, column: string): number | undefined => {
    if (column === 'price_colorless') return result.price_colorless
    if (column === 'price_colored') return result.price_colored
    if (column === 'price_double_color') return result.price_double_color
    return undefined
  }

  const handleExport = () => {
    const priceHeaders = priceColumns.map(col => getPriceColumnName(col))
    const headers = ['Stok Kodu', 'Ürün Adı', ...priceHeaders, 'Renk', 'Marka', 'Model', 'Cam Tipi']
    
    const rows = results.map(r => [
      r.product_code,
      r.stock_name,
      ...priceColumns.map(col => getPrice(r, col) || '-'),
      r.glass_color_name || '-',
      r.vehicle_brand_name || '-',
      r.vehicle_model_name || '-',
      r.glass_position_name || '-',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fiyat-sorgulama-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Box>
      {/* Başlık */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">
          💰 Fiyat Sorgulama
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Stok kodu veya ürün adı yazarak hızlıca fiyat sorgulayın
        </Typography>
      </Box>

      {/* Ana Arama Kartı */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: '2px solid',
          borderColor: 'primary.light',
          background: 'linear-gradient(135deg, rgba(2, 86, 145, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Ana Arama Alanı */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
              🔍 Stok Kodu veya Ürün Adı ile Ara
            </Typography>
            <Autocomplete
              freeSolo
              fullWidth
              options={autocompleteOptions}
              value={searchValue}
              onChange={(_event, newValue) => {
                if (typeof newValue === 'string') {
                  setSearchValue({ label: newValue, value: newValue })
                } else {
                  setSearchValue(newValue)
                }
                // Seçim yapıldığında otomatik ara
                if (newValue) {
                  setTimeout(() => handleSearch(), 100)
                }
              }}
              inputValue={searchInputValue}
              onInputChange={(_event, newInputValue) => {
                setSearchInputValue(newInputValue)
              }}
              loading={autocompleteLoading}
              loadingText="Aranıyor..."
              noOptionsText="Sonuç bulunamadı. En az 2 karakter yazın."
              getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Örn: 123456 veya ön cam pilkington"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {autocompleteLoading ? <CircularProgress color="primary" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                    sx: {
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      py: 1.5,
                      pl: 2,
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props as { key: string; [key: string]: unknown }
                return (
                  <Box component="li" key={key} {...otherProps} sx={{ py: 1.5, px: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} width="100%">
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {typeof option === 'string' ? option : option.productCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {typeof option === 'string' ? '' : option.stockName}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )
              }}
            />
          </Box>

          {/* Butonlar */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    disabled={loading || (!searchValue && !selectedCategory && !selectedBrand && !selectedModel && !selectedPosition)}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      color: '#FFFFFF',
                      bgcolor: '#002C51',
                      boxShadow: '0 4px 12px rgba(0, 44, 81, 0.4)',
                      '&:hover': {
                        bgcolor: '#001F3A',
                        boxShadow: '0 6px 16px rgba(0, 44, 81, 0.5)',
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        color: '#FFFFFF',
                        bgcolor: '#002C51',
                      },
                    }}
                  >
                    Ara
                  </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleClear}
                startIcon={<Clear />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: 'rgba(2, 86, 145, 0.05)',
                  },
                }}
              >
                Temizle
              </Button>
            </Stack>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={showFilters ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              endIcon={<FilterList />}
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(2, 86, 145, 0.05)',
                },
              }}
            >
              {showFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler'}
            </Button>
          </Stack>

          {/* Gelişmiş Filtreler */}
          <Collapse in={showFilters}>
            <Divider sx={{ my: 3 }} />
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: 'rgba(2, 86, 145, 0.03)',
                border: '1px dashed',
                borderColor: 'primary.light',
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight={700} color="primary" sx={{ mb: 3 }}>
                🎯 Detaylı Filtreleme
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                    Araç Kategorisi
                  </Typography>
                  <Autocomplete
                    options={vehicleCategories}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    value={selectedCategory}
                    onChange={(_e, value) => setSelectedCategory(value)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder="Kategori seçiniz..."
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            '& input': {
                              py: 2,
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                    Araç Markası
                  </Typography>
                  <Autocomplete
                    options={vehicleBrands}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    value={selectedBrand}
                    onChange={(_e, value) => setSelectedBrand(value)}
                    disabled={!selectedCategory}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder={selectedCategory ? "Marka seçiniz..." : "⚠️ Önce kategori seçin"}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: selectedCategory ? 'white' : '#f5f5f5',
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            '& input': {
                              py: 2,
                            },
                            '&:hover': {
                              boxShadow: selectedCategory ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                    Araç Modeli
                  </Typography>
                  <Autocomplete
                    options={vehicleModels}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    value={selectedModel}
                    onChange={(_e, value) => setSelectedModel(value)}
                    disabled={!selectedBrand}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder={selectedBrand ? "Model seçiniz..." : "⚠️ Önce marka seçin"}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: selectedBrand ? 'white' : '#f5f5f5',
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            '& input': {
                              py: 2,
                            },
                            '&:hover': {
                              boxShadow: selectedBrand ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                    Cam Pozisyonu
                  </Typography>
                  <Autocomplete
                    options={glassPositions}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    value={selectedPosition}
                    onChange={(_e, value) => setSelectedPosition(value)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder="Cam pozisyonu seçiniz..."
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            '& input': {
                              py: 2,
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    px: 5,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    color: '#FFFFFF',
                    bgcolor: '#002C51',
                    boxShadow: '0 4px 12px rgba(0, 44, 81, 0.4)',
                    '&:hover': {
                      bgcolor: '#001F3A',
                      boxShadow: '0 6px 16px rgba(0, 44, 81, 0.5)',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      color: '#FFFFFF',
                      bgcolor: '#002C51',
                    },
                  }}
                >
                  Filtrelerle Ara
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Yükleniyor */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {/* Sonuçlar */}
      {!loading && hasSearched && results.length > 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ✅ {results.length} Ürün Bulundu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aşağıdaki sonuçlar arama kriterlerinize uygun
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
                sx={{ fontWeight: 600 }}
              >
                Excel&apos;e Aktar
              </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600, border: '1px solid', borderColor: 'divider' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#002C51', color: '#FFFFFF', fontSize: '0.9rem', minWidth: 120 }}>
                      Stok Kodu
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#002C51', color: '#FFFFFF', fontSize: '0.9rem', minWidth: 250 }}>
                      Ürün Adı
                    </TableCell>
                    {priceColumns.map(column => (
                      <TableCell 
                        key={column}
                        align="right"
                        sx={{ 
                          fontWeight: 700, 
                          bgcolor: '#00A86B', 
                          color: '#FFFFFF', 
                          fontSize: '0.9rem',
                          minWidth: 130
                        }}
                      >
                        💰 {getPriceColumnName(column)}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#002C51', color: '#FFFFFF', fontSize: '0.9rem', minWidth: 100 }}>
                      Cam Rengi
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#002C51', color: '#FFFFFF', fontSize: '0.9rem', minWidth: 150 }}>
                      Araç
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#002C51', color: '#FFFFFF', fontSize: '0.9rem', minWidth: 120 }}>
                      Cam Tipi
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#002C51', color: '#FFFFFF', fontSize: '0.9rem', minWidth: 100 }}>
                      Özellikler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id} hover sx={{ '&:hover': { bgcolor: 'rgba(2, 86, 145, 0.05)' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {result.product_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {result.stock_name}
                        </Typography>
                      </TableCell>
                      {priceColumns.map(column => (
                        <TableCell 
                          key={column}
                          align="right" 
                          sx={{ bgcolor: 'rgba(0, 168, 107, 0.05)' }}
                        >
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            {formatPrice(getPrice(result, column))}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Chip 
                          label={result.glass_color_name || 'Belirtilmemiş'} 
                          size="small"
                          sx={{ 
                            bgcolor: result.glass_color_name ? 'rgba(2, 86, 145, 0.1)' : 'rgba(0,0,0,0.05)',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {result.vehicle_brand_name} {result.vehicle_model_name}
                        </Typography>
                        {result.model_year_start && (
                          <Typography variant="caption" color="text.secondary">
                            ({result.model_year_start}-{result.model_year_end})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {result.glass_position_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.glass_type_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                          {result.has_camera && (
                            <Chip label="📷" size="small" color="primary" sx={{ fontSize: '10px', height: 20, minWidth: 30 }} />
                          )}
                          {result.has_sensor && (
                            <Chip label="📡" size="small" color="secondary" sx={{ fontSize: '10px', height: 20, minWidth: 30 }} />
                          )}
                          {result.is_encapsulated && (
                            <Chip label="🔒" size="small" color="info" sx={{ fontSize: '10px', height: 20, minWidth: 30 }} />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Sonuç Bulunamadı */}
      {!loading && hasSearched && results.length === 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3, 
            fontSize: '1rem',
            py: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            🔍 Sonuç Bulunamadı
          </Typography>
          <Typography>
            Arama kriterlerinize uygun ürün bulunamadı. Farklı kelimeler veya stok kodu deneyin.
          </Typography>
        </Alert>
      )}

      {/* Yardım İpucu - Kompakt */}
      {!hasSearched && !loading && (
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          <Typography variant="body1" fontWeight={600} gutterBottom>
            💡 Hızlı Kullanım
          </Typography>
          <Typography variant="body2">
            Yukarıdaki arama kutusuna <strong>stok kodu</strong> veya <strong>ürün adı</strong> yazmaya başlayın. 
            Otomatik öneriler çıkacak, birini seçin veya Enter&apos;a basın. Tüm fiyatlar anında gösterilecek.
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
