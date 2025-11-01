'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  TextField,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material'
import { Upload, CheckCircle } from '@mui/icons-material'
import * as XLSX from 'xlsx'

// 🎯 Tedarikçiye göre dinamik kolon eşleştirme
const SUPPLIER_COLUMN_MAPPINGS: Record<string, Record<string, string[]>> = {
  'OLİMPİA': {
    product_code: ['OLİMPİA KOD'],
    alternative_code: ['EURO KOD'],
    stock_name: ['STOK ADI'],
    position: ['KONUM'],
    features: ['ÖZELLİK'],
    hole_info: ['DELİK'],
    thickness_mm: ['MM'],
    ebat: ['EBAT'], // "300x400" formatı için
    area_m2: ['M2'],
    price_colorless: ['BEYAZ'],
    price_colored: ['RENKLİ'],
    price_double_color: ['K.YEŞİL ÇİFT RENK K.GRİ', 'ÇİFT RENK'],
  },
  'UĞURLU': {
    product_code: ['UĞURLU KOD'],
    alternative_code: ['EURO KOD'],
    stock_name: ['STOK ADI'],
    position: ['KONUM'],
    features: ['ÖZELLİK'],
    hole_info: ['YAN'],
    thickness_mm: ['MM'],
    width_mm: ['EN'],
    height_mm: ['BOY'],
    area_m2: ['M2'],
    price_colorless: ['FİYAT RENKSİZ TL', 'FIYAT', 'BEYAZ'],
    price_colored: ['FİYAT RENKLİ TL', 'RENKLİ'],
    price_double_color: ['FİYAT ÇİFT RENK/MAVİ KOYU GRİ', 'K.YEŞİL K.GRİ', 'ÇİFT RENK'],
  },
  'EURO': {
    product_code: ['EURO KOD'],
    alternative_code: ['OLİMPİA KOD', 'UĞURLU KOD'],
    stock_name: ['STOK ADI'],
    position: ['KONUM'],
    features: ['ÖZELLİK'],
    hole_info: ['DELİK', 'YAN'],
    thickness_mm: ['MM'],
    ebat: ['EBAT'],
    area_m2: ['M2'],
    price_colorless: ['BEYAZ', 'FİYAT RENKSİZ TL', 'FIYAT'],
    price_colored: ['RENKLİ', 'FİYAT RENKLİ TL'],
    price_double_color: ['K.YEŞİL K.GRİ', 'ÇİFT RENK'],
  }
}

// Değeri bul - birden fazla olası kolon adından ilk bulduğunu döndür
const findColumnValue = (row: any, possibleColumns: string[]): any => {
  for (const col of possibleColumns) {
    if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
      return row[col]
    }
  }
  return null
}

