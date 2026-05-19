import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicesList } from '@/components/admin/services-list'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Usluge' }

export default async function ServicesPage() {
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

  const [{ data: services }, { data: settings }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, category, duration_minutes, price, repeat_cycle_days, is_active')
      .eq('organization_id', orgId)
      .order('category')
      .order('display_order')
      .order('name'),
    supabase
      .from('organization_settings')
      .select('country')
      .eq('organization_id', orgId)
      .single(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usluge</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upravljaj uslugama koje nudite klijentima
        </p>
      </div>

      <ServicesList
        services={(services ?? []) as Parameters<typeof ServicesList>[0]['services']}
        country={(settings as { country?: string } | null)?.country}
      />
    </div>
  )
}
