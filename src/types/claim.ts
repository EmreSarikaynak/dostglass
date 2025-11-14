// İhbar Form Tipleri

export interface ClaimFormData {
  // Sigorta ve Poliçe Bilgileri
  insurance_company_id: string
  agency_code: string
  agency_name: string
  policy_number: string
  policy_start_date: string
  policy_end_date: string

  // Hasar Bilgileri
  incident_type_id: string
  damage_type_id: string
  incident_city_id: string
  incident_district_id: string
  incident_date: string

  // Sigortalı Bilgileri
  insured_type_id: string
  insured_name: string
  insured_tax_office: string
  insured_tax_number: string
  insured_phone: string
  insured_mobile: string

  // Sürücü Bilgileri
  driver_same_as_insured: boolean
  driver_name: string
  driver_tc_number: string
  driver_phone: string
  driver_birth_date: string
  driver_license_class_id: string
  driver_license_date: string
  driver_license_place: string
  driver_license_number: string

  // Araç Bilgileri
  vehicle_plate: string
  vehicle_model_year: string
  vehicle_usage_type_id: string
  vehicle_category_id: string
  vehicle_brand_id: string
  vehicle_model_id: string

  // Notlar
  notes: string
}

export interface ClaimItem {
  id?: string
  glass_position_id: string | null
  glass_type_id: string | null
  glass_brand_id: string | null
  glass_code: string
  glass_color_id: string | null
  glass_operation_id: string | null
  installation_method_id: string | null
  service_location_id: string | null
  unit_price: number
  quantity: number
  subtotal: number
  vat_rate: number
  vat_amount: number
  total_amount: number
  customer_contribution: boolean // Ek malzeme kullanıldı mı?
  additional_material_cost?: number // Ek malzeme ücreti
  additional_material_reason?: string // Ek malzeme kullanım nedeni
  notes: string
}

export interface ParameterOption {
  id: string
  name: string
  code?: string
}
