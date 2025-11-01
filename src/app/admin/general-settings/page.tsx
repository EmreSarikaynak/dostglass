import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { GeneralSettingsForm } from './GeneralSettingsForm'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export default async function GeneralSettingsPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  // Mevcut ayarları getir
  const supabaseAdmin = getSupabaseAdmin()
  const { data: settings } = await supabaseAdmin
    .from('system_settings')
    .select('*')
    .single()

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <GeneralSettingsForm initialSettings={settings} />
    </AdminLayout>
  )
}

