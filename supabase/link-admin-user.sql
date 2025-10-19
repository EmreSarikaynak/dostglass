-- Admin kullanıcısını tenant'a bağla
-- KULLANIM:
-- 1. Supabase Dashboard → Authentication → Users'dan oluşturduğunuz kullanıcının ID'sini kopyalayın
-- 2. Aşağıdaki 'USER_ID_BURAYA' yazan yere yapıştırın
-- 3. Bu SQL'i Supabase SQL Editor'de çalıştırın

INSERT INTO user_tenants (user_id, tenant_id, role)
VALUES (
  'USER_ID_BURAYA'::uuid,  -- ← Buraya kullanıcı ID'sini yapıştırın
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Secesta tenant ID
  'admin'
)
ON CONFLICT (user_id, tenant_id) DO UPDATE
SET role = 'admin';

-- Kontrol için:
SELECT 
  ut.user_id,
  ut.role,
  t.name as tenant_name,
  au.email
FROM user_tenants ut
JOIN tenants t ON t.id = ut.tenant_id
JOIN auth.users au ON au.id = ut.user_id;

