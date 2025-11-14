-- Case dosyalarını atomik şekilde oluşturan yardımcı fonksiyon

create or replace function create_case_file(
  p_tenant_id uuid,
  p_created_by uuid,
  p_section text default 'original_glass'
)
returns case_files
language plpgsql
as $$
declare
  v_case case_files%rowtype;
  v_attempts integer := 0;
begin
  if p_tenant_id is null then
    raise exception 'Tenant kimliği gereklidir';
  end if;

  if p_created_by is null then
    raise exception 'Oluşturan kullanıcı kimliği gereklidir';
  end if;

  loop
    v_attempts := v_attempts + 1;

    begin
      insert into case_files (
        tenant_id,
        case_number,
        section,
        status,
        created_by
      )
      values (
        p_tenant_id,
        generate_case_number(p_tenant_id),
        coalesce(p_section, 'original_glass'),
        'open',
        p_created_by
      )
      returning * into v_case;

      return v_case;
    exception
      when unique_violation then
        exit when v_attempts >= 5;
    end;
  end loop;

  -- Eğer 5 denemede de unique kayıt çakışması çözülemediyse hatayı yükselt
  raise exception 'Case numarası üretilemedi, lütfen tekrar deneyin';
end;
$$;

comment on function create_case_file(uuid, uuid, text)
is 'Tenant ve kullanıcı bilgisiyle case dosyası oluşturur, case numarasını otomatik üretir.';
