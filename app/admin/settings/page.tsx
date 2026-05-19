import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SalonSettingsForm } from '@/components/admin/salon-settings-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Podešavanja salona' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: workerRow } = await supabase
    .from('workers')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const orgId = (workerRow as { organization_id: string } | null)?.organization_id

  if (!orgId) redirect('/admin/dashboard')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', orgId)
    .single()

  const { data: settings } = await supabase
    .from('organization_settings')
    .select('country')
    .eq('organization_id', orgId)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Podešavanja</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upravljaj podešavanjima salona
        </p>
      </div>

      <SalonSettingsForm
        organizationId={orgId}
        initialValues={{
          name: (org as { name: string } | null)?.name,
          country: (settings as { country: string } | null)?.country ?? 'RS',
        }}
      />
    </div>
  )
}
