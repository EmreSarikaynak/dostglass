import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: z.enum(['admin', 'bayi'], { message: 'Rol admin veya bayi olmalıdır' }),
  tenantName: z.string().min(1, 'Firma adı gereklidir'),
})

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const currentUser = await getUserAndRole()
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    // Request body'yi parse et
    const body = await request.json()
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, role, tenantName } = validation.data

    // 1. Auth kullanıcısını oluştur
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth kullanıcı oluşturma hatası:', authError)
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı: ' + authError.message },
        { status: 500 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı' },
        { status: 500 }
      )
    }

    // 2. Tenant'ı kontrol et veya oluştur
    let tenantId: string

    const { data: existingTenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('name', tenantName)
      .single()

    if (existingTenant) {
      tenantId = existingTenant.id
    } else {
      const { data: newTenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({ name: tenantName })
        .select('id')
        .single()

      if (tenantError || !newTenant) {
        // Kullanıcı oluşturuldu ama tenant oluşturulamadı, kullanıcıyı sil
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        return NextResponse.json(
          { error: 'Firma oluşturulamadı' },
          { status: 500 }
        )
      }

      tenantId = newTenant.id
    }

    // 3. user_tenants tablosuna ekle
    const { error: userTenantError } = await supabaseAdmin
      .from('user_tenants')
      .insert({
        user_id: authUser.user.id,
        tenant_id: tenantId,
        role,
      })

    if (userTenantError) {
      // Kullanıcı oluşturuldu ama user_tenants eklenemedi, kullanıcıyı sil
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      console.error('user_tenants ekleme hatası:', userTenantError)
      return NextResponse.json(
        { error: 'Kullanıcı rolü atanamadı' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        role,
        tenantName,
      },
    })
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

