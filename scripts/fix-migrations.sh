#!/bin/bash

# Migration geçmişini düzeltme scripti
echo "🔧 Migration geçmişi düzeltiliyor..."
echo ""

# Önce reverted (geri alınmış) migrationları işaretle
echo "📝 Eski migrationlar reverted olarak işaretleniyor..."
npx supabase migration repair --status reverted 20251019145314
npx supabase migration repair --status reverted 20251019150751
npx supabase migration repair --status reverted 20251019154131
npx supabase migration repair --status reverted 20251019154443
npx supabase migration repair --status reverted 20251019165827
npx supabase migration repair --status reverted 20251031232220
npx supabase migration repair --status reverted 20251031232908
npx supabase migration repair --status reverted 20251101005003
npx supabase migration repair --status reverted 20251101005837

echo ""
echo "✅ Mevcut migrationlar applied olarak işaretleniyor..."

# Mevcut local migrationları applied olarak işaretle
npx supabase migration repair --status applied 000_create_core_tables
npx supabase migration repair --status applied 001_create_case_files
npx supabase migration repair --status applied 002_create_original_glass_request_reasons
npx supabase migration repair --status applied 003_create_original_glass_requests
npx supabase migration repair --status applied 004_create_original_glass_request_files
npx supabase migration repair --status applied 005_create_original_glass_request_logs
npx supabase migration repair --status applied 006_create_original_glass_functions
npx supabase migration repair --status applied 007_setup_original_glass_storage
npx supabase migration repair --status applied 009_update_original_glass_requests_notifications
npx supabase migration repair --status applied 010_create_parameter_tables
npx supabase migration repair --status applied 011_create_cities_districts
npx supabase migration repair --status applied 012_populate_cities_districts
npx supabase migration repair --status applied 013_create_claims_tables
npx supabase migration repair --status applied 014_create_dealers_table
npx supabase migration repair --status applied 015_create_announcements_table
npx supabase migration repair --status applied 016_create_system_settings
npx supabase migration repair --status applied 017_create_case_file_function
npx supabase migration repair --status applied 20241031_add_user_tenants_timestamps
npx supabase migration repair --status applied 20241031_alter_claim_items_additional_materials
npx supabase migration repair --status applied 20241031_create_glass_prices_table
npx supabase migration repair --status applied 20241102_add_insurance_companies_details

echo ""
echo "✅ Migration geçmişi düzeltildi!"
echo ""
echo "📋 Şimdi migration durumunu kontrol edebilirsiniz:"
echo "   npx supabase migration list --linked"
