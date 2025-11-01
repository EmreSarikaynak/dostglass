// Cam Fiyat Listesi Tipleri

export interface GlassPrice {
  id?: string
  tenant_id?: string
  
  // Ürün Kodları
  product_code: string // Ana ürün kodu (zorunlu)
  alternative_codes?: string[] // Alternatif kodlar
  
  // Ürün Tanımı
  stock_name: string // STOK ADI (zorunlu)
  
  // İlişkisel Bağlantılar
  vehicle_category_id?: string
  vehicle_brand_id?: string
  vehicle_model_id?: string
  model_year_start?: string
  model_year_end?: string
  
  // Cam Özellikleri (İlişkisel)
  glass_position_id?: string
  glass_type_id?: string
  glass_brand_id?: string
  glass_color_id?: string
  
  // Ham Veri (Backup)
  position_text?: string
  features?: string
  
  // Teknik Bilgiler
  hole_info?: string
  thickness_mm?: number
  width_mm?: number
  height_mm?: number
  area_m2?: number
  
  // Fiyat Bilgileri
  price_colorless: number
  price_colored?: number
  price_double_color?: number
  
  // Kategori
  category?: string
  supplier?: string
  
  // Özellik Bayrakları
  has_camera?: boolean
  has_sensor?: boolean
  is_encapsulated?: boolean
  is_acoustic?: boolean
  is_heated?: boolean
  
  // Diğer
  notes?: string
  is_active?: boolean
  
  created_at?: string
  updated_at?: string
  created_by?: string
}

// Detaylı View (ilişkisel verilerle birlikte)
export interface GlassPriceDetailed extends GlassPrice {
  vehicle_category_name?: string
  vehicle_brand_name?: string
  vehicle_model_name?: string
  glass_position_name?: string
  glass_type_name?: string
  glass_brand_name?: string
  glass_color_name?: string
}

// Excel Import için
export interface GlassPriceImportRow {
  product_code: string
  stock_name: string
  vehicle_brand?: string
  vehicle_model?: string
  position?: string
  features?: string
  hole_info?: string
  thickness_mm?: number
  width_mm?: number
  height_mm?: number
  area_m2?: number
  price_colorless: number
  price_colored?: number
  price_double_color?: number
  category?: string
  supplier?: string
}

// Filtreleme için
export interface GlassPriceFilter {
  vehicle_brand_id?: string
  vehicle_model_id?: string
  glass_position_id?: string
  category?: string
  supplier?: string
  has_camera?: boolean
  has_sensor?: boolean
  search?: string
}

