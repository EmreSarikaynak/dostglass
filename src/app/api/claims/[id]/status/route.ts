import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// İhbar durumu güncelleme
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const { status, notes } = await request.json()

    // Geçerli durum kontrolü
    const validStatuses = ['draft', 'submitted', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 })
    }

    const supabase = await supabaseServer()

    // Mevcut ihbarı getir
    const { data: existingClaim, error: fetchError } = await supabase
      .from('claims')
      .select('*, tenants(id)')
      .eq('id', id)
      .single()

    if (fetchError || !existingClaim) {
      return NextResponse.json({ error: 'İhbar bulunamadı' }, { status: 404 })
    }

    // Yetki kontrolü: Sadece kendi tenant'ının ihbarlarını değiştirebilir
    if (existingClaim.tenants?.id !== user.tenantId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Bu ihbarı güncelleyemezsiniz' }, { status: 403 })
    }

    // Durum geçiş kuralları
    const currentStatus = existingClaim.status
    const allowedTransitions: Record<string, string[]> = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'submitted', 'cancelled'],
      'completed': [], // Tamamlanan ihbar değiştirilemez
      'cancelled': ['submitted'], // İptal edilen tekrar açılabilir
    }

    const allowed = allowedTransitions[currentStatus] || []
    if (!allowed.includes(status)) {
      return NextResponse.json({ 
        error: `${currentStatus} durumundan ${status} durumuna geçiş yapılamaz` 
      }, { status: 400 })
    }

    // Durumu güncelle
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Durum notları varsa ekle
    if (notes) {
      updateData.status_notes = notes
    }

    // Tamamlanma tarihi
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Durum güncelleme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Durum değişikliği logu (opsiyonel)
    const { error: historyError } = await supabase.from('claim_status_history').insert({
      claim_id: id,
      old_status: currentStatus,
      new_status: status,
      changed_by: user.userId,
      notes: notes || null,
    })

    if (historyError) {
      console.log('Status history log failed (table may not exist)', historyError)
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: `İhbar durumu ${status} olarak güncellendi`,
    })
  } catch (error) {
    console.error('Status update API error:', error)
    return NextResponse.json(
      { error: 'Durum güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
