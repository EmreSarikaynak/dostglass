-- System Settings tablosu
create table if not exists system_settings (
  id uuid primary key default gen_random_uuid(),
  
  -- Site Ayarları
  site_title text default 'DostlarGlass',
  site_description text,
  site_logo_url text,
  favicon_url text,
  
  -- Şirket Bilgileri
  company_name text,
  company_address text,
  company_phone text,
  company_mobile text,
  company_email text,
  company_tax_office text,
  company_tax_number text,
  company_website text,
  company_facebook text,
  company_instagram text,
  company_twitter text,
  company_linkedin text,
  
  -- Fatura & Ticari Ayarlar
  default_vat_rate decimal(5,2) default 20.00,
  vat_rate_1 decimal(5,2) default 1.00,
  vat_rate_10 decimal(5,2) default 10.00,
  vat_rate_20 decimal(5,2) default 20.00,
  default_payment_term integer default 30, -- gün
  payment_term_options integer[] default array[15, 30, 45, 60],
  default_currency text default 'TRY',
  currency_symbol text default '₺',
  invoice_note text,
  invoice_footer text,
  
  -- E-posta Ayarları
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  smtp_secure boolean default true,
  email_from_address text,
  email_from_name text,
  
  -- E-posta Şablonları
  email_order_confirmation_subject text default 'Sipariş Onayı - #{order_number}',
  email_order_confirmation_body text,
  email_invoice_subject text default 'Fatura - #{invoice_number}',
  email_invoice_body text,
  email_welcome_subject text default 'Hoş Geldiniz!',
  email_welcome_body text,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

-- Sadece bir kayıt olacağı için index
create unique index if not exists system_settings_singleton on system_settings ((id is not null));

-- RLS etkinleştir
alter table system_settings enable row level security;

-- Mevcut politikaları sil (varsa)
drop policy if exists "Public settings read" on system_settings;
drop policy if exists "Admin settings update" on system_settings;
drop policy if exists "Admin settings insert" on system_settings;

-- Herkes okuyabilir (public settings için)
create policy "Public settings read" on system_settings
  for select using (true);

-- Sadece admin update edebilir
create policy "Admin settings update" on system_settings
  for update using (
    exists (
      select 1 from user_tenants
      where user_tenants.user_id = auth.uid()
      and user_tenants.role = 'admin'
    )
  );

-- Sadece admin insert edebilir
create policy "Admin settings insert" on system_settings
  for insert with check (
    exists (
      select 1 from user_tenants
      where user_tenants.user_id = auth.uid()
      and user_tenants.role = 'admin'
    )
  );

-- Varsayılan ayarları ekle
insert into system_settings (
  site_title,
  site_description,
  company_name,
  default_vat_rate,
  default_currency,
  currency_symbol,
  default_payment_term
) values (
  'DostlarGlass',
  'Cam Montaj ve Yönetim Sistemi',
  'Dostlar Glass',
  20.00,
  'TRY',
  '₺',
  30
) on conflict do nothing;

-- Updated at trigger
create or replace function update_system_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger system_settings_updated_at
  before update on system_settings
  for each row
  execute function update_system_settings_updated_at();

