import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.local dosyasını yükle
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

// Seed için sabit değerler
const ADMIN_EMAIL = 'info@secesta.com'
const ADMIN_PASSWORD = 'Emre%&Sarkay23!'
const TENANT_NAME = 'Secesta'

async function seedAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error('❌ Hata: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE env değişkenleri gereklidir')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🚀 Admin kullanıcısı oluşturuluyor...')

  try {
    // 1. Kullanıcıyı kontrol et
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email === ADMIN_EMAIL)

    let userId: string

    if (existingUser) {
      console.log('ℹ️  Admin kullanıcısı zaten mevcut:', ADMIN_EMAIL)
      userId = existingUser.id

      // Şifreyi güncelle (idempotent olması için)
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })

      if (updateError) {
        console.error('❌ Şifre güncellenirken hata:', updateError.message)
      } else {
        console.log('✅ Admin şifresi güncellendi')
      }
    } else {
      // Yeni kullanıcı oluştur
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })

      if (createError || !newUser.user) {
        console.error('❌ Kullanıcı oluşturulurken hata:', createError?.message)
        process.exit(1)
      }

      userId = newUser.user.id
      console.log('✅ Admin kullanıcısı oluşturuldu:', ADMIN_EMAIL)
    }

    // 2. Tenant'ı kontrol et veya oluştur
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', TENANT_NAME)
      .single()

    let tenantId: string

    if (existingTenant) {
      console.log('ℹ️  Tenant zaten mevcut:', TENANT_NAME)
      tenantId = existingTenant.id
    } else {
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ name: TENANT_NAME })
        .select('id')
        .single()

      if (tenantError || !newTenant) {
        console.error('❌ Tenant oluşturulurken hata:', tenantError?.message)
        process.exit(1)
      }

      tenantId = newTenant.id
      console.log('✅ Tenant oluşturuldu:', TENANT_NAME)
    }

    // 3. user_tenants kaydını kontrol et veya oluştur
    const { data: existingUserTenant } = await supabase
      .from('user_tenants')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single()

    if (existingUserTenant) {
      console.log('ℹ️  User-Tenant ilişkisi zaten mevcut')

      // Rolü admin olarak güncelle (idempotent)
      const { error: updateRoleError } = await supabase
        .from('user_tenants')
        .update({ role: 'admin' })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)

      if (updateRoleError) {
        console.error('❌ Rol güncellenirken hata:', updateRoleError.message)
      } else {
        console.log('✅ Rol admin olarak güncellendi')
      }
    } else {
      const { error: userTenantError } = await supabase
        .from('user_tenants')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          role: 'admin',
        })

      if (userTenantError) {
        console.error('❌ User-Tenant ilişkisi oluşturulurken hata:', userTenantError.message)
        process.exit(1)
      }

      console.log('✅ User-Tenant ilişkisi oluşturuldu')
    }

    console.log('\n🎉 Seed işlemi tamamlandı!')
    console.log(`📧 Email: ${ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
    console.log(`🏢 Tenant: ${TENANT_NAME}`)
    console.log(`👤 Role: admin`)
  } catch (error) {
    console.error('❌ Beklenmeyen hata:', error)
    process.exit(1)
  }
}

seedAdmin()

