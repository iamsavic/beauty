'use client'

import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Star, MapPin, Clock, Link2, ArrowRight } from 'lucide-react'
import { getCurrency, formatPrice } from '@/lib/currency'

interface SalonLandingProps {
  org: {
    id: string
    name: string
    slug: string
    locations?: Array<{ id: string; name: string; address: string | null; city: string | null }>
    services?: Array<{
      id: string
      name: string
      description: string | null
      category: string
      duration_minutes: number
      price: number
      image_url: string | null
      is_active: boolean
    }>
    gallery_items?: Array<{
      id: string
      image_url: string
      caption: string | null
      display_order: number
      is_active: boolean
    }>
    reviews?: Array<{
      id: string
      rating: number
      comment: string | null
      status: string
      created_at: string
      clients?: { name: string } | null
    }>
  }
  settings: {
    primary_color?: string | null
    cover_image_url?: string | null
    logo_url?: string | null
    instagram_url?: string | null
    country?: string | null
  } | null
  avgRating: number | null
}

export function SalonLanding({ org, settings, avgRating }: SalonLandingProps) {
  const currency = getCurrency(settings?.country)
  const primaryColor = settings?.primary_color ?? '#e91e8c'
  const activeServices = org.services?.filter((s) => s.is_active) ?? []
  const galleryItems = org.gallery_items?.filter((g) => g.is_active).slice(0, 8) ?? []
  const publishedReviews = org.reviews?.filter((r) => r.status === 'published').slice(0, 6) ?? []
  const location = org.locations?.[0]

  const categories = [...new Set(activeServices.map((s) => s.category))]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings?.logo_url ? (
              <Image src={settings.logo_url} alt={org.name} width={32} height={32} className="rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: primaryColor }}>
                {org.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-sm">{org.name}</span>
          </div>
          <Link
            href={`/${org.slug}/book`}
            className={cn(buttonVariants({ size: 'sm' }), 'text-white rounded-full')}
            style={{ backgroundColor: primaryColor }}
          >
            Rezerviši <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Cover */}
      <section className="relative h-48 sm:h-64 md:h-80 overflow-hidden"
        style={{ backgroundColor: `${primaryColor}20` }}>
        {settings?.cover_image_url ? (
          <Image
            src={settings.cover_image_url}
            alt={`${org.name} cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">💅</div>
              <p className="text-sm text-muted-foreground">Dodajte cover sliku u admin panelu</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Salon name overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          {location && (
            <div className="flex items-center gap-1 text-sm text-white/80 mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{location.city ?? location.address}</span>
            </div>
          )}
        </div>

        {avgRating && (
          <div className="absolute bottom-4 right-4 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </section>

      {/* CTA strip */}
      <div className="px-4 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between container mx-auto">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {avgRating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {avgRating.toFixed(1)} ({publishedReviews.length} recenzija)
            </span>
          )}
          {location?.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location.city}
            </span>
          )}
        </div>
        <Link
          href={`/${org.slug}/book`}
          className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto text-white rounded-full font-semibold')}
          style={{ backgroundColor: primaryColor }}
          data-testid="book-cta"
        >
          Rezervišite termin →
        </Link>
      </div>

      <Separator />

      {/* Services */}
      {activeServices.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-4">Usluge</h2>
          {categories.map((cat) => (
            <div key={cat} className="mb-6">
              <Badge variant="secondary" className="mb-3 capitalize">{cat}</Badge>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeServices
                  .filter((s) => s.category === cat)
                  .map((service) => (
                    <Link key={service.id} href={`/${org.slug}/book?service=${service.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="service-card">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {service.duration_minutes} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-base" style={{ color: primaryColor }}>
                              {formatPrice(service.price, currency)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Gallery */}
      {galleryItems.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Galerija</h2>
            <Link href={`/${org.slug}/gallery`} className="text-sm hover:underline" style={{ color: primaryColor }}>
              Pogledaj sve →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {galleryItems.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.image_url}
                  alt={item.caption ?? 'Gallery'}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {publishedReviews.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-4">Recenzije</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {publishedReviews.map((review) => (
              <Card key={review.id} data-testid="review-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    — {review.clients?.name ?? 'Klijentkinja'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-sm text-muted-foreground bg-gray-50">
        <div className="flex items-center justify-center gap-4 mb-2">
          {settings?.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Link2 className="h-4 w-4" />
              Instagram
            </a>
          )}
        </div>
        <p className="text-xs">
          Rezervacije powered by{' '}
          <Link href="/" className="font-semibold" style={{ color: primaryColor }}>beauty.</Link>
        </p>
      </footer>
    </div>
  )
}
