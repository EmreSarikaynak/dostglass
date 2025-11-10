-- migrate:up
-- Supabase Storage yapılandırması (original_glass_files bucket ve RLS politikaları)
-- Not: Storage bucket manuel olarak Supabase dashboard'dan oluşturulmalı

-- Yardımcı ifadeler: dosya yollarından tenant ve talep UUID bilgilerini çıkarma
-- name formatı: {tenantId}/{requestId}/{fileId}.{ext}

create or replace function original_glass_storage_tenant_id(name text)
returns uuid
language sql
immutable
as $$
select case
  when $1 ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'
    then split_part($1, '/', 1)::uuid
  else null
end;
$$;

create or replace function original_glass_storage_request_id(name text)
returns uuid
language sql
immutable
as $$
select case
  when $1 ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'
    then split_part($1, '/', 2)::uuid
  else null
end;
$$;

-- Not: Storage RLS politikaları manuel olarak dashboard'dan oluşturulmalı
-- Bu fonksiyonlar storage bucket oluşturulduktan sonra kullanılacak

-- migrate:down

drop policy if exists original_glass_files_dealer_insert on storage.objects;
drop policy if exists original_glass_files_dealer_select on storage.objects;
drop policy if exists original_glass_files_admin_all on storage.objects;

drop function if exists original_glass_storage_request_id(text);
drop function if exists original_glass_storage_tenant_id(text);

delete from storage.buckets
where id = 'original_glass_files';
