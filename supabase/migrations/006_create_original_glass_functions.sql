-- migrate:up
-- Orijinal cam modülü için fonksiyonlar ve trigger tanımları

-- Fonksiyon tanımları (DO bloğunun dışında)
create or replace function generate_case_number(p_tenant_id uuid)
returns text
language plpgsql
as $$
declare
  year_prefix text := to_char(now(), 'YYYY');
  sequence_num integer;
begin
  select coalesce(max(
    cast(substring(case_number from '[0-9]{5}$') as integer)
  ),0) + 1
  into sequence_num
  from case_files
  where tenant_id = p_tenant_id
    and case_number like 'DOS-' || year_prefix || '-%';

  return format('DOS-%s-%s', year_prefix, lpad(sequence_num::text, 5, '0'));
end;
$$;

create or replace function auto_generate_case_number()
returns trigger
language plpgsql
as $$
begin
  if new.case_number is null or new.case_number = '' then
    new.case_number := generate_case_number(new.tenant_id);
  end if;
  return new;
end;
$$;

create or replace function generate_original_glass_request_number(p_tenant_id uuid)
returns text
language plpgsql
as $$
declare
  year_prefix text := to_char(now(), 'YYYY');
  sequence_num integer;
begin
  select coalesce(max(
    cast(substring(request_number from '[0-9]{5}$') as integer)
  ),0) + 1
  into sequence_num
  from original_glass_requests
  where tenant_id = p_tenant_id
    and request_number like 'ORJ-' || year_prefix || '-%';

  return format('ORJ-%s-%s', year_prefix, lpad(sequence_num::text, 5, '0'));
end;
$$;

create or replace function auto_generate_request_number()
returns trigger
language plpgsql
as $$
begin
  if new.request_number is null or new.request_number = '' then
    new.request_number := generate_original_glass_request_number(new.tenant_id);
  end if;
  return new;
end;
$$;

create or replace function set_promised_delivery_date()
returns trigger
language plpgsql
as $$
declare
  base_date date;
begin
  if new.promised_delivery_days is not null then
    base_date := coalesce(new.termin_date, current_date);
    new.promised_delivery_date := base_date + new.promised_delivery_days;
  elsif new.promised_delivery_days is null and tg_op = 'UPDATE' then
    -- Eğer gün sayısı kaldırıldıysa teslim tarihi de temizlensin
    new.promised_delivery_date := null;
  end if;
  return new;
end;
$$;

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function log_request_changes()
returns trigger
language plpgsql
as $$
declare
  actor uuid;
  jwt_sub text;
begin
  actor := auth.uid();

  if actor is null then
    jwt_sub := current_setting('request.jwt.claim.sub', true);
    if jwt_sub is not null and jwt_sub <> '' then
      begin
        actor := jwt_sub::uuid;
      exception when others then
        actor := null;
      end;
    end if;
  end if;

  if actor is null then
    actor := coalesce(new.assigned_admin_id, old.assigned_admin_id, new.created_by);
  end if;

  if new.status is distinct from old.status then
    insert into original_glass_request_logs (tenant_id, request_id, actor_id, action, payload)
    values (
      new.tenant_id,
      new.id,
      actor,
      'status_change',
      jsonb_build_object(
        'old_status', old.status,
        'new_status', new.status
      )
    );
  end if;

  if new.assigned_admin_id is distinct from old.assigned_admin_id then
    insert into original_glass_request_logs (tenant_id, request_id, actor_id, action, payload)
    values (
      new.tenant_id,
      new.id,
      actor,
      'assignment_change',
      jsonb_build_object(
        'old_assigned_admin_id', old.assigned_admin_id,
        'new_assigned_admin_id', new.assigned_admin_id
      )
    );
  end if;

  if new.notes is distinct from old.notes then
    insert into original_glass_request_logs (tenant_id, request_id, actor_id, action, payload)
    values (
      new.tenant_id,
      new.id,
      actor,
      'note_added',
      jsonb_build_object(
        'old_notes', old.notes,
        'new_notes', new.notes
      )
    );
  end if;

  if new.response_notes is distinct from old.response_notes
     or new.promised_delivery_days is distinct from old.promised_delivery_days
     or new.promised_delivery_date is distinct from old.promised_delivery_date then
    insert into original_glass_request_logs (tenant_id, request_id, actor_id, action, payload)
    values (
      new.tenant_id,
      new.id,
      actor,
      'update',
      jsonb_strip_nulls(jsonb_build_object(
        'old_response_notes', old.response_notes,
        'new_response_notes', new.response_notes,
        'old_promised_delivery_days', old.promised_delivery_days,
        'new_promised_delivery_days', new.promised_delivery_days,
        'old_promised_delivery_date', old.promised_delivery_date,
        'new_promised_delivery_date', new.promised_delivery_date
      ))
    );
  end if;

  return new;
