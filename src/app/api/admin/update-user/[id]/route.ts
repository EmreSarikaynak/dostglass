import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Yetki kontrolü
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const { id: userId } = await params
    const body = await request.json()
    const { email, role, tenantId, dealerInfo, password } = body

    if (!userId || !email || !role || !tenantId) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Email güncelle
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email,
        ...(password ? { password } : {}),
      }
    )

    if (authError) {
      console.error('Kullanıcı bilgisi güncelleme hatası:', authError)
      return NextResponse.json(
        { error: 'Kullanıcı bilgileri güncellenirken hata oluştu' },
        { status: 500 }
      )
    }

    // user_tenants güncelle
    const { error: tenantError } = await supabaseAdmin
      .from('user_tenants')
      .update({
        role,
        tenant_id: tenantId,
      })
      .eq('user_id', userId)

    if (tenantError) {
      console.error('user_tenants güncelleme hatası:', tenantError)
      return NextResponse.json(
        { error: 'Kullanıcı ilişkisi güncellenirken hata oluştu' },
        { status: 500 }
      )
    }

    // Eğer bayi ise dealer bilgilerini güncelle
    if (role === 'bayi' && dealerInfo) {
      // Önce mevcut dealer kaydı var mı kontrol et
      const { data: existingDealer } = await supabaseAdmin
        .from('dealers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      const dealerData = {
        user_id: userId,
        company_name: dealerInfo.companyName,
        contact_person: dealerInfo.contactPerson,
        phone: dealerInfo.phone,
        mobile: dealerInfo.mobile,
        email: dealerInfo.email,
        address: dealerInfo.address,
        city: dealerInfo.city,
        district: dealerInfo.district,
        postal_code: dealerInfo.postalCode,
        tax_office: dealerInfo.taxOffice,
        tax_number: dealerInfo.taxNumber,
        iban: dealerInfo.iban,
        notes: dealerInfo.notes,
      }

      if (existingDealer) {
        // Güncelle
        const { error: dealerError } = await supabaseAdmin
          .from('dealers')
          .update(dealerData)
          .eq('user_id', userId)

        if (dealerError) {
          console.error('Dealer güncelleme hatası:', dealerError)
          return NextResponse.json(
            { error: 'Bayi bilgileri güncellenirken hata oluştu' },
            { status: 500 }
          )
        }
      } else {
        // Yeni kayıt oluştur
        const { error: dealerError } = await supabaseAdmin
          .from('dealers')
          .insert(dealerData)

        if (dealerError) {
          console.error('Dealer oluşturma hatası:', dealerError)
          return NextResponse.json(
            { error: 'Bayi bilgileri oluşturulurken hata oluştu' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(
      { message: 'Kullanıcı başarıyla güncellendi' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}