interface ExcelImportDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ExcelImportDialog({ open, onClose, onSuccess }: ExcelImportDialogProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [supplier, setSupplier] = useState('')
  const [category, setCategory] = useState('')
  const [detectedCategories, setDetectedCategories] = useState<Record<string, number>>({})
  const [excelData, setExcelData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importResult, setImportResult] = useState<{ success: number; failed: number; message?: string } | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('Tümü')

  const steps = ['Dosya Seçimi', 'Tedarikçi & Kategori', 'Önizleme', 'Import']
  
  // Sheet listesini çıkar
  const availableSheets = ['Tümü', ...Object.keys(detectedCategories)]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      parseExcel(selectedFile)
    }
  }


  const parseExcel = async (file: File) => {
    try {
      setLoading(true)
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      
      // 🎯 TÜM SHEET'LERİ OKU
      const allData: any[] = []
      const sheetCategories: Record<string, string> = {
        'OTO': 'Oto Cam',
        'OTOCAM': 'Oto Cam',
        'KABİN': 'Kabin',
        'KABIN': 'Kabin',
        'APARATLI': 'Aparatlı Ön Camlar',
        'APARATL': 'Aparatlı Ön Camlar',
      }

      console.log(`📊 ${workbook.SheetNames.length} sayfa bulundu:`, workbook.SheetNames)

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        
        // Sheet adından kategori belirle
        let sheetCategory = 'Oto Cam' // varsayılan
        for (const [keyword, cat] of Object.entries(sheetCategories)) {
          if (sheetName.toUpperCase().includes(keyword)) {
            sheetCategory = cat
            break
          }
        }

        console.log(`📄 ${sheetName} → ${sheetCategory} (${jsonData.length} satır)`)

        // 🏷️ BAŞLIK TAKİBİ (UĞURLU için)
        let rowsAdded = 0

        let skippedRows = 0
        
        for (let i = 0; i < jsonData.length; i++) {
          const row: any = jsonData[i]
          
          const stockName = String(row['STOK ADI'] || '')
          const hasCode = row['OLİMPİA KOD'] || row['EURO KOD'] || row['UĞURLU KOD']

          // Veri satırı kontrolü - KOD OLMALI
          if (!stockName || !hasCode) {
            skippedRows++
            if (skippedRows <= 5) {
              console.log(`⏭️  Atlanan satır ${i + 1}: STOK ADI="${stockName}", Kod=${hasCode ? 'var' : 'yok'}`)
            }
            continue
          }

          // 🎯 UĞURLU İÇİN: STOK ADI'ndan araç markasını otomatik çıkar
          let finalStockName = stockName
          
          if (stockName.length > 10) { // Uzun STOK ADI varsa araç markası içerebilir
            // İlk 2-3 kelimeyi araç markası olarak al
            const words = stockName.split(/\s+/)
            if (words.length >= 3) {
              const potentialBrand = words.slice(0, 2).join(' ') // İlk 2 kelime
              const remainingPart = words.slice(2).join(' ')     // Geri kalan
              
              // Eğer ilk kısım araç markası gibi görünüyorsa
              const brandKeywords = ['HATTAT', 'BAŞAK', 'NEW HOLLAND', 'JCB', 'CATERPILLAR', 'VOLVO', 'KOMATSU', 'HYUNDAI', 'CASE']
              if (brandKeywords.some(keyword => potentialBrand.toUpperCase().includes(keyword))) {
                row['__VEHICLE_BRAND__'] = potentialBrand
                // STOK ADI'nı temizle (sadece cam bilgisi kalsın)
                if (remainingPart.length > 5) {
                  finalStockName = `${potentialBrand} ${remainingPart}`
                }
              }
            }
          }

          // Final STOK ADI'nı güncelle
          row['STOK ADI'] = finalStockName
          
          // Sheet kategorisini ekle
          row['__SHEET_CATEGORY__'] = sheetCategory
          
          allData.push(row)
          rowsAdded++
        }
        
        if (skippedRows > 5) {
          console.log(`... ve ${skippedRows - 5} satır daha atlandı`)
        }

        console.log(`✅ ${rowsAdded} satır ${sheetName}'dan eklendi`)
      }

      console.log(`✅ TOPLAM: ${allData.length} satır veri okundu`)

      // Sheet kategorilerini hemen set et
      const initialSheetCategories: Record<string, number> = {}
      for (const row of allData) {
        const cat = row['__SHEET_CATEGORY__']
        if (cat) {
          initialSheetCategories[cat] = (initialSheetCategories[cat] || 0) + 1
        }
      }
      setDetectedCategories(initialSheetCategories)
      console.log('📊 Sheet Kategorileri:', initialSheetCategories)

      setExcelData(allData)
      setActiveStep(1)
    } catch (err) {
      setError('Excel dosyası okunamadı. Lütfen geçerli bir dosya seçin.')
      console.error('Excel parse hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSupplierNext = () => {
    if (!supplier) {
      setError('Lütfen tedarikçi seçin')
      return
    }
    
    if (!category) {
      setError('Kategori algılanamadı. Lütfen bekleyin veya manuel seçin.')
      return
    }

    setActiveStep(2)
  }

  const handleImport = async () => {
    if (excelData.length === 0) {
      setError('İmport edilecek veri yok')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Önce tüm araç markalarını çek
      const vehiclesRes = await fetch('/api/parameters/vehicle_brands')
      const vehiclesData = await vehiclesRes.json()
      const allBrands = vehiclesData.data || []

      // 2. Excel verilerini glass_prices formatına dönüştür
      const formattedData = []
      const notFoundVehicles = new Set<string>()
      const seenCodes = new Set<string>() // Tekrar eden kodları kontrol et
      let duplicateCount = 0

      for (const row of excelData) {
        const stockName = String(row['STOK ADI'] || '')
        
        // 🎯 UĞURLU İÇİN AKILLI ARAÇ EŞLEŞTIRME
        let matchedBrand: any = null
        
        if (supplier === 'UĞURLU') {
          // 🎯 UĞURLU İÇİN SÜPER AKILLI EŞLEŞTIRME
          const stockWords = stockName.split(/\s+/)
          
          // 1. Direkt marka ismi var mı kontrol et
          for (let wordCount = 1; wordCount <= Math.min(3, stockWords.length); wordCount++) {
            const brandCandidate = stockWords.slice(0, wordCount).join(' ').toUpperCase()
            
            const foundBrand = allBrands.find((brand: any) => {
              const brandName = brand.name.toUpperCase()
              return brandName.includes(brandCandidate) || brandCandidate.includes(brandName)
            })
            
            if (foundBrand) {
              matchedBrand = foundBrand
              break
            }
          }
          
          // 2. Eşleşme yoksa, sayı kodlarını akıllı marka eşleştirmesi yap
          if (!matchedBrand) {
            const firstWord = stockWords[0]?.trim() || ''
            
            // Sayı kodu mu? (145, 145-146, 155 vb.)
            if (/^\d+(-\d+)?$/.test(firstWord)) {
              // 🎯 Akıllı marka eşleştirme tablosu (kodlar + model isimleri)
              const vehicleCodeMapping: Record<string, string[]> = {
                'ALFA ROMEO': ['145', '146', '147', '155', '156', '159', '166', '164', 'MİTO', 'MITO', 'GIULIETTA', 'TONALE'],
                'AUDI': ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'TT', '80', '90', '100'],
                'BMW': ['316', '318', '320', '325', '330', '335', '520', '525', '528', '530', '540', '728', '730', '735', '740', '745', '750', 'E90', 'E91', 'E93', 'F10', 'G30', 'E60', 'E63', 'X1', 'X2', 'X3', 'Z3'],
                'MERCEDES': ['190', '200', '230', '280', '300', '350', '380', '400', '450', '500', '600', 'W-117', 'W-168', 'W-169', 'W-176', 'W-203', 'W-204', 'W-205', 'W-207', 'W-213', 'W-214', 'W-221', 'W-222', 'CLK', 'CLS', 'GLA', 'VITO', 'CITAN', 'SPRINTER', 'ACTROS', 'ATEGO', 'UNIMOG'],
                'PEUGEOT': ['106', '206', '207', '208', '301', '306', '307', '308', '405', '406', '407', '508', '2008', '3008', '5008'],
                'CITROEN': ['C2', 'C3', 'C4', 'C5', 'SAXO', 'XSARA', 'XANTIA', 'PICASSO'],
                'MAZDA': ['323', '626', 'MX3', 'MX5', 'MX6', 'CX', 'B-2000', 'B-2200', 'E-2000', 'E-2200'],
                'FORD': ['12', '15', '17', '18', '19', 'SIERRA', 'FIESTA', 'ESCORT', 'FOCUS', 'MONDEO', 'FUSION', 'CONNECT', 'COURIER', 'RANGER', 'TERESA', 'P-100', 'CUSTOM', 'CARGO', 'TRANSIT'],
                'RENAULT': ['9', '11', '12', '19', '21', '25', 'TWINGO', 'CLIO', 'MEGANE', 'FLUENCE', 'SCENIC', 'LAGUNA', 'KOLEOS', 'KADJAR', 'MODUS', 'ESPACE', 'KANGOO', 'MASTER', 'TRAFIC'],
                'FIAT': ['124', '125', '131', 'UNO', 'TIPO', 'TEMPRA', 'PANDA', 'PALIO', 'SIENA', 'ALBEA', 'PUNTO', 'GRANDE', 'LINEA', 'EGEA', 'STILO', 'MAREA', 'BRAVA', 'BRAVO', 'IDEA', 'DOBLO', 'SCUDO', 'DUCATO'],
                'OPEL': ['KADETT', 'KADET', 'ASCONA', 'AGILA', 'ASTRA', 'CORSA', 'COMBO', 'TIGRA', 'INSIGNIA', 'VECTRA', 'OMEGA', 'ZAFIRA', 'FRONTERA', 'MERIVA', 'MOKKA'],
                'VOLKSWAGEN': ['POLO', 'GOLF', 'JETTA', 'BORA', 'TOURAN', 'TOUAREG', 'TIGUAN', 'PASSAT', 'ARTEON', 'CADDY', 'TRANSPORTER', 'CRAFTER', 'AMAROK'],
                'HONDA': ['ACCORD', 'CIVIC', 'INTEGRA', 'CRX', 'JAZZ', 'CITY', 'HR-V'],
                'HYUNDAI': ['ATOS', 'EXCEL', 'PONY', 'MATRIX', 'ACCENT', 'ELANTRA', 'SONATA', 'GETZ', 'SANTA', 'TUCSON', 'GALLOPER', 'H1', 'H100', 'STAREX', 'H350'],
                'KIA': ['PRIDE', 'SEPHIA', 'RIO', 'CERATO', 'CARNIVAL', 'CEED', 'PICANTO', 'SORENTO', 'SOUL'],
                'TOYOTA': ['COROLLA', 'CORONA', 'AVENSIS', 'CAMRY', 'STARLET', 'RAV', 'YARIS', 'AURIS', 'LANDCRUISER', 'HILUX'],
                'NISSAN': ['SUNNY', 'MICRA', 'ALMERA', 'PRIMERA', 'BLUEBIRD', 'MAXIMA', 'NOTE', 'QASHQAI', 'TERRANO', 'PATROL', 'NAVARA'],
                'LADA': ['2108', '2109', '2110', '2111', '2112', '21099'],
                'VOLVO': ['740', '760', '850', '940', '960', 'XC', 'FH12', 'FL7', 'FL10']
              }
              
              // Kod hangi markaya ait?
              let targetBrand: any = null
              let targetBrandName = ''
              
              for (const [brandName, codes] of Object.entries(vehicleCodeMapping)) {
                if (codes.includes(firstWord) || codes.some(code => firstWord.includes(code))) {
                  // Bu markayı veritabanında bul
                  targetBrand = allBrands.find((brand: any) => 
                    brand.name.toUpperCase().includes(brandName.replace(' ', '')) ||
                    brand.name.toUpperCase().includes(brandName)
                  )
                  targetBrandName = brandName
                  break
                }
              }
              
              if (targetBrand) {
                matchedBrand = targetBrand
                console.log(`🎯 Akıllı eşleştirme: "${firstWord}" → "${targetBrandName}"`)
              } else {
                // Bilinmeyen kod - varsayılan olarak ALFA ROMEO
                const alfaBrand = allBrands.find((brand: any) => 
                  brand.name.toUpperCase().includes('ALFA ROMEO') || 
                  brand.name.toUpperCase().includes('ALFA')
                )
                
                if (alfaBrand) {
                  matchedBrand = alfaBrand
                  console.log(`🔄 Bilinmeyen kod ALFA ROMEO'ya: "${firstWord}"`)
                } else {
                  notFoundVehicles.add(`Bilinmeyen kod: ${firstWord}`)
                }
              }
            } else {
              // Normal kelime - model ismi olabilir mi kontrol et
              const upperFirstWord = firstWord.toUpperCase()
              
              // 🎯 Model isimleri için aynı tabloyu kullan
              const modelMapping: Record<string, string[]> = {
                'ALFA ROMEO': ['MİTO', 'MITO', 'GIULIETTA', 'TONALE'],
                'AUDI': ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'TT'],
                'BMW': ['E90', 'E91', 'E93', 'F10', 'G30', 'E60', 'E63', 'X1', 'X2', 'X3', 'Z3'],
                'MERCEDES': ['W-117', 'W-168', 'W-169', 'W-176', 'W-203', 'W-204', 'W-205', 'W-207', 'W-213', 'W-214', 'W-221', 'W-222', 'CLK', 'CLS', 'GLA', 'VITO', 'CITAN', 'SPRINTER', 'ACTROS', 'ATEGO', 'UNIMOG'],
                'PEUGEOT': ['2008', '3008', '5008'],
                'CITROEN': ['C2', 'C3', 'C4', 'C5', 'SAXO', 'XSARA', 'XANTIA', 'PICASSO'],
                'FORD': ['SIERRA', 'FIESTA', 'ESCORT', 'FOCUS', 'MONDEO', 'FUSION', 'CONNECT', 'COURIER', 'RANGER', 'TERESA', 'CUSTOM', 'CARGO', 'TRANSIT'],
                'RENAULT': ['TWINGO', 'CLIO', 'MEGANE', 'FLUENCE', 'SCENIC', 'LAGUNA', 'KOLEOS', 'KADJAR', 'MODUS', 'ESPACE', 'KANGOO', 'MASTER', 'TRAFIC'],
                'FIAT': ['UNO', 'TIPO', 'TEMPRA', 'PANDA', 'PALIO', 'SIENA', 'ALBEA', 'PUNTO', 'GRANDE', 'LINEA', 'EGEA', 'STILO', 'MAREA', 'BRAVA', 'BRAVO', 'IDEA', 'DOBLO', 'SCUDO', 'DUCATO'],
                'OPEL': ['KADETT', 'KADET', 'ASCONA', 'AGILA', 'ASTRA', 'CORSA', 'COMBO', 'TIGRA', 'INSIGNIA', 'VECTRA', 'OMEGA', 'ZAFIRA', 'FRONTERA', 'MERIVA', 'MOKKA'],
                'VOLKSWAGEN': ['POLO', 'GOLF', 'JETTA', 'BORA', 'TOURAN', 'TOUAREG', 'TIGUAN', 'PASSAT', 'ARTEON', 'CADDY', 'TRANSPORTER', 'CRAFTER', 'AMAROK'],
                'HONDA': ['ACCORD', 'CIVIC', 'INTEGRA', 'CRX', 'JAZZ', 'CITY'],
                'HYUNDAI': ['ATOS', 'EXCEL', 'PONY', 'MATRIX', 'ACCENT', 'ELANTRA', 'SONATA', 'GETZ', 'SANTA', 'TUCSON', 'GALLOPER', 'STAREX'],
                'KIA': ['PRIDE', 'SEPHIA', 'RIO', 'CERATO', 'CARNIVAL', 'CEED', 'PICANTO', 'SORENTO', 'SOUL'],
                'TOYOTA': ['COROLLA', 'CORONA', 'AVENSIS', 'CAMRY', 'STARLET', 'RAV', 'YARIS', 'AURIS', 'LANDCRUISER', 'HILUX'],
                'NISSAN': ['SUNNY', 'MICRA', 'ALMERA', 'PRIMERA', 'BLUEBIRD', 'MAXIMA', 'NOTE', 'QASHQAI', 'TERRANO', 'PATROL', 'NAVARA'],
                'VOLVO': ['XC', 'FH12', 'FL7', 'FL10']
              }
              
              // Model isimlerini kontrol et
              let foundByModel = false
              for (const [brandName, models] of Object.entries(modelMapping)) {
                if (models.some((model: string) => model.includes(upperFirstWord) || upperFirstWord.includes(model))) {
                  const brandInDb = allBrands.find((brand: any) => 
                    brand.name.toUpperCase().includes(brandName.replace(' ', '')) ||
                    brand.name.toUpperCase().includes(brandName)
                  )
                  
                  if (brandInDb) {
                    matchedBrand = brandInDb
                    console.log(`🎯 Model eşleştirme: "${firstWord}" → "${brandName}"`)
                    foundByModel = true
                    break
                  }
                }
              }
              
              if (!foundByModel) {
                notFoundVehicles.add(firstWord)
              }
            }
          }
        } else {
          // Diğer tedarikçiler için eski mantık
          const firstWord = stockName.split(/[.\s]/)[0]?.trim().toUpperCase()
          
          matchedBrand = allBrands.find((brand: any) => 
            brand.name.toUpperCase().includes(firstWord) || 
            firstWord.includes(brand.name.toUpperCase())
          )

          if (!matchedBrand && firstWord) {
            notFoundVehicles.add(firstWord)
          }
        }

        // 🎯 Tedarikçiye göre dinamik kolon eşleştirme
        const mapping = SUPPLIER_COLUMN_MAPPINGS[supplier] || SUPPLIER_COLUMN_MAPPINGS['OLİMPİA']
        
        const productCode = findColumnValue(row, mapping.product_code) || ''
        const codeKey = `${productCode}-${supplier}`
        
        if (seenCodes.has(codeKey)) {
          duplicateCount++
          continue
        }
        seenCodes.add(codeKey)

        // Fiyatları parse et
        const parsePrice = (value: any) => {
          if (!value) return 0
          const str = String(value).replace(',', '.')
          const price = parseFloat(str) || 0
          return Number(price.toFixed(2))
        }

        // EBAT veya EN/BOY kontrolü
        const ebatValue = findColumnValue(row, mapping.ebat || [])
        const widthValue = findColumnValue(row, mapping.width_mm || [])
        const heightValue = findColumnValue(row, mapping.height_mm || [])
        
        let width_mm: number | null = null
        let height_mm: number | null = null
        
        if (ebatValue) {
          // "1560 x 2600" veya "1560x2600" formatı
          const ebatStr = String(ebatValue).trim()
          if (ebatStr.includes('x')) {
            const parts = ebatStr.split(/\s*x\s*/i) // Boşluklarla veya boşluksuz "x"
            width_mm = parseInt(parts[0]?.trim()) || null
            height_mm = parseInt(parts[1]?.trim()) || null
          }
        } else if (widthValue || heightValue) {
          // Ayrı kolonlar (UĞURLU: EN, BOY)
          width_mm = widthValue ? parseInt(String(widthValue).trim()) || null : null
          height_mm = heightValue ? parseInt(String(heightValue).trim()) || null : null
        }

        const features = findColumnValue(row, mapping.features) || ''
        
        // 🎯 Kategori: Önce sheet'ten, yoksa genel category
        const rowCategory = row['__SHEET_CATEGORY__'] || category

        formattedData.push({
          product_code: productCode,
          stock_name: stockName,
          vehicle_brand_id: matchedBrand?.id || null,
          position_text: findColumnValue(row, mapping.position) || '',
          features: features,
          hole_info: findColumnValue(row, mapping.hole_info) || '',
          thickness_mm: parseFloat(findColumnValue(row, mapping.thickness_mm)) || null,
          width_mm: width_mm,
          height_mm: height_mm,
          area_m2: parseFloat(findColumnValue(row, mapping.area_m2)) || null,
          price_colorless: parsePrice(findColumnValue(row, mapping.price_colorless)),
          price_colored: parsePrice(findColumnValue(row, mapping.price_colored)),
          price_double_color: parsePrice(findColumnValue(row, mapping.price_double_color)),
          supplier: supplier,
          category: rowCategory,
          // Özellik bayrakları
          has_camera: features.toLowerCase().includes('kamera'),
          has_sensor: features.toLowerCase().includes('sensör'),
          is_encapsulated: features.toLowerCase().includes('enkapsül'),
          is_acoustic: features.toLowerCase().includes('akustik'),
          is_heated: features.toLowerCase().includes('ısıtmalı'),
        })
      }

      // 📊 Kategori dağılımını göster
      const categoryBreakdown: Record<string, number> = {}
      formattedData.forEach(item => {
        const cat = item.category || 'Belirtilmemiş'
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
      })
      console.log('📊 Kategori Dağılımı:', categoryBreakdown)

      // 3. Bilgilendirme mesajları
      let infoMessage = ''
      if (duplicateCount > 0) {
        infoMessage += `ℹ️ ${duplicateCount} tekrar eden kayıt filtrelendi.\n`
      }
      if (notFoundVehicles.size > 0) {
        const vehicleList = Array.from(notFoundVehicles).join(', ')
        infoMessage += `⚠️ Veritabanında bulunamayan araçlar: ${vehicleList}.`
      }
      if (infoMessage) {
        setError(infoMessage)
      }

      // 4. API'ye gönder
      const response = await fetch('/api/glass-prices/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: formattedData }),
      })

      const result = await response.json()

      if (response.ok) {
        const successMessage = result.message || `${result.count} kayıt import edildi`
        setImportResult({ 
          success: result.count || 0, 
          failed: notFoundVehicles.size,
          message: successMessage
        })
        setActiveStep(3)
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 3000)
      } else {
        const errorDetails = result.details || result.hint || result.code || ''
        const fullError = `${result.error || 'Import başarısız'}\n\nDetay: ${errorDetails}`
        console.error('❌ API Hatası:', result)
        setError(fullError)
      }
    } catch (err) {
      setError('Import sırasında bir hata oluştu')
      console.error('Import hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setFile(null)
    setSupplier('')
    setCategory('')
    setExcelData([])
    setError('')
    setImportResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Upload color="primary" />
          <Typography variant="h6">Excel Import - Cam Fiyat Listesi</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 0: Dosya Seçimi */}
        {activeStep === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              📊 Excel dosyanızda şu sütunlar olmalı:<br />
              <strong>OLİMPİA KOD (veya EURO KOD), STOK ADI, KONUM, ÖZELLİK, BEYAZ (fiyat), RENKLİ (fiyat)</strong>
              <br /><br />
              ✅ Sistem otomatik olarak:<br />
              • Boş satırları filtreler<br />
              • Başlık satırlarını atlar<br />
              • Araç markasını algılar ve eşleştirir<br />
              • Eşleşmeyen araçları raporlar
            </Alert>
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ py: 4, borderStyle: 'dashed', borderWidth: 2 }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ width: '100%' }}>
                  <Typography>Dosya okunuyor...</Typography>
                  <LinearProgress sx={{ mt: 2 }} />
                </Box>
              ) : (
                <>
                  <Upload sx={{ mr: 1, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">
                      {file ? file.name : 'Excel Dosyası Seç'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (.xlsx, .xls formatında)
                    </Typography>
                  </Box>
                </>
              )}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        )}

        {/* Step 1: Tedarikçi & Kategori Seçimi */}
        {activeStep === 1 && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ {excelData.length} satır veri okundu
            </Alert>

            <TextField
              select
              fullWidth
              label="Tedarikçi"
              value={supplier}
              onChange={async (e) => {
                const selectedSupplier = e.target.value
                setSupplier(selectedSupplier)
                
                if (selectedSupplier) {
                  // Tedarikçi seçilince otomatik kategori algıla
                  setLoading(true)
                  try {
                    // 🎯 Sheet kategorileri zaten parseExcel'de set edildi, direkt kullan
                    if (Object.keys(detectedCategories).length > 0) {
                      // En çok bulunan sheet kategorisini seç
                      const maxCategory = Object.entries(detectedCategories).reduce((a, b) => 
                        b[1] > a[1] ? b : a
                      )
                      setCategory(maxCategory[0])
                      console.log(`✅ Sheet'lerden otomatik kategori seçildi: ${maxCategory[0]}`)
                    } else {
                      // Sheet kategorisi yoksa araç markalarına bak (eski yöntem)
                      const vehiclesRes = await fetch('/api/parameters/vehicle_brands')
                      const vehiclesData = await vehiclesRes.json()
                      const allBrands = vehiclesData.data || []

                      const categoryCount: Record<string, number> = {
                        'Oto Cam': 0,
                        'Kabin': 0,
                        'Aparatlı Ön Camlar': 0,
                        'Ticari Araç': 0,
                      }

                      for (const row of excelData) {
                        const stockName = String(row['STOK ADI'] || '')
                        const words = stockName.split(/[\s.\/]+/).filter((w: string) => w.length > 0)
                        const firstWord = words[0]?.trim().toUpperCase()
                        
                        if (!firstWord) continue

                        const matchedBrand = allBrands.find((brand: any) => {
                          const brandName = brand.name?.toUpperCase() || ''
                          if (firstWord === 'VW' && brandName.includes('VOLKSWAGEN')) return true
                          if (brandName.includes('VW') && firstWord === 'VOLKSWAGEN') return true
                          return brandName.includes(firstWord) || firstWord.includes(brandName)
                        })

                        if (matchedBrand) {
                          const categoryName = matchedBrand.category_name || matchedBrand.vehicle_categories?.name || ''
                          const categoryUpper = categoryName.toUpperCase()
                          if (categoryUpper.includes('BİNEK') || categoryUpper.includes('BINEK')) {
                            categoryCount['Oto Cam']++
                          } else if (categoryUpper.includes('İŞ MAKİNESİ') || categoryUpper.includes('IS MAKINESI') || categoryUpper.includes('KABIN')) {
                            categoryCount['Kabin']++
                          } else if (categoryUpper.includes('TİCARİ') || categoryUpper.includes('TICARI') || categoryUpper.includes('KAMYON')) {
                            categoryCount['Ticari Araç']++
                          } else {
                            categoryCount['Oto Cam']++
                          }
                        }
                      }

                      setDetectedCategories(categoryCount)
                      const maxCategory = Object.entries(categoryCount).reduce((a, b) => 
                        b[1] > a[1] ? b : a
                      )
                      
                      if (maxCategory[1] > 0) {
                        setCategory(maxCategory[0])
                      } else {
                        setCategory('Oto Cam')
                      }
                    }
                  } catch (err) {
                    console.error('Kategori analiz hatası:', err)
                  } finally {
                    setLoading(false)
                  }
                }
              }}
              sx={{ mb: 2 }}
              required
              disabled={loading}
            >
              <MenuItem value="">Seçiniz</MenuItem>
              <MenuItem value="UĞURLU">UĞURLU</MenuItem>
              <MenuItem value="EURO">EURO</MenuItem>
              <MenuItem value="OLİMPİA">OLİMPİA</MenuItem>
              <MenuItem value="DİĞER">Diğer</MenuItem>
            </TextField>

            {loading && (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="primary">
                  🔄 Kategori otomatik algılanıyor...
                </Typography>
              </Box>
            )}

            {category && !loading && (
              <Paper sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  🎯 Kategori Otomatik Algılandı
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {category}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(detectedCategories).map(([cat, count]) => (
                    count > 0 && (
                      <Box key={cat} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color={cat === category ? 'success.main' : 'text.secondary'}>
                          {cat === category ? '✅' : '•'} {cat}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color={cat === category ? 'success.main' : 'text.secondary'}>
                          {count} araç
                        </Typography>
                      </Box>
                    )
                  ))}
                </Box>
                {Object.values(detectedCategories).every(count => count === 0) && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ Hiçbir araç eşleştirilemedi. Varsayılan kategori seçildi.
                  </Alert>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* Step 2: Önizleme */}
        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              📋 İmport Özeti:<br />
              • <strong>{excelData.length}</strong> adet kayıt<br />
              • Tedarikçi: <strong>{supplier}</strong><br />
              • Kategori: <strong>{category}</strong>
            </Alert>

            {/* Sheet Filtresi */}
            {availableSheets.length > 1 && (
              <TextField
                select
                fullWidth
                label="Görüntülenecek Sayfa"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              >
                {availableSheets.map((sheet) => (
                  <MenuItem key={sheet} value={sheet}>
                    {sheet} {sheet !== 'Tümü' && `(${excelData.filter(r => r['__SHEET_CATEGORY__'] === sheet).length} kayıt)`}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                İlk 5 Kayıt Önizlemesi {selectedSheet !== 'Tümü' ? `- ${selectedSheet}` : ''}:
              </Typography>
              <List dense>
                {excelData
                  .filter(row => selectedSheet === 'Tümü' || row['__SHEET_CATEGORY__'] === selectedSheet)
                  .slice(0, 5)
                  .map((row: any, index) => {
                    const mapping = SUPPLIER_COLUMN_MAPPINGS[supplier] || SUPPLIER_COLUMN_MAPPINGS['OLİMPİA']
                    const code = findColumnValue(row, mapping.product_code) || '-'
                    const stockName = String(findColumnValue(row, mapping.stock_name) || '-')
                    const position = findColumnValue(row, mapping.position) || '-'
                    const priceColorless = findColumnValue(row, mapping.price_colorless) || 0
                    const priceColored = findColumnValue(row, mapping.price_colored) || 0
                    const sheetCat = row['__SHEET_CATEGORY__'] || category
                    
                    return (
                      <ListItem key={index} sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{stockName}</Typography>
                              <Chip label={sheetCat} size="small" color="secondary" sx={{ mt: 0.5 }} />
                            </Box>
                          }
                          secondary={`Kod: ${code} • Konum: ${position} • Renksiz: ${Number(priceColorless).toFixed(2)} ₺ • Renkli: ${Number(priceColored).toFixed(2)} ₺`}
                        />
                      </ListItem>
                    )
                  })}
              </List>
            </Paper>
          </Box>
        )}

        {/* Step 3: Başarılı */}
        {activeStep === 3 && importResult && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              ✅ Import Başarılı!
            </Typography>
            <Typography variant="body1" color="success.main" fontWeight={600} sx={{ mb: 1 }}>
              {importResult.message || `${importResult.success} adet kayıt işlendi`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              💡 Var olan kayıtlar otomatik güncellendi
            </Typography>
            {importResult.failed > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                ⚠️ {importResult.failed} araç markası veritabanında bulunamadı
              </Typography>
            )}
          </Box>
        )}

        {loading && activeStep === 2 && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Veriler import ediliyor, lütfen bekleyin...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {activeStep === 3 ? 'Kapat' : 'İptal'}
        </Button>
        
        {activeStep === 0 && file && (
          <Button variant="contained" onClick={() => setActiveStep(1)}>
            Devam Et
          </Button>
        )}
        
        {activeStep === 1 && (
          <Button 
            variant="contained" 
            onClick={handleSupplierNext} 
            disabled={!supplier || !category || loading}
            size="large"
          >
            {loading ? 'Analiz Ediliyor...' : `Devam Et (${category ? '✅ Hazır' : 'Bekleyin'})`}
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button variant="contained" onClick={handleImport} disabled={loading}>
            Import Başlat ({excelData.length} kayıt)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
