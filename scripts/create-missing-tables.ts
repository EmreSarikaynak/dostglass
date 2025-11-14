import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuxgnskbdmolbvaatlif.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || '';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function createMissingTables() {
  console.log('🔧 Eksik tabloları oluşturuluyor...\n');

  try {
    // 010_create_parameter_tables.sql dosyasının içeriğini oku
    const fs = require('fs');
    const path = require('path');
    
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '010_create_parameter_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL dosyası okundu: 010_create_parameter_tables.sql');
    console.log('📊 SQL çalıştırılıyor...\n');

    // SQL'i çalıştır - Supabase'in SQL endpoint'ini kullan
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      console.error('❌ SQL çalıştırılırken hata oluştu:', error.message);
      console.log('\n💡 Alternatif çözüm: SQL\'i manuel olarak çalıştırın:');
      console.log('1. https://cuxgnskbdmolbvaatlif.supabase.co adresine gidin');
      console.log('2. SQL Editor\'ü açın');
      console.log('3. supabase/migrations/010_create_parameter_tables.sql dosyasının içeriğini kopyalayıp çalıştırın');
      
      // Alternatif: Her tabloyu tek tek oluşturmayı dene
      console.log('\n🔄 Alternatif yöntem deneniyor: Tablolar tek tek oluşturuluyor...\n');
      await createTablesOneByOne();
    } else {
      console.log('✅ Tablolar başarıyla oluşturuldu!');
      
      // Kontrol et
      await verifyTables();
    }

  } catch (error: any) {
    console.error('❌ Beklenmeyen hata:', error.message);
    console.log('\n📋 Manuel çözüm için:');
    console.log('Supabase Dashboard > SQL Editor\'den şu dosyayı çalıştırın:');
    console.log('supabase/migrations/010_create_parameter_tables.sql');
  }
}

async function createTablesOneByOne() {
  const tables = [
    {
      name: 'insured_types',
      sql: `create table if not exists insured_types (
        id uuid primary key default gen_random_uuid(),
        name text not null unique,
        is_active boolean default true,
        created_at timestamptz default now()
      );`
    },
    {
      name: 'incident_types',
      sql: `create table if not exists incident_types (
        id uuid primary key default gen_random_uuid(),
        name text not null unique,
        is_active boolean default true,
        created_at timestamptz default now()
      );`
    },
    {
      name: 'damage_types',
      sql: `create table if not exists damage_types (
        id uuid primary key default gen_random_uuid(),
        name text not null unique,
        is_active boolean default true,
        created_at timestamptz default now()
      );`
    },
    {
      name: 'license_classes',
      sql: `create table if not exists license_classes (
        id uuid primary key default gen_random_uuid(),
        name text not null unique,
        is_active boolean default true,
        created_at timestamptz default now()
      );`
    },
    {
      name: 'vehicle_categories',
      sql: `create table if not exists vehicle_categories (
        id uuid primary key default gen_random_uuid(),
        name text not null unique,
        is_active boolean default true,
        created_at timestamptz default now()
      );`
    },
    {
      name: 'vehicle_usage_types',
      sql: `create table if not exists vehicle_usage_types (
        id uuid primary key default gen_random_uuid(),
        name text not null unique,
        is_active boolean default true,
        created_at timestamptz default now()
      );`
    }
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: table.sql
      });

      if (error) {
        console.log(`❌ ${table.name} - Hata: ${error.message}`);
      } else {
        console.log(`✅ ${table.name} - Oluşturuldu`);
      }
    } catch (err: any) {
      console.log(`⚠️ ${table.name} - ${err.message}`);
    }
  }
}

async function verifyTables() {
  console.log('\n🔍 Tablolar kontrol ediliyor...\n');
  
  const expectedTables = [
    'insured_types',
    'incident_types',
    'damage_types',
    'license_classes',
    'vehicle_categories',
    'vehicle_usage_types',
    'vehicle_brands',
    'vehicle_models',
    'glass_brands',
    'glass_positions',
    'glass_operations',
    'glass_colors',
    'vehicle_glass_types',
    'installation_methods',
    'service_locations'
  ];

  let successCount = 0;
  
  for (const tableName of expectedTables) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (!error) {
      console.log(`✅ ${tableName}`);
      successCount++;
    } else {
      console.log(`❌ ${tableName} - BULUNAMADI`);
    }
  }

  console.log(`\n📊 Sonuç: ${successCount}/${expectedTables.length} tablo mevcut`);
  
  if (successCount === expectedTables.length) {
    console.log('\n🎉 Tüm parametrik tablolar başarıyla oluşturuldu!');
  } else {
    console.log('\n⚠️ Bazı tablolar oluşturulamadı. Manuel kontrol gerekebilir.');
  }
}

createMissingTables();
