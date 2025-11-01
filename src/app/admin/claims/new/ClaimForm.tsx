'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Chip,
} from '@mui/material'
import { Add, Delete, Save, Search, ExpandMore, Phone } from '@mui/icons-material'
import { ClaimFormData, ClaimItem, ParameterOption } from '@/types/claim'

interface ClaimFormProps {
  mode?: 'create' | 'edit'
  claimId?: string
  initialFormData?: ClaimFormData
  initialItems?: ClaimItem[]
  onSuccess?: () => void
}

export default function ClaimForm({ 
  mode = 'create', 
  claimId,
  initialFormData,
  initialItems,
  onSuccess 
}: ClaimFormProps) {
  // Form state
  const [formData, setFormData] = useState<ClaimFormData>(initialFormData || {
    insurance_company_id: '',
    agency_code: '',
    agency_name: '',
    policy_number: '',
    policy_start_date: '',
    policy_end_date: '',
    incident_type_id: '',
    damage_type_id: '',
    incident_city_id: '',
    incident_district_id: '',
    incident_date: '',
    insured_type_id: '',
    insured_name: '',
    insured_tax_office: '',
    insured_tax_number: '',
    insured_phone: '',
    insured_mobile: '',
    driver_same_as_insured: false,
    driver_name: '',
    driver_tc_number: '',
    driver_phone: '',
    driver_birth_date: '',
    driver_license_class_id: '',
    driver_license_date: '',
    driver_license_place: '',
    driver_license_number: '',
    vehicle_plate: '',
    vehicle_model_year: '',
    vehicle_usage_type_id: '',
    vehicle_category_id: '',
    vehicle_brand_id: '',
    vehicle_model_id: '',
    notes: '',
  })

  const [items, setItems] = useState<ClaimItem[]>(initialItems || [])
  const [currentItem, setCurrentItem] = useState<Partial<ClaimItem>>({
    glass_position_id: '',
    glass_type_id: '',
    glass_brand_id: '',
    glass_code: '',
    glass_color_id: '',
    glass_operation_id: '',
    installation_method_id: '',
    service_location_id: '',
    unit_price: 0,
    quantity: 1,
    customer_contribution: false,
    additional_material_cost: 0,
    additional_material_reason: '',
  })

  // Parametrik veriler
  const [insuranceCompanies, setInsuranceCompanies] = useState<ParameterOption[]>([])
  const [insuredTypes, setInsuredTypes] = useState<ParameterOption[]>([])
  const [incidentTypes, setIncidentTypes] = useState<ParameterOption[]>([])
  const [damageTypes, setDamageTypes] = useState<ParameterOption[]>([])
  const [cities, setCities] = useState<ParameterOption[]>([])
  const [districts, setDistricts] = useState<ParameterOption[]>([])
  const [licenseClasses, setLicenseClasses] = useState<ParameterOption[]>([])
  const [vehicleCategories, setVehicleCategories] = useState<ParameterOption[]>([])
  const [vehicleBrands, setVehicleBrands] = useState<ParameterOption[]>([])
  const [vehicleModels, setVehicleModels] = useState<ParameterOption[]>([])
  const [vehicleUsageTypes, setVehicleUsageTypes] = useState<ParameterOption[]>([])
  const [glassPositions, setGlassPositions] = useState<ParameterOption[]>([])
  const [glassTypes, setGlassTypes] = useState<ParameterOption[]>([])
  const [glassBrands, setGlassBrands] = useState<ParameterOption[]>([])
  const [glassColors, setGlassColors] = useState<ParameterOption[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [glassOperations, setGlassOperations] = useState<ParameterOption[]>([])
  const [installationMethods, setInstallationMethods] = useState<ParameterOption[]>([])
  const [serviceLocations, setServiceLocations] = useState<ParameterOption[]>([])

  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' })
  const [glassSearchQuery, setGlassSearchQuery] = useState('')
  const [allVehicles, setAllVehicles] = useState<Record<string, unknown>[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Record<string, unknown> | null>(null)
  const [availableGlassPrices, setAvailableGlassPrices] = useState<Record<string, unknown>[]>([])
  const [glassSearchOptions, setGlassSearchOptions] = useState<Record<string, unknown>[]>([]) // Autocomplete için
  const [selectedGlass, setSelectedGlass] = useState<Record<string, unknown> | null>(null) // Araça uygun cam fiyatları

  // Parametrik verileri yükle
  useEffect(() => {
    loadParameterData()
    loadAllVehicles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (formData.incident_city_id) {
      loadDistricts(formData.incident_city_id)
    }
  }, [formData.incident_city_id])

  // Kategori değiştiğinde markaları yükle
  useEffect(() => {
    if (formData.vehicle_category_id) {
      loadBrandsByCategory(formData.vehicle_category_id)
    }
  }, [formData.vehicle_category_id])

  // Marka değiştiğinde modelleri yükle
  useEffect(() => {
    if (formData.vehicle_brand_id) {
      loadModelsByBrand(formData.vehicle_brand_id)
    }
  }, [formData.vehicle_brand_id])

  // Cam arama - Autocomplete için otomatik arama (debounced)
  useEffect(() => {
    // Arama yapılmıyorsa ve araç seçiliyse, o araca ait camları göster
    if (!glassSearchQuery || glassSearchQuery.length < 2) {
      if (availableGlassPrices.length > 0) {
        console.log('🚗 Araç seçili, camları göster:', availableGlassPrices.length)
        setGlassSearchOptions(availableGlassPrices)
      } else {
        setGlassSearchOptions([])
      }
      return
    }

    const timer = setTimeout(async () => {
      try {
        console.log('🔍 Autocomplete cam aranıyor:', glassSearchQuery)
        const params = new URLSearchParams({
          detailed: 'true',
          search: glassSearchQuery,
          ...(formData.vehicle_model_id && { vehicle_model_id: formData.vehicle_model_id })
        })
        
        const res = await fetch(`/api/glass-prices?${params}`)
        const data = await res.json()
        
        console.log('📦 Autocomplete bulunan cam sayısı:', data.data?.length || 0)
        setGlassSearchOptions(data.data || [])
      } catch (error) {
        console.error('❌ Autocomplete cam arama hatası:', error)
        setGlassSearchOptions([])
      }
    }, 500) // 500ms bekle

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glassSearchQuery])

  // Sürücü sigortalı ile aynı checkbox'u
  useEffect(() => {
    if (formData.driver_same_as_insured) {
      setFormData(prev => ({
        ...prev,
        driver_name: prev.insured_name,
        driver_tc_number: prev.insured_tax_number,
        driver_phone: prev.insured_phone || prev.insured_mobile,
      }))
    }
  }, [formData.driver_same_as_insured, formData.insured_name, formData.insured_tax_number, formData.insured_phone, formData.insured_mobile])

  const loadParameterData = async () => {
    try {
      const endpoints = [
        'insurance_companies',
        'insured_types',
        'incident_types',
        'damage_types',
        'cities',
        'license_classes',
        'vehicle_categories',
        'vehicle_usage_types',
        'glass_positions',
        'vehicle_glass_types',
        'glass_brands',
        'glass_colors',
        'glass_operations',
        'installation_methods',
        'service_locations',
      ]

      const results = await Promise.all(
        endpoints.map(endpoint => 
          fetch(`/api/parameters/${endpoint}?only_active=true`).then(res => res.json())
        )
      )

      setInsuranceCompanies(results[0].data || [])
      setInsuredTypes(results[1].data || [])
      setIncidentTypes(results[2].data || [])
      setDamageTypes(results[3].data || [])
      setCities(results[4].data || [])
      setLicenseClasses(results[5].data || [])
      setVehicleCategories(results[6].data || [])
      setVehicleUsageTypes(results[7].data || [])
      setGlassPositions(results[8].data || [])
      setGlassTypes(results[9].data || [])
      setGlassBrands(results[10].data || [])
      setGlassColors(results[11].data || [])
      setGlassOperations(results[12].data || [])
      setInstallationMethods(results[13].data || [])
      setServiceLocations(results[14].data || [])
    } catch (error) {
      console.error('Parametrik veri yükleme hatası:', error)
      showSnackbar('Parametrik veriler yüklenirken hata oluştu', 'error')
    }
  }

  const loadDistricts = async (cityId: string) => {
    try {
      const res = await fetch(`/api/parameters/districts`)
      const data = await res.json()
      const filtered = data.data?.filter((d: Record<string, unknown>) => d.city_id === cityId) || []
      setDistricts(filtered)
    } catch (error) {
      console.error('İlçe yükleme hatası:', error)
    }
  }

  const loadBrandsByCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/parameters/vehicle_brands`)
      const data = await res.json()
      const filtered = data.data?.filter((b: Record<string, unknown>) => b.category_id === categoryId) || []
      setVehicleBrands(filtered)
      setVehicleModels([]) // Modelleri sıfırla
    } catch (error) {
      console.error('Marka yükleme hatası:', error)
    }
  }

  const loadModelsByBrand = async (brandId: string) => {
    try {
      const res = await fetch(`/api/parameters/vehicle_models`)
      const data = await res.json()
      const filtered = data.data?.filter((m: Record<string, unknown>) => m.brand_id === brandId) || []
      setVehicleModels(filtered)
    } catch (error) {
      console.error('Model yükleme hatası:', error)
    }
  }

  const loadAllVehicles = async () => {
    try {
      const res = await fetch(`/api/parameters/vehicle_models`)
      const data = await res.json()
      
      // Tüm araçları marka ve kategori bilgileriyle birlikte getir
      const vehicles = data.data || []
      setAllVehicles(vehicles)
    } catch (error) {
      console.error('Araç yükleme hatası:', error)
    }
  }

  const handleVehicleSelect = async (vehicle: Record<string, unknown> | null) => {
    if (!vehicle) {
      setSelectedVehicle(null)
      setAvailableGlassPrices([]) // Camları temizle
      return
    }

    console.log('Seçilen araç:', vehicle) // Debug için
    setSelectedVehicle(vehicle)
    
    // Araç bilgilerini form alanlarına doldur
    const brand = vehicle.vehicle_brands
    const categoryId = brand?.category_id
    const brandId = vehicle.brand_id
    const vehicleId = vehicle.id

    console.log('Brand:', brand, 'CategoryId:', categoryId, 'BrandId:', brandId) // Debug

    // Tüm bilgiler mevcut mu kontrol et
    if (!brand || !categoryId || !brandId || !vehicleId) {
      console.error('Eksik bilgiler:', { brand, categoryId, brandId, vehicleId })
      showSnackbar('Araç bilgileri eksik veya hatalı', 'error')
      return
    }

    try {
      // 1. Kategoriyi seç
      handleInputChange('vehicle_category_id', categoryId)
      
      // 2. Kategori'ye ait markaları yükle
      await loadBrandsByCategory(categoryId)
      
      // 3. Markayı seç
      await new Promise(resolve => setTimeout(resolve, 100))
      handleInputChange('vehicle_brand_id', brandId)
      
      // 4. Marka'ya ait modelleri yükle
      await loadModelsByBrand(brandId)
      
      // 5. Modeli seç
      await new Promise(resolve => setTimeout(resolve, 100))
      handleInputChange('vehicle_model_id', vehicleId)
      
      // 6. 🎯 Bu araca uygun cam fiyatlarını çek
      await loadGlassPricesForVehicle(vehicleId)
      
      showSnackbar('Araç bilgileri dolduruldu', 'success')
    } catch (error) {
      console.error('Araç seçim hatası:', error)
      showSnackbar('Araç bilgileri yüklenirken hata oluştu', 'error')
    }
  }

  // 🎯 Araca uygun cam fiyatlarını çek
  const loadGlassPricesForVehicle = async (vehicleModelId: string) => {
    try {
      // Seçilen aracın brand ve model adını al
      const vehicle = allVehicles.find(v => v.id === vehicleModelId)
      if (!vehicle) {
        console.warn('⚠️ Araç bulunamadı')
        return
      }

      const brandName = ((vehicle.vehicle_brands as Record<string, unknown>)?.name as string) || ''
      const modelName = (vehicle.name as string) || ''
      
      // Marka adını sadeleştir: "Mercedes-Benz" → "MERCEDES", "BMW" → "BMW"
      const simplifiedBrand = brandName
        .toUpperCase()
        .replace(/-/g, ' ')  // Tire kaldır
        .replace(/\(.*?\)/g, '') // Parantez içini kaldır: "Mercedes-Benz (Ticari)" → "Mercedes-Benz"
        .split(' ')[0]  // İlk kelimeyi al: "MERCEDES BENZ" → "MERCEDES"
        .trim()
      
      console.log('🔍 Cam fiyatları aranıyor:', { 
        brandName, 
        modelName, 
        simplifiedBrand 
      })
      
      // stock_name'de sadeleştirilmiş marka adını ara
      const searchTerm = simplifiedBrand
      const url = `/api/glass-prices?detailed=true&search=${encodeURIComponent(searchTerm)}`
      console.log('📡 API URL:', url)
      
      const res = await fetch(url)
      const data = await res.json()
      
      console.log('📦 API Yanıtı:', data)
      console.log('🎯 Bulunan cam sayısı:', data.data?.length || 0)
      
      setAvailableGlassPrices(data.data || [])
      
      if (data.data && data.data.length > 0) {
        showSnackbar(`✅ ${data.data.length} adet cam fiyatı bulundu`, 'success')
      } else {
        showSnackbar('⚠️ Bu araç için henüz cam fiyatı tanımlanmamış', 'warning')
      }
    } catch (error) {
      console.error('❌ Cam fiyatları yükleme hatası:', error)
      setAvailableGlassPrices([])
      showSnackbar('Cam fiyatları yüklenirken hata oluştu', 'error')
    }
  }

  const handleInputChange = (field: keyof ClaimFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (field: keyof ClaimItem, value: string | number | boolean) => {
    setCurrentItem(prev => {
      const updated = { ...prev, [field]: value }
      
      // Fiyat hesaplama
      if (field === 'unit_price' || field === 'quantity') {
        const unitPrice = field === 'unit_price' ? parseFloat(value as string) || 0 : parseFloat(updated.unit_price as string) || 0
        const quantity = field === 'quantity' ? parseInt(value as string) || 1 : parseInt(updated.quantity as string) || 1
        const subtotal = unitPrice * quantity
        const vatRate = 20 // Varsayılan KDV oranı
        const vatAmount = (subtotal * vatRate) / 100
        const total = subtotal + vatAmount
        
        updated.subtotal = subtotal
        updated.vat_rate = vatRate
        updated.vat_amount = vatAmount
        updated.total_amount = total
      }
      
      return updated
    })
  }

  const handleAddItem = () => {
    if (!currentItem.glass_position_id || !currentItem.glass_type_id) {
      showSnackbar('Lütfen en az Cam Türü ve Cam Tipi seçiniz', 'error')
      return
    }

    const newItem: ClaimItem = {
      id: Date.now().toString(), // Geçici ID
      glass_position_id: currentItem.glass_position_id || '',
      glass_type_id: currentItem.glass_type_id || '',
      glass_brand_id: currentItem.glass_brand_id || '',
      glass_code: currentItem.glass_code || '',
      glass_color_id: currentItem.glass_color_id || '',
      glass_operation_id: currentItem.glass_operation_id || '',
      installation_method_id: currentItem.installation_method_id || '',
      service_location_id: currentItem.service_location_id || '',
      unit_price: currentItem.unit_price || 0,
      quantity: currentItem.quantity || 1,
      subtotal: currentItem.subtotal || 0,
      vat_rate: currentItem.vat_rate || 20,
      vat_amount: currentItem.vat_amount || 0,
      total_amount: currentItem.total_amount || 0,
      customer_contribution: currentItem.customer_contribution || false,
      additional_material_cost: currentItem.additional_material_cost || 0,
      additional_material_reason: currentItem.additional_material_reason || '',
      notes: currentItem.notes || '',
    }

    setItems(prev => [...prev, newItem])
    
    // Formu sıfırla
    setCurrentItem({
      glass_position_id: '',
      glass_type_id: '',
      glass_brand_id: '',
      glass_code: '',
      glass_color_id: '',
      glass_operation_id: '',
      installation_method_id: '',
      service_location_id: '',
      unit_price: 0,
      quantity: 1,
      customer_contribution: false,
      additional_material_cost: 0,
      additional_material_reason: '',
    })
    
    showSnackbar('Cam eklendi', 'success')
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    showSnackbar('Cam silindi', 'success')
  }


  const handleGlassSearch = async (showNotification = false) => {
    const searchTerm = glassSearchQuery.trim() || currentItem.glass_code
    
    if (!searchTerm) {
      if (showNotification) {
        showSnackbar('Lütfen cam kodu veya arama kriteri giriniz', 'error')
      }
      return
    }

    setLoading(true)
    try {
      console.log('🔍 Cam aranıyor:', searchTerm)
      // Cam kodu veya özelliklere göre ara
      const params = new URLSearchParams({
        detailed: 'true',
        search: searchTerm,
        ...(formData.vehicle_model_id && { vehicle_model_id: formData.vehicle_model_id })
      })
      
      const res = await fetch(`/api/glass-prices?${params}`)
      const data = await res.json()
      
      console.log('📦 Bulunan cam sayısı:', data.data?.length || 0)
      setAvailableGlassPrices(data.data || [])
      
      // Sadece manuel aramada bildirim göster
      if (showNotification) {
        if (data.data && data.data.length > 0) {
          showSnackbar(`✅ ${data.data.length} adet cam bulundu`, 'success')
        } else {
          showSnackbar('⚠️ Cam bulunamadı', 'warning')
        }
      }
    } catch (error) {
      console.error('❌ Cam arama hatası:', error)
      if (showNotification) {
        showSnackbar('Cam bilgileri bulunamadı', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // Autocomplete'ten cam seçimi
  const handleGlassSelect = async (glass: Record<string, unknown> | null) => {
    setSelectedGlass(glass)
    
    if (!glass) return
    
    console.log('🎯 Autocomplete\'ten seçilen cam:', glass)
    
    // ID'leri kontrol et - eğer yoksa name'lerden bulmaya çalış
    let glassPositionId = String(glass.glass_position_id || '')
    let glassTypeId = String(glass.glass_type_id || '')
    let glassBrandId = String(glass.glass_brand_id || '')
    let glassColorId = String(glass.glass_color_id || '')
    
    // ⚠️ VERİTABANI SORUNU: glass_prices tablosunda ID'ler ve name'ler NULL
    // Geçici çözüm: position_text, features, supplier kullanarak akıllı eşleştirme
    console.warn('⚠️ UYARI: glass_prices tablosunda cam bilgileri eksik!')
    console.log('📋 Gelen veri:', {
      position_text: glass.position_text,
      features: glass.features,
      supplier: glass.supplier,
      stock_name: glass.stock_name,
    })
    
    // 1️⃣ POZİSYON EŞLEŞTİRME (position_text)
    if (!glassPositionId && glass.position_text) {
      const positionText = String(glass.position_text).toLowerCase().trim()
      console.log('🔎 Pozisyon aranıyor:', positionText)
      
      let matchedPosition = null
      
      // ÖN CAM varyasyonları
      if (
        positionText.includes('ön') ||
        positionText.includes('on') ||
        positionText.includes('ö.') ||
        positionText.includes('o.') ||
        positionText === 'o' ||
        positionText === 'ö' ||
        positionText.includes('oncam') ||
        positionText.includes('öncam') ||
        positionText.includes('front')
      ) {
        matchedPosition = glassPositions.find(p => 
          p.name.toLowerCase().includes('ön cam') || 
          p.name.toLowerCase().includes('ön') ||
          p.name.toLowerCase().includes('front')
        )
      }
      // ARKA CAM varyasyonları
      else if (
        positionText.includes('arka') ||
        positionText.includes('a.') ||
        positionText === 'a' ||
        positionText.includes('arkacam') ||
        positionText.includes('rear') ||
        positionText.includes('back')
      ) {
        matchedPosition = glassPositions.find(p => 
          p.name.toLowerCase().includes('arka') || 
          p.name.toLowerCase().includes('rear') ||
          p.name.toLowerCase().includes('back')
        )
      }
      // YAN CAM / KAPI CAMI varyasyonları
      else if (
        positionText.includes('yan') ||
        positionText.includes('kapi') ||
        positionText.includes('kapı') ||
        positionText.includes('door') ||
        positionText.includes('side') ||
        positionText.includes('sağ') ||
        positionText.includes('sol') ||
        positionText.includes('left') ||
        positionText.includes('right')
      ) {
        // Sağ/Sol ayrımı
        if (positionText.includes('sağ') || positionText.includes('right') || positionText.includes('r.')) {
          matchedPosition = glassPositions.find(p => 
            p.name.toLowerCase().includes('sağ')
          )
        } else if (positionText.includes('sol') || positionText.includes('left') || positionText.includes('l.')) {
          matchedPosition = glassPositions.find(p => 
            p.name.toLowerCase().includes('sol')
          )
        }
        
        // Genel yan cam
        if (!matchedPosition) {
          matchedPosition = glassPositions.find(p => 
            p.name.toLowerCase().includes('yan') || 
            p.name.toLowerCase().includes('door') ||
            p.name.toLowerCase().includes('side')
          )
        }
      }
      // TAVAN CAMI varyasyonları
      else if (
        positionText.includes('tavan') ||
        positionText.includes('roof') ||
        positionText.includes('sunroof')
      ) {
        matchedPosition = glassPositions.find(p => 
          p.name.toLowerCase().includes('tavan') || 
          p.name.toLowerCase().includes('roof')
        )
      }
      
      if (matchedPosition) {
        glassPositionId = matchedPosition.id
        console.log(`✅ Pozisyon bulundu: "${matchedPosition.name}"`)
      } else {
        console.warn('❌ Pozisyon eşleştirilemedi. Mevcut:', glassPositions.map(p => p.name))
      }
    }
    
    // 2️⃣ CAM TİPİ EŞLEŞTİRME (features veya supplier)
    if (!glassTypeId) {
      const normalizeTextForType = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .trim()
      }
      
      const features = normalizeTextForType(String(glass.features || ''))
      const supplier = normalizeTextForType(String(glass.supplier || ''))
      const positionTextForType = normalizeTextForType(String(glass.position_text || ''))
      console.log('🔎 Cam tipi aranıyor:', features, 'supplier:', supplier)
      
      let matchedType = null
      
      // LAMİNE varyasyonları
      if (
        features.includes('lamine') ||
        features.includes('laminated') ||
        features.includes('lam')
      ) {
        matchedType = glassTypes.find(t => 
          normalizeTextForType(t.name).includes('lamine') ||
          normalizeTextForType(t.name).includes('laminated')
        )
      }
      // TEMPERE varyasyonları
      else if (
        features.includes('tempere') ||
        features.includes('tempered') ||
        features.includes('temp') ||
        features.includes('sert')
      ) {
        matchedType = glassTypes.find(t => 
          normalizeTextForType(t.name).includes('tempere') ||
          normalizeTextForType(t.name).includes('tempered')
        )
      }
      // YERLİ / ORİJİNAL / İTHAL eşleştirmesi (veritabanında bunlar var)
      else if (
        supplier.includes('yerli') ||
        features.includes('yerli')
      ) {
        matchedType = glassTypes.find(t => normalizeTextForType(t.name).includes('yerli'))
      }
      else if (
        supplier.includes('orijinal') ||
        supplier.includes('original') ||
        features.includes('orijinal') ||
        features.includes('original') ||
        supplier.includes('oem')
      ) {
        matchedType = glassTypes.find(t => normalizeTextForType(t.name).includes('orijinal'))
      }
      else if (
        supplier.includes('ithal') ||
        supplier.includes('import') ||
        features.includes('ithal')
      ) {
        matchedType = glassTypes.find(t => normalizeTextForType(t.name).includes('ithal'))
      }
      // Varsayılan: Pozisyona göre tahmin
      else {
        // Ön cam genelde YERLİ veya ilk seçenek
        matchedType = glassTypes[0] || null
      }
      
      if (matchedType) {
        glassTypeId = matchedType.id
        console.log(`✅ Cam tipi bulundu: "${matchedType.name}"`)
      } else {
        console.warn('❌ Cam tipi eşleştirilemedi. Mevcut:', glassTypes.map(t => t.name))
      }
    }
    
    // 3️⃣ CAM MARKASI EŞLEŞTİRME (supplier = cam markası!)
    if (!glassBrandId && glass.supplier) {
      // Türkçe karakterleri normalize et
      const normalizeText = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .trim()
      }
      
      const supplier = normalizeText(String(glass.supplier))
      console.log('🔎 Cam markası aranıyor (supplier):', supplier)
      console.log('📋 Mevcut cam markaları:', glassBrands.map(b => b.name))
      
      let matchedBrand = null
      
      // Tam eşleşme öncelik - supplier ile brand name birebir eşleşiyor mu?
      matchedBrand = glassBrands.find(b => {
        const brandName = normalizeText(b.name)
        // Tam eşleşme
        if (brandName === supplier || supplier === brandName) {
          console.log(`✅ TAM EŞLEŞME: "${b.name}" === "${glass.supplier}"`)
          return true
        }
        return false
      })
      
      // Tam eşleşme yoksa kısmi eşleşme dene
      if (!matchedBrand) {
        matchedBrand = glassBrands.find(b => {
          const brandName = normalizeText(b.name)
          
          // Kısmi eşleşme - birbirini içeriyor mu?
          if (brandName.includes(supplier) || supplier.includes(brandName)) {
            console.log(`✅ KISMI EŞLEŞME: "${b.name}" <-> "${glass.supplier}"`)
            return true
          }
          
          // Özel marka varyasyonları
          const specialMatches = [
            // Şişecam varyasyonları
            { variants: ['sisecam', 'sise', 'sisecam'], target: 'sise' },
            // Pilkington varyasyonları
            { variants: ['pilkington', 'pilk'], target: 'pilk' },
            // Saint Gobain varyasyonları
            { variants: ['saint', 'gobain', 'saint gobain'], target: 'saint' },
            // Fuyao varyasyonları
            { variants: ['fuyao'], target: 'fuyao' },
            // Olimpia varyasyonları
            { variants: ['olimpia', 'olimp'], target: 'olimp' },
            // Solarglass varyasyonları
            { variants: ['solarglass', 'solar'], target: 'solar' },
            // Tezcam varyasyonları
            { variants: ['tezcam', 'tez'], target: 'tez' },
          ]
          
          for (const match of specialMatches) {
            const supplierHasVariant = match.variants.some(v => supplier.includes(v))
            const brandHasTarget = brandName.includes(match.target)
            
            if (supplierHasVariant && brandHasTarget) {
              console.log(`✅ ÖZEL EŞLEŞME: "${b.name}" <-> "${glass.supplier}" (${match.target})`)
              return true
            }
          }
          
          return false
        })
      }
      
      if (matchedBrand) {
        glassBrandId = matchedBrand.id
        console.log(`✅ CAM MARKASI BULUNDU: "${matchedBrand.name}"`)
      } else {
        console.warn('❌ Cam markası eşleştirilemedi.')
        console.warn('Aranan:', glass.supplier, '(normalized:', supplier + ')')
        console.warn('Mevcut markalar:', glassBrands.map(b => `${b.name} (${normalizeText(b.name)})`))
      }
    }
    
    // 4️⃣ CAM RENGİ EŞLEŞTİRME (genelde Renksiz ama features'tan tahmin edilebilir)
    if (!glassColorId) {
      // normalizeText fonksiyonu yukarıda tanımlandı, tekrar kullanıyoruz
      const normalizeTextForColor = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .trim()
      }
      
      const features = normalizeTextForColor(String(glass.features || ''))
      const stockName = normalizeTextForColor(String(glass.stock_name || ''))
      console.log('🔎 Cam rengi tahmin ediliyor...')
      
      let matchedColor = null
      
      if (
        features.includes('renkli') ||
        features.includes('colored') ||
        features.includes('yesil') ||
        features.includes('green') ||
        features.includes('gri') ||
        features.includes('grey') ||
        stockName.includes('renkli')
      ) {
        matchedColor = glassColors.find(c => {
          const colorName = normalizeTextForColor(c.name)
          return colorName.includes('renkli') || colorName.includes('colored')
        })
      } else {
        // Varsayılan: Renksiz
        matchedColor = glassColors.find(c => {
          const colorName = normalizeTextForColor(c.name)
          return colorName.includes('renksiz') || colorName.includes('clear')
        })
      }
      
      if (matchedColor) {
        glassColorId = matchedColor.id
        console.log(`✅ Cam rengi bulundu: "${matchedColor.name}"`)
      } else {
        console.warn('❌ Cam rengi eşleştirilemedi. Mevcut:', glassColors.map(c => c.name))
      }
    }
    
    // Temel cam bilgileri
    handleItemChange('glass_position_id', glassPositionId as string)
    handleItemChange('glass_type_id', glassTypeId as string)
    handleItemChange('glass_brand_id', glassBrandId as string)
    handleItemChange('glass_color_id', glassColorId as string)
    handleItemChange('glass_code', String(glass.product_code || '') as string)
    handleItemChange('unit_price', Number(glass.price_colorless || 0) as number)
    
    // Özellikleri kontrol et ve notlara ekle
    let notes = ''
    if (glass.has_camera) notes += 'Kamera aparatlı '
    if (glass.has_sensor) notes += 'Sensör aparatlı '
    if (glass.is_encapsulated) notes += 'Enkapsül '
    if (glass.features) notes += String(glass.features) + ' '
    if (glass.position_text) notes += `Pozisyon: ${String(glass.position_text)} `
    if (notes) handleItemChange('notes', notes.trim())
    
    console.log('✅ Dropdown değerleri set edildi:', {
      glass_position_id: glassPositionId,
      glass_type_id: glassTypeId,
      glass_brand_id: glassBrandId,
      glass_color_id: glassColorId,
    })
    
    showSnackbar(`✅ ${glass.stock_name as string} - Bilgiler otomatik dolduruldu`, 'success')
  }

  // Cam fiyatından otomatik doldurma (Liste'den seçim)
  const handleSelectGlassPrice = (glassPrice: Record<string, unknown>) => {
    console.log('🎯 Liste\'den seçilen cam:', glassPrice)
    
    // Temel cam bilgileri
    handleItemChange('glass_position_id', glassPrice.glass_position_id || '')
    handleItemChange('glass_type_id', glassPrice.glass_type_id || '')
    handleItemChange('glass_brand_id', glassPrice.glass_brand_id || '')
    handleItemChange('glass_color_id', glassPrice.glass_color_id || '')
    handleItemChange('glass_code', glassPrice.product_code || '')
    handleItemChange('unit_price', glassPrice.price_colorless || 0)
    
    // Özellikleri kontrol et ve notlara ekle
    let notes = ''
    if (glassPrice.has_camera) notes += 'Kamera aparatlı '
    if (glassPrice.has_sensor) notes += 'Sensör aparatlı '
    if (glassPrice.is_encapsulated) notes += 'Enkapsül '
    if (glassPrice.features) notes += glassPrice.features + ' '
    if (notes) handleItemChange('notes', notes.trim())
    
    showSnackbar(`✅ ${glassPrice.stock_name as string} - Bilgiler otomatik dolduruldu`, 'success')
  }

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    setLoading(true)
    try {
      const url = mode === 'edit' && claimId ? `/api/claims/${claimId}` : '/api/claims'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: { ...formData, status },
          items: items.map(item => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = item
            return rest
          }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Hatası:', errorData)
        throw new Error(errorData.error || `İhbar ${mode === 'edit' ? 'güncellenemedi' : 'kaydedilemedi'}`)
      }

      const result = await response.json()
      console.log(`✅ İhbar ${mode === 'edit' ? 'güncellendi' : 'kaydedildi'}:`, result)

      showSnackbar(`İhbar başarıyla ${mode === 'edit' ? 'güncellendi' : 'kaydedildi'}`, 'success')
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500)
      }
    } catch (error) {
      console.error('İhbar kaydetme hatası:', error)
      showSnackbar(
        error instanceof Error ? error.message : `İhbar ${mode === 'edit' ? 'güncellenemedi' : 'kaydedilemedi'}`, 
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const formatPhoneNumber = (value: string) => {
    // (5xx) xxx xx xx formatına çevir
    const cleaned = value.replace(/\D/g, '')
    
    // En fazla 10 rakam (05xxxxxxxxx veya 5xxxxxxxxx)
    const limited = cleaned.slice(0, 10)
    
    // 0 ile başlıyorsa çıkar
    const withoutZero = limited.startsWith('0') ? limited.slice(1) : limited
    
    // Formatlama
    if (withoutZero.length <= 3) return withoutZero
    if (withoutZero.length <= 6) return `(${withoutZero.slice(0, 3)}) ${withoutZero.slice(3)}`
    if (withoutZero.length <= 8) return `(${withoutZero.slice(0, 3)}) ${withoutZero.slice(3, 6)} ${withoutZero.slice(6)}`
    return `(${withoutZero.slice(0, 3)}) ${withoutZero.slice(3, 6)} ${withoutZero.slice(6, 8)} ${withoutZero.slice(8, 10)}`
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        {mode === 'edit' ? 'İhbar Düzenle' : 'Yeni İhbar Ekle'}
      </Typography>

      {/* Sigorta & Hasar Bilgileri - Yan Yana */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Sigorta & Poliçe ve Acente Bilgileri */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, mb: 2 }}>
              Sigorta & Poliçe ve Acente Bilgileri
            </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                select
                fullWidth
                label="Sigorta Şirketi"
                value={formData.insurance_company_id}
                onChange={(e) => handleInputChange('insurance_company_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {insuranceCompanies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Acente Kodu"
                value={formData.agency_code}
                onChange={(e) => handleInputChange('agency_code', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Acente Adı"
                value={formData.agency_name}
                onChange={(e) => handleInputChange('agency_name', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Poliçe No"
                value={formData.policy_number}
                onChange={(e) => handleInputChange('policy_number', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Poliçe Başlama Tarih"
                type="date"
                value={formData.policy_start_date}
                onChange={(e) => {
                  const startDate = e.target.value
                  handleInputChange('policy_start_date', startDate)
                  
                  // Başlama tarihi seçildiğinde bitiş tarihini otomatik 1 yıl sonraya ayarla
                  if (startDate) {
                    const start = new Date(startDate)
                    const end = new Date(start)
                    end.setFullYear(end.getFullYear() + 1)
                    const endDateString = end.toISOString().split('T')[0]
                    handleInputChange('policy_end_date', endDateString)
                  }
                }}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Poliçe Bitiş Tarih"
                type="date"
                value={formData.policy_end_date}
                onChange={(e) => handleInputChange('policy_end_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

        {/* Hasar Bilgileri */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, mb: 2 }}>
              Hasar Bilgileri
            </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                select
                fullWidth
                label="Olay Şekli"
                value={formData.incident_type_id}
                onChange={(e) => handleInputChange('incident_type_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {incidentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Hasar Şekli"
                value={formData.damage_type_id}
                onChange={(e) => handleInputChange('damage_type_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {damageTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Hasar İl"
                value={formData.incident_city_id}
                onChange={(e) => {
                  handleInputChange('incident_city_id', e.target.value)
                  handleInputChange('incident_district_id', '')
                }}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Hasar İlçe"
                value={formData.incident_district_id}
                onChange={(e) => handleInputChange('incident_district_id', e.target.value)}
                size="small"
                disabled={!formData.incident_city_id}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.id}>
                    {district.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Hasar Tarih"
                type="date"
                value={formData.incident_date}
                onChange={(e) => handleInputChange('incident_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </CardContent>
        </Card>
      </Box>

      {/* Sigortalı & Sürücü Bilgileri - Yan Yana */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Sigortalı Bilgileri */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, mb: 2 }}>
              Sigortalı Bilgileri
            </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                select
                fullWidth
                label="Sigortalı Türü"
                value={formData.insured_type_id}
                onChange={(e) => handleInputChange('insured_type_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {insuredTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sigortalı Adı Soyadı"
                value={formData.insured_name}
                onChange={(e) => handleInputChange('insured_name', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Vergi Daire"
                value={formData.insured_tax_office}
                onChange={(e) => handleInputChange('insured_tax_office', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Vergi / TC No"
                value={formData.insured_tax_number}
                onChange={(e) => handleInputChange('insured_tax_number', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sigortalı Telefon"
                value={formData.insured_phone}
                onChange={(e) => handleInputChange('insured_phone', formatPhoneNumber(e.target.value))}
                size="small"
                placeholder="(5xx) xxx xx xx"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sigortalı Gsm"
                value={formData.insured_mobile}
                onChange={(e) => handleInputChange('insured_mobile', formatPhoneNumber(e.target.value))}
                size="small"
                placeholder="(5xx) xxx xx xx"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </CardContent>
        </Card>

        {/* Sürücü Bilgileri */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, flex: 1 }}>
                Sürücü Bilgileri
              </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.driver_same_as_insured}
                  onChange={(e) => handleInputChange('driver_same_as_insured', e.target.checked)}
                />
              }
              label="Sigortalı/Sürücü aynı ise"
              sx={{ ml: 2 }}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Sürücü Adı Soyadı"
                value={formData.driver_name}
                onChange={(e) => handleInputChange('driver_name', e.target.value)}
                size="small"
                disabled={formData.driver_same_as_insured}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sürücü T.C. Kimlik"
                value={formData.driver_tc_number}
                onChange={(e) => handleInputChange('driver_tc_number', e.target.value)}
                size="small"
                disabled={formData.driver_same_as_insured}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sürücü Telefon"
                value={formData.driver_phone}
                onChange={(e) => handleInputChange('driver_phone', formatPhoneNumber(e.target.value))}
                size="small"
                placeholder="(5xx) xxx xx xx"
                disabled={formData.driver_same_as_insured}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sürücü Doğum Tarih"
                type="date"
                value={formData.driver_birth_date}
                onChange={(e) => handleInputChange('driver_birth_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Sürücü Ehliyet Sınıfı"
                value={formData.driver_license_class_id}
                onChange={(e) => handleInputChange('driver_license_class_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {licenseClasses.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sürücü Ehliyet Tarih"
                type="date"
                value={formData.driver_license_date}
                onChange={(e) => handleInputChange('driver_license_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Ehliyet Verilen Yer"
                value={formData.driver_license_place}
                onChange={(e) => handleInputChange('driver_license_place', e.target.value)}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Sürücü Ehliyet No"
                value={formData.driver_license_number}
                onChange={(e) => handleInputChange('driver_license_number', e.target.value)}
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
        </Card>
      </Box>

      {/* Araç Bilgileri */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, mb: 2 }}>
            Araç Bilgileri
          </Typography>
          
          {/* Araç Hızlı Seçim - Autocomplete */}
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              fullWidth
              options={allVehicles}
              value={selectedVehicle}
              onChange={(event, newValue) => handleVehicleSelect(newValue)}
              filterOptions={(options, { inputValue }) => {
                // Büyük-küçük harf duyarsız arama
                const searchValue = inputValue.toLowerCase()
                return options.filter((option: Record<string, unknown>) => {
                  const brandName = ((option.brand_name as string) || (option.vehicle_brands as Record<string, unknown>)?.name as string || '').toLowerCase()
                  const modelName = ((option.name as string) || '').toLowerCase()
                  const categoryName = ((option.category_name as string) || ((option.vehicle_brands as Record<string, unknown>)?.vehicle_categories as Record<string, unknown>)?.name as string || '').toLowerCase()
                  
                  return brandName.includes(searchValue) || 
                         modelName.includes(searchValue) || 
                         categoryName.includes(searchValue)
                })
              }}
              getOptionLabel={(option) => {
                if (!option) return ''
                // Düzleştirilmiş verileri kullan
                const brandName = option.brand_name || option.vehicle_brands?.name || 'Bilinmeyen'
                const categoryName = option.category_name || option.vehicle_brands?.vehicle_categories?.name || ''
                return `${brandName} - ${option.name} ${categoryName ? `(${categoryName})` : ''}`
              }}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props as Record<string, unknown> & { key: string }
                const brandName = option.brand_name || option.vehicle_brands?.name || 'Bilinmeyen Marka'
                const categoryName = option.category_name || option.vehicle_brands?.vehicle_categories?.name || 'Bilinmeyen Kategori'
                
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {brandName} - {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {categoryName}
                      </Typography>
                    </Box>
                  </Box>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Araç Hızlı Seçim"
                  placeholder="Araç markası ve modelini arayarak seçiniz..."
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              loading={loading}
              loadingText="Araçlar yükleniyor..."
              noOptionsText="Araç bulunamadı"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Araç Plaka"
                value={formData.vehicle_plate}
                onChange={(e) => handleInputChange('vehicle_plate', e.target.value.toUpperCase())}
                size="small"
              />
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Araç Model Yılı"
                value={formData.vehicle_model_year}
                onChange={(e) => handleInputChange('vehicle_model_year', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Araç Kullanım Tipi"
                value={formData.vehicle_usage_type_id}
                onChange={(e) => handleInputChange('vehicle_usage_type_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {vehicleUsageTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Araç Kategori"
                value={formData.vehicle_category_id}
                onChange={(e) => {
                  handleInputChange('vehicle_category_id', e.target.value)
                  handleInputChange('vehicle_brand_id', '')
                  handleInputChange('vehicle_model_id', '')
                }}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {vehicleCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Araç Marka"
                value={formData.vehicle_brand_id}
                onChange={(e) => {
                  handleInputChange('vehicle_brand_id', e.target.value)
                  handleInputChange('vehicle_model_id', '')
                }}
                size="small"
                disabled={!formData.vehicle_category_id}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {vehicleBrands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Araç Alt Marka"
                value={formData.vehicle_model_id}
                onChange={(e) => handleInputChange('vehicle_model_id', e.target.value)}
                size="small"
                disabled={!formData.vehicle_brand_id}
              >
                <MenuItem value="">Araç Markası Seçiniz</MenuItem>
                {vehicleModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Cam Bilgileri Ekleme */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, mb: 2 }}>
            Cam Bilgileri
          </Typography>

          {/* Yardım Bilgileri - Yan Yana Accordion */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" fontWeight={600} color="info.main">
                  ℹ️ Doğru Cama Nasıl Ulaşırım?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  İhbar yapılabilecek camının bulunması için Araç Markası, Araç Alt Marka, Cam Türünü ve Cam Markasını 
                  seçildiğinizde mevcut camlar listelenecektir
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                  ⚠️ Camları Bölümü Sorgula Butonu Ne İşe Yarar?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Seçtiğiniz Araç Bilgilerine ve Cam Bilgilerine ile herhangi bir cam listelerindeyse bu bölümden 
                  ara komutuyla belirtildiğiniz için daha hızlı bir şekilde kod iceramayla yapabilirsiniz
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Cam Sorgulama Alanı */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Autocomplete
                fullWidth
                options={glassSearchOptions}
                value={selectedGlass}
                onChange={(_, newValue) => {
                  handleGlassSelect(newValue)
                  // Seçim sonrası inputValue'yu temizle
                  if (newValue) {
                    setGlassSearchQuery('')
                  }
                }}
                inputValue={glassSearchQuery}
                onInputChange={(_, newInputValue, reason) => {
                  // Sadece kullanıcı yazıyorsa güncelle, seçim yapılınca değil
                  if (reason === 'input') {
                    setGlassSearchQuery(newInputValue)
                  } else if (reason === 'clear') {
                    setGlassSearchQuery('')
                  }
                }}
                onOpen={() => {
                  // Dropdown açıldığında araç camlarını göster
                  if (!glassSearchQuery && availableGlassPrices.length > 0) {
                    setGlassSearchOptions(availableGlassPrices)
                  }
                }}
                getOptionLabel={(option) => {
                  const code = (option.product_code as string) || ''
                  const name = (option.stock_name as string) || ''
                  return `${code} - ${name}`
                }}
                filterOptions={(x) => x} // API'den geldiği için filtreleme yapma
                loading={loading}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props as Record<string, unknown> & { key: string }
                  const code = (option.product_code as string) || ''
                  const name = (option.stock_name as string) || ''
                  const position = (option.glass_position_name as string) || ''
                  const price = (option.price_colorless as number) || 0
                  
                  return (
                    <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', py: 1, width: '100%' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right', width: '100%' }}>
                        {code} - {name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', width: '100%' }}>
                        {position} • {price.toFixed(2)} ₺
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, justifyContent: 'flex-end', width: '100%' }}>
                        {option.has_camera && <Chip label="📷 Kamera" size="small" />}
                        {option.has_sensor && <Chip label="📡 Sensör" size="small" />}
                      </Box>
                    </Box>
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="🔍 Cam Hızlı Seçim"
                    placeholder={
                      availableGlassPrices.length > 0
                        ? `${availableGlassPrices.length} cam hazır, dropdown'ı açın veya arayın...`
                        : "Önce araç seçin veya cam kodu/marka arayın..."
                    }
                    size="small"
                  />
                )}
                noOptionsText={
                  availableGlassPrices.length > 0
                    ? 'Aşağıdaki listeden seçebilirsiniz'
                    : glassSearchQuery.length < 2 
                      ? 'Araç seçin veya en az 2 karakter girin' 
                      : 'Cam bulunamadı'
                }
              />
            </Box>
            
            {/* Bulunan Cam Fiyatları Listesi */}
            {availableGlassPrices.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'info.lighter', border: 1, borderColor: 'info.main' }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom fontWeight={600}>
                  🔍 {availableGlassPrices.length} Adet Cam Bulundu
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {availableGlassPrices.map((glass) => (
                    <Paper
                      key={glass.id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover', boxShadow: 2 },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => handleSelectGlassPrice(glass)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {glass.product_code} - {glass.stock_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {glass.glass_position_name} • {glass.features || 'Standart'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            {glass.has_camera && <Chip label="📷 Kamera" size="small" color="info" />}
                            {glass.has_sensor && <Chip label="📡 Sensör" size="small" color="info" />}
                            {glass.is_encapsulated && <Chip label="📦 Enkapsül" size="small" color="secondary" />}
                          </Box>
                        </Box>
                        <Box sx={{ ml: 2, textAlign: 'right', minWidth: 120 }}>
                          <Typography variant="h6" color="success.main" fontWeight={700}>
                            {(glass.price_colorless || 0).toFixed(2)} ₺
                          </Typography>
                          {(glass.price_colored || 0) > 0 && (
                            <Typography variant="body2" color="warning.main" fontWeight={600}>
                              Renkli: {glass.price_colored.toFixed(2)} ₺
                            </Typography>
                          )}
                          {(glass.price_double_color || 0) > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Çift Renk: {glass.price_double_color.toFixed(2)} ₺
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
                <Alert severity="info" sx={{ mt: 1 }}>
                  💡 Bir camı seçmek için üzerine tıklayın
                </Alert>
              </Paper>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <TextField
                select
                fullWidth
                label="Cam Türü"
                value={currentItem.glass_position_id}
                onChange={(e) => handleItemChange('glass_position_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {glassPositions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Cam Tipi"
                value={currentItem.glass_type_id}
                onChange={(e) => handleItemChange('glass_type_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {glassTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Cam Marka"
                value={currentItem.glass_brand_id}
                onChange={(e) => handleItemChange('glass_brand_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {glassBrands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="İşlem Yeri"
                value={currentItem.service_location_id}
                onChange={(e) => handleItemChange('service_location_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {serviceLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Cam Renk"
                value={currentItem.glass_color_id}
                onChange={(e) => handleItemChange('glass_color_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {glassColors.map((color) => (
                  <MenuItem key={color.id} value={color.id}>
                    {color.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                label="Montaj Şekli"
                value={currentItem.installation_method_id}
                onChange={(e) => handleItemChange('installation_method_id', e.target.value)}
                size="small"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {installationMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 3' } }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentItem.customer_contribution || false}
                    onChange={(e) => handleItemChange('customer_contribution', e.target.checked)}
                  />
                }
                label="Ek Malzeme Kullanıldı mı?"
              />
            </Box>
            
            {/* Ek Malzeme Alanları - customer_contribution true ise göster */}
            {currentItem.customer_contribution && (
              <>
                <Box>
                  <TextField
                    fullWidth
                    label="Ek Malzeme Ücreti (TL)"
                    type="number"
                    value={currentItem.additional_material_cost || 0}
                    onChange={(e) => handleItemChange('additional_material_cost', parseFloat(e.target.value) || 0)}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                  <TextField
                    fullWidth
                    label="Ek Malzeme Kullanım Nedeni"
                    value={currentItem.additional_material_reason || ''}
                    onChange={(e) => handleItemChange('additional_material_reason', e.target.value)}
                    size="small"
                    placeholder="Ek malzeme kullanım nedenini açıklayınız..."
                    multiline
                    rows={2}
                  />
                </Box>
              </>
            )}
            
            <Box sx={{ gridColumn: { xs: '1', md: 'span 3' } }}>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<Add />}
                onClick={handleAddItem}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Cam Ekle (+)
              </Button>
            </Box>
          </Box>

          {/* Eklenen Camlar Tablosu */}
          {items.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Grup</TableCell>
                    <TableCell>Kod</TableCell>
                    <TableCell>Ad</TableCell>
                    <TableCell>Tipi</TableCell>
                    <TableCell>Renk</TableCell>
                    <TableCell>Özellk</TableCell>
                    <TableCell align="right">Tutar</TableCell>
                    <TableCell align="right">KDV</TableCell>
                    <TableCell align="right">Toplam</TableCell>
                    <TableCell align="center">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const position = glassPositions.find(p => p.id === item.glass_position_id)
                    const glassType = glassTypes.find(t => t.id === item.glass_type_id)
                    const color = glassColors.find(c => c.id === item.glass_color_id)
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{position?.name || '-'}</TableCell>
                        <TableCell>{item.glass_code || '-'}</TableCell>
                        <TableCell>{glassType?.name || '-'}</TableCell>
                        <TableCell>{glassType?.name || '-'}</TableCell>
                        <TableCell>{color?.name || '-'}</TableCell>
                        <TableCell>
                          {item.customer_contribution ? (
                            <Box>
                              <Typography variant="caption" color="primary" fontWeight={600}>
                                Evet
                              </Typography>
                              {item.additional_material_cost ? (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.additional_material_cost.toFixed(2)} TL
                                </Typography>
                              ) : null}
                            </Box>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right">{item.subtotal?.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.vat_amount?.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.total_amount?.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveItem(item.id!)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Notlar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ bgcolor: '#025691', color: 'white', p: 1.5, borderRadius: 1, mb: 2 }}>
            NOTLAR
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="İhbar ile ilgili notlarınızı buraya yazabilirsiniz..."
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* Kaydet Butonları */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Save />}
          onClick={() => handleSubmit('submitted')}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          İHBARI KAYDET
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          Taslak Olarak Kaydet
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

