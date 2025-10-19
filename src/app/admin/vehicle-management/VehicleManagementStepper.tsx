'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Stack,
} from '@mui/material'
import {
  ArrowForward,
  ArrowBack,
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
  DirectionsCar,
  CarRepair,
} from '@mui/icons-material'
import { AddModelModal } from './AddModelModal'

const steps = ['Kategori Seç', 'Marka Seç', 'Model Yönet']

interface Category {
  id: string
  name: string
  is_active: boolean
}

interface Brand {
  id: string
  name: string
  category_id: string
  category_name?: string
  is_active: boolean
}

interface Model {
  id: string
  name: string
  brand_id: string
  brand_name?: string
  is_active: boolean
}

export function VehicleManagementStepper() {
  const [activeStep, setActiveStep] = useState(0)
  
  // Data
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  
  // Loading
  const [loading, setLoading] = useState(false)
  
  // Modal
  const [addModelModalOpen, setAddModelModalOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Load brands when category selected
  useEffect(() => {
    if (selectedCategory) {
      loadBrands(selectedCategory.id)
    }
  }, [selectedCategory])

  // Load models when brand selected
  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand.id)
    }
  }, [selectedBrand])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/parameters/vehicle_categories')
      const data = await res.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error('Kategori yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async (categoryId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/parameters/vehicle_brands')
      const data = await res.json()
      // Kategoriye göre filtrele
      const filtered = (data.data || []).filter((b: Brand) => b.category_id === categoryId)
      setBrands(filtered)
    } catch (error) {
      console.error('Marka yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadModels = async (brandId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/parameters/vehicle_models')
      const data = await res.json()
      // Markaya göre filtrele
      const filtered = (data.data || []).filter((m: Model) => m.brand_id === brandId)
      setModels(filtered)
    } catch (error) {
      console.error('Model yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setSelectedBrand(null)
    setModels([])
    handleNext()
  }

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand)
    handleNext()
  }

  const handleAddModel = async (modelName: string) => {
    if (!selectedBrand) return

    try {
      const response = await fetch('/api/parameters/vehicle_models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          brand_id: selectedBrand.id,
          is_active: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Model eklenemedi')
      }

      // Başarılı - modelleri yeniden yükle
      await loadModels(selectedBrand.id)
      setSnackbar({ open: true, message: `${modelName} modeli başarıyla eklendi!`, severity: 'success' })
    } catch (error) {
      console.error('Model ekleme hatası:', error)
      throw error // Modal'da gösterilmesi için hatayı fırlat
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon /> Araç Kategorisi Seçin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Yönetmek istediğiniz araç kategorisini seçin
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {categories.map((category) => (
                <Card
                  key={category.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                    border: '2px solid',
                    borderColor: selectedCategory?.id === category.id ? 'primary.main' : 'transparent',
                  }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent>
                    <Typography variant="h6">{category.name}</Typography>
                    <Chip
                      label={category.is_active ? 'Aktif' : 'Pasif'}
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>

            {categories.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Henüz kategori eklenmemiş. Parametreler sayfasından kategori ekleyebilirsiniz.
              </Alert>
            )}
          </Box>
        )

      case 1:
        return (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`Kategori: ${selectedCategory?.name}`}
                onDelete={() => {
                  setActiveStep(0)
                  setSelectedCategory(null)
                }}
                color="primary"
              />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar /> Araç Markası Seçin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedCategory?.name} kategorisindeki markaları görebilirsiniz
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {brands.map((brand) => (
                <Card
                  key={brand.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                    border: '2px solid',
                    borderColor: selectedBrand?.id === brand.id ? 'primary.main' : 'transparent',
                  }}
                  onClick={() => handleBrandSelect(brand)}
                >
                  <CardContent>
                    <Typography variant="h6">{brand.name}</Typography>
                    <Chip
                      label={brand.is_active ? 'Aktif' : 'Pasif'}
                      color={brand.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>

            {brands.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Bu kategoride henüz marka yok. Parametreler sayfasından marka ekleyebilirsiniz.
              </Alert>
            )}
          </Box>
        )

      case 2:
        return (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Kategori: ${selectedCategory?.name}`}
                onDelete={() => {
                  setActiveStep(0)
                  setSelectedCategory(null)
                  setSelectedBrand(null)
                }}
                color="primary"
              />
              <Chip
                label={`Marka: ${selectedBrand?.name}`}
                onDelete={() => {
                  setActiveStep(1)
                  setSelectedBrand(null)
                }}
                color="primary"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CarRepair /> {selectedBrand?.name} Modelleri
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddModelModalOpen(true)}
              >
                Yeni Model Ekle
              </Button>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {models.map((model) => (
                <Card key={model.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{model.name}</Typography>
                        <Chip
                          label={model.is_active ? 'Aktif' : 'Pasif'}
                          color={model.is_active ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {models.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Bu markada henüz model yok. &quot;Yeni Model Ekle&quot; butonuna tıklayarak ekleyebilirsiniz.
              </Alert>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Araç Yönetimi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Kategori → Marka → Model hiyerarşisi ile araç bilgilerini yönetin
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Geri
          </Button>
          
          {activeStep < 2 && (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              disabled={
                (activeStep === 0 && !selectedCategory) ||
                (activeStep === 1 && !selectedBrand)
              }
            >
              İleri
            </Button>
          )}
        </Box>
      </Paper>

      {/* Add Model Modal */}
      <AddModelModal
        open={addModelModalOpen}
        onClose={() => setAddModelModalOpen(false)}
        onSave={handleAddModel}
        brandName={selectedBrand?.name || ''}
        categoryName={selectedCategory?.name || ''}
      />

      {/* Success Snackbar */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  )
}

