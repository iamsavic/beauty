import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Star, Zap, ShieldCheck, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: CalendarDays,
    title: '24/7 Rezervacije',
    description: 'Klijenti rezervišu termin u bilo koje doba — bez poziva, bez poruka.',
  },
  {
    icon: Zap,
    title: 'Instant booking link',
    description: 'Jedan link koji ide u Instagram bio, Google profil i WhatsApp status.',
  },
  {
    icon: ShieldCheck,
    title: 'No-show zaštita',
    description: 'Depoziti i automatske politike otkazivanja štite tvoje radno vrijeme.',
  },
  {
    icon: TrendingUp,
    title: 'Retention engine',
    description: '"Ponovi za 3 sedmice" — klijentice se vraćaju bez dodatnog truda.',
  },
  {
    icon: Users,
    title: 'Tim & Rasporedi',
    description: 'Upravljaj cijelim timom, slobodnim danima i uslugama na jednom mjestu.',
  },
  {
    icon: Star,
    title: 'Reviews & Povjerenje',
    description: 'Automatski tražite recenzije i gradite online reputaciju.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-primary, #e91e8c)' }}>
            beauty.
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Funkcije</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Cijene</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Prijavi se
            </Link>
            <Link href="/auth/register" className={cn(buttonVariants({ size: 'sm' }), 'bg-[#e91e8c] hover:bg-[#c4186f] text-white')}>
              Počni besplatno
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-pink-50 to-white">
        <Badge variant="secondary" className="mb-4 text-xs">
          Nail booking sa retention fokusom
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl leading-tight">
          Prestani da juriš potvrde.{' '}
          <span style={{ color: '#e91e8c' }}>Neka booking radi za tebe.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
          Booking link za Instagram bio, automatski podsjetnici, depoziti i klijentski profili —
          sve što solo tehničarki ili salonu treba da napuni kalendar i zadrži klijentice.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/auth/register" className={cn(buttonVariants({ size: 'lg' }), 'bg-[#e91e8c] hover:bg-[#c4186f] text-white rounded-full px-8')}>
            Kreiraj salon besplatno
          </Link>
          <Link href="/demo-salon" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-full px-8')}>
            Pogledaj demo salon →
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Bez kreditne kartice. Postavljanje za 5 minuta.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">Sve što trebaš, ništa što ne trebaš</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Polovina vrijednosti je u tome da neko rezerviše brže.
            Druga polovina je u tome da se klijentkinja vrati bez dodatnog truda.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <f.icon className="h-8 w-8 mb-3" style={{ color: '#e91e8c' }} />
                <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Spreman/na da počneš?</h2>
        <p className="mb-8 text-pink-100 max-w-md mx-auto">
          Postavi svoj salon za 5 minuta i pošalji link klijenticama još danas.
        </p>
        <Link href="/auth/register" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'rounded-full px-10 font-semibold')}>
          Kreiraj besplatni nalog →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Beauty Booking. Sva prava zadržana.</p>
      </footer>
    </div>
  )
}
