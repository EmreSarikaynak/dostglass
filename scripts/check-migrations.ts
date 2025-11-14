import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuxgnskbdmolbvaatlif.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || '';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function checkMigrations() {
  console.log('🔍 Veritabanı migration durumu kontrol ediliyor...\n');

  try {
    // Veritabanındaki tüm tabloları listele
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('❌ Tablolar alınırken hata:', tablesError.message);
      
      // Alternatif yöntem: Bilinen tabloları tek tek kontrol et
      console.log('\n📋 Alternatif kontrol: Bilinen tabloları kontrol ediliyor...\n');
      
      const expectedTables = [
        'tenants',
        'user_tenants',
        'case_files',
        'original_glass_request_reasons',
        'original_glass_requests',
        'original_glass_request_files',
        'original_glass_request_logs',
        'cities',
        'districts',
        'parameter_categories',
        'parameter_values',
        'claims',
        'claim_items',
        'dealers',
        'announcements',
        'system_settings',
        'glass_prices',
        'insurance_companies'
      ];

      let existingCount = 0;
      let missingTables: string[] = [];

      for (const tableName of expectedTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          console.log(`✅ ${tableName}`);
          existingCount++;
        } else {
          console.log(`❌ ${tableName} - BULUNAMADI`);
          missingTables.push(tableName);
        }
      }

      console.log(`\n📊 Durum: ${existingCount}/${expectedTables.length} tablo mevcut`);
      
      if (missingTables.length > 0) {
        console.log('\n⚠️  Eksik tablolar:');
        missingTables.forEach(t => console.log(`   - ${t}`));
        console.log('\n💡 Migrationları çalıştırmak için:');
        console.log('   npx supabase db push --linked');
      } else {
        console.log('\n✅ Tüm migrationlar tamamlanmış görünüyor!');
      }

      return;
    }

    console.log('✅ Veritabanında bulunan tablolar:\n');
    tables?.forEach((table: any) => {
      console.log(`   • ${table.table_name}`);
    });

    console.log(`\n📊 Toplam ${tables?.length || 0} tablo bulundu`);

    // Migration dosyalarıyla karşılaştırma
    const expectedTables = [
      'tenants',
      'user_tenants', 
      'case_files',
      'original_glass_request_reasons',
      'original_glass_requests',
      'original_glass_request_files',
      'original_glass_request_logs',
      'cities',
      'districts',
      'claims',
      'claim_items',
      'dealers',
      'announcements',
      'system_settings',
      'glass_prices',
      'insurance_companies'
    ];

    const tableNames = tables?.map((t: any) => t.table_name) || [];
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log('\n⚠️  Eksik tablolar tespit edildi:');
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 Bu tablolar için migrationlar henüz çalıştırılmamış olabilir.');
    } else {
      console.log('\n✅ Tüm beklenen tablolar mevcut - Migrationlar tamamlanmış!');
    }

  } catch (error: any) {
    console.error('❌ Beklenmeyen hata:', error.message);
  }
}

checkMigrations();
