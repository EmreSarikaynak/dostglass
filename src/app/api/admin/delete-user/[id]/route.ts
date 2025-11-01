import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Önce user_tenants tablosundan sil
    const { error: tenantError } = await supabaseAdmin
      .from('user_tenants')
      .delete()
      .eq('user_id', userId)

    if (tenantError) {
      console.error('user_tenants silme hatası:', tenantError)
      return NextResponse.json(
        { error: 'Kullanıcı ilişkileri silinirken hata oluştu' },
        { status: 500 }
      )
    }

    // Auth kullanıcısını sil
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth kullanıcı silme hatası:', authError)
      return NextResponse.json(
        { error: 'Kullanıcı silinirken hata oluştu' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Kullanıcı başarıyla silindi' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}