end;
$$;

-- Tüm trigger'ları tek bir DO bloğunda oluştur
do $$
begin
  -- case_files trigger'ı (tablo varsa)
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'case_files'
  ) then
    drop trigger if exists trg_case_files_auto_number on case_files;
    create trigger trg_case_files_auto_number
      before insert on case_files
      for each row
      execute function auto_generate_case_number();
  end if;

  -- original_glass_requests trigger'ları (tablo varsa)
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'original_glass_requests'
  ) then
    drop trigger if exists trg_ogr_auto_number on original_glass_requests;
    create trigger trg_ogr_auto_number
      before insert on original_glass_requests
      for each row
      execute function auto_generate_request_number();

    drop trigger if exists trg_ogr_set_promised_delivery on original_glass_requests;
    create trigger trg_ogr_set_promised_delivery
      before insert or update on original_glass_requests
      for each row
      execute function set_promised_delivery_date();

    drop trigger if exists trg_ogr_updated_at on original_glass_requests;
    create trigger trg_ogr_updated_at
      before update on original_glass_requests
      for each row
      execute function update_updated_at_column();

    drop trigger if exists trg_ogr_log_changes on original_glass_requests;
    create trigger trg_ogr_log_changes
      after update on original_glass_requests
      for each row
      execute function log_request_changes();
  end if;
end $$;

comment on function generate_case_number(uuid) is 'Her tenant için yıllık sıfırlanan DOS-YYYY-##### formatında dosya numarası üretir';
comment on function generate_original_glass_request_number(uuid) is 'Her tenant için yıllık sıfırlanan ORJ-YYYY-##### formatında talep numarası üretir';
comment on function set_promised_delivery_date() is 'Promised delivery gün sayısına göre hedef tarihi hesaplar';
comment on function log_request_changes() is 'Durum, atama ve diğer kritik değişiklikleri otomatik olarak loglar';

-- migrate:down

-- Sadece var olan trigger'ları ve fonksiyonları temizle
do $$
begin
  -- case_files trigger'ı ve fonksiyonları (varsa)
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'case_files'
  ) then
    drop trigger if exists trg_case_files_auto_number on case_files;
    drop function if exists auto_generate_case_number();
    drop function if exists generate_case_number(uuid);
  end if;

  -- original_glass_requests trigger'ları ve fonksiyonları (varsa)
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'original_glass_requests'
  ) then
    drop trigger if exists trg_ogr_log_changes on original_glass_requests;
    drop trigger if exists trg_ogr_updated_at on original_glass_requests;
    drop trigger if exists trg_ogr_set_promised_delivery on original_glass_requests;
    drop trigger if exists trg_ogr_auto_number on original_glass_requests;
    drop function if exists log_request_changes();
    drop function if exists set_promised_delivery_date();
    drop function if exists auto_generate_request_number();
    drop function if exists generate_original_glass_request_number(uuid);
    end if;
end $$;
