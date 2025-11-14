-- migrate:up
-- Supabase Storage yapılandırması (original_glass_files bucket ve RLS politikaları)

-- Storage bucket'ını oluştur (RLS olmadan)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'original_glass_files',
  'original_glass_files',
  false,
  10 * 1024 * 1024,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Bucket'ı oluştur veya güncelle
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'original_glass_files',
  'original_glass_files',
  false,
  10 * 1024 * 1024,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS'i tekrar aktif et
alter table storage.buckets enable row level security;

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

alter table storage.objects enable row level security;

-- Admin kullanıcılar: aynı tenant altındaki tüm dosyalara tam erişim
drop policy if exists original_glass_files_admin_all on storage.objects;
create policy original_glass_files_admin_all on storage.objects
  for all using (
    bucket_id = 'original_glass_files'
    and exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.role = 'admin'
        and ut.tenant_id = original_glass_storage_tenant_id(name)
    )
  )
  with check (
    bucket_id = 'original_glass_files'
    and exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.role = 'admin'
        and ut.tenant_id = original_glass_storage_tenant_id(name)
    )
  );

-- Bayi kullanıcılar: yalnızca kendi taleplerine ait dosyaları okuyabilir
drop policy if exists original_glass_files_dealer_select on storage.objects;
create policy original_glass_files_dealer_select on storage.objects
  for select using (
    bucket_id = 'original_glass_files'
    and exists (
      select 1
      from original_glass_requests ogr
      where ogr.id = original_glass_storage_request_id(name)
        and ogr.dealer_user_id = auth.uid()
    )
  );

-- Bayi kullanıcılar: yalnızca kendi talepleri için yeni dosya oluşturabilir
drop policy if exists original_glass_files_dealer_insert on storage.objects;
create policy original_glass_files_dealer_insert on storage.objects
  for insert with check (
    bucket_id = 'original_glass_files'
    and exists (
      select 1
      from original_glass_requests ogr
      where ogr.id = original_glass_storage_request_id(name)
        and ogr.dealer_user_id = auth.uid()
        and ogr.tenant_id = original_glass_storage_tenant_id(name)
    )
  );

comment on policy original_glass_files_admin_all on storage.objects is
  'Admin kullanıcılar aynı tenant altındaki tüm dosyalar üzerinde tam erişime sahiptir';

comment on policy original_glass_files_dealer_select on storage.objects is
  'Bayi kullanıcılar sadece kendi taleplerine bağlı dosyaları görüntüleyebilir';

comment on policy original_glass_files_dealer_insert on storage.objects is
  'Bayi kullanıcılar yalnızca kendi taleplerine dosya yükleyebilir';

-- migrate:down

drop policy if exists original_glass_files_dealer_insert on storage.objects;
drop policy if exists original_glass_files_dealer_select on storage.objects;
drop policy if exists original_glass_files_admin_all on storage.objects;

drop function if exists original_glass_storage_request_id(text);
drop function if exists original_glass_storage_tenant_id(text);

delete from storage.buckets
where id = 'original_glass_files';
