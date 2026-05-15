import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <ShieldOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Nema pristupa</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Nemate dozvolu da pristupite ovoj stranici. Kontaktirajte administratora salona.
      </p>
      <Link href="/" className={buttonVariants({ variant: 'outline' })}>
        Nazad na početnu
      </Link>
    </div>
  )
}
