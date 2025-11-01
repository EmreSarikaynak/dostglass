import { getSupabaseAdmin } from './supabaseAdmin'

export interface SystemSettings {
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

// Cache için
let cachedSettings: SystemSettings | null = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 1000 // 5 saniye (geliştirme için kısa, production'da artırılabilir)

export async function getSystemSettings(): Promise<SystemSettings> {
  // Cache kontrolü
  const now = Date.now()
  if (cachedSettings && (now - cacheTime) < CACHE_DURATION) {
    return cachedSettings
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .single()

    if (error) {
      console.error('System settings fetch error:', error)
      // Varsayılan değerler döndür
      return {
        site_title: 'DostlarGlass',
        site_description: 'Cam Montaj ve Yönetim Sistemi',
        company_name: 'Dostlar Glass',
        default_currency: 'TRY',
        currency_symbol: '₺',
      }
    }

    cachedSettings = data
    cacheTime = now
    return data
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return {
      site_title: 'DostlarGlass',
      site_description: 'Cam Montaj ve Yönetim Sistemi',
      company_name: 'Dostlar Glass',
      default_currency: 'TRY',
      currency_symbol: '₺',
    }
  }
}

// Cache'i temizle (ayarlar güncellendiğinde çağrılmalı)
export function clearSettingsCache() {
  cachedSettings = null
  cacheTime = 0
}

