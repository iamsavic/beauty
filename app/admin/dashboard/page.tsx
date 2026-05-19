import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { OnboardingChecklist } from '@/components/admin/onboarding-checklist'
import { getCurrency, formatPrice } from '@/lib/currency'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const ONBOARDING_STEPS = [
  { id: 'profile', label: 'Dodaj informacije o salonu', path: '/admin/settings' },
  { id: 'theme', label: 'Postavi vizuelni identitet', path: '/admin/settings/theme' },
  { id: 'service', label: 'Dodaj prvu uslugu', path: '/admin/services/new' },
  { id: 'worker', label: 'Dodaj prvog radnika', path: '/admin/staff/new' },
  { id: 'notifications', label: 'Podesi notifikacije', path: '/admin/settings/notifications' },
  { id: 'payments', label: 'Postavi politiku plaćanja', path: '/admin/settings/payments' },
  { id: 'gallery', label: 'Dodaj prvu sliku u galeriju', path: '/admin/gallery' },
  { id: 'booking', label: 'Pošalji test booking', path: '#' },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch organization for this admin
  const { data: workerRow } = await supabase
    .from('workers')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const orgId = (workerRow as { organization_id: string } | null)?.organization_id ?? null

  const { data: org } = orgId
    ? await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', orgId)
        .single()
    : { data: null }

  const { data: settings } = orgId
    ? await supabase
        .from('organization_settings')
        .select('onboarding_completed, onboarding_steps, country')
        .eq('organization_id', orgId)
        .single()
    : { data: null }

  const onboardingCompleted = settings?.onboarding_completed ?? false
  const completedSteps = (settings?.onboarding_steps as string[] | null) ?? []
  const currency = getCurrency((settings as { country?: string } | null)?.country)

  // Fetch today's stats
  const today = new Date().toISOString().split('T')[0]
  const { count: todayCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId ?? '')
    .gte('starts_at', `${today}T00:00:00`)
    .lte('starts_at', `${today}T23:59:59`)

  const { data: todayRevenue } = await supabase
    .from('appointments')
    .select('total_price')
    .eq('organization_id', orgId ?? '')
    .eq('status', 'completed')
    .gte('starts_at', `${today}T00:00:00`)
    .lte('starts_at', `${today}T23:59:59`)

  const revenue = todayRevenue?.reduce((sum, a) => sum + (a.total_price ?? 0), 0) ?? 0

  const { count: noShowCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId ?? '')
    .eq('status', 'no_show')
    .gte('starts_at', `${today}T00:00:00`)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dobrodošli nazad{org?.name ? `, ${org.name}` : ''}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="kpi-grid">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Termini danas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="kpi-appointments-today">{todayCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Prihod danas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="kpi-revenue-today">{formatPrice(revenue, currency)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              No-show danas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="kpi-no-show-rate">{noShowCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Booking link
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org?.slug ? (
              <a
                href={`/${org.slug}`}
                target="_blank"
                className="text-xs text-pink-600 hover:underline truncate block"
              >
                beauty.app/{org.slug}
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">Nije podešeno</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding checklist */}
      {!onboardingCompleted && (
        <OnboardingChecklist
          steps={ONBOARDING_STEPS}
          completedStepIds={completedSteps}
          organizationId={orgId ?? ''}
        />
      )}
    </div>
  )
}
