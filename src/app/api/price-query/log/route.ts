import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Log kaydetme
export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const supabase = await supabaseServer()
    const body = await request.json()

    const logData = {
      user_id: user.userId,
      tenant_id: user.tenantId,
      search_type: body.search_type || 'quick_search',
      search_term: body.search_term || null,
      vehicle_category_id: body.vehicle_category_id || null,
      vehicle_brand_id: body.vehicle_brand_id || null,
      vehicle_model_id: body.vehicle_model_id || null,
      glass_position_id: body.glass_position_id || null,
      result_count: body.result_count || 0,
      selected_product_id: body.selected_product_id || null,
      selected_product_code: body.selected_product_code || null,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    }

    const { error } = await supabase
      .from('price_query_logs')
      .insert(logData)

    if (error) {
      console.error('Log kaydetme hatası:', error)
      // Log hatası kritik değil, session devam edebilir
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log API hatası:', error)
    return NextResponse.json({ error: 'Log kaydedilemedi' }, { status: 500 })
  }
}

