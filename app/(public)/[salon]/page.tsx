import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SalonTheme } from '@/components/theme-provider/salon-theme'
import { SalonLanding } from '@/components/shared/salon-landing'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ salon: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salon: slug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!org) return { title: 'Salon nije pronađen' }

  return {
    title: `${org.name} — Rezervišite termin`,
    description: `Rezervišite termin kod ${org.name} online — brzo i jednostavno.`,
  }
}

export default async function SalonPage({ params }: Props) {
  const { salon: slug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select(`
      id, name, slug,
      organization_settings (
        primary_color, accent_color, background_color, text_color,
        font_family, button_style, cover_image_url, logo_url,
        instagram_url, google_business_url, payment_enabled
      ),
      locations ( id, name, address, city ),
      services ( id, name, description, category, duration_minutes, price, image_url, repeat_cycle_days, is_active ),
      gallery_items ( id, image_url, caption, display_order, is_active ),
      reviews ( id, rating, comment, status, created_at,
        clients ( name )
      )
    `)
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  const settings = Array.isArray(org.organization_settings)
    ? org.organization_settings[0]
    : org.organization_settings

  const avgRating = org.reviews?.length
    ? org.reviews
        .filter((r) => r.status === 'published')
        .reduce((sum, r) => sum + r.rating, 0) /
      org.reviews.filter((r) => r.status === 'published').length
    : null

  return (
    <SalonTheme settings={settings}>
      <SalonLanding
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        org={org as any}
        settings={settings}
        avgRating={avgRating}
      />
    </SalonTheme>
  )
}
