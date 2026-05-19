'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SUPPORTED_COUNTRIES, getCurrency } from '@/lib/currency'
import { updateSalonSettings } from '@/app/admin/settings/actions'

interface SalonSettingsFormProps {
  organizationId: string
  initialValues: {
    name?: string | null
    country?: string | null
  }
}

export function SalonSettingsForm({ organizationId, initialValues }: SalonSettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(initialValues.name ?? '')
  const [country, setCountry] = useState(initialValues.country ?? 'RS')

  const selectedCurrency = getCurrency(country)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateSalonSettings({ organizationId, name, country })
        toast.success('Podešavanja sačuvana')
        router.refresh()
      } catch {
        toast.error('Greška pri čuvanju podešavanja')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Osnovne informacije</CardTitle>
          <CardDescription>Naziv salona i zemlja rada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salon-name">Naziv salona</Label>
            <Input
              id="salon-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Npr. Nail Studio Ana"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Zemlja</Label>
              <Select value={country} onValueChange={(v) => setCountry(v ?? 'RS')}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Izaberi zemlju" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="mr-2">{c.flag}</span>{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              Valuta za prikaz cena:
              <Badge variant="secondary">
                {selectedCurrency.code} ({selectedCurrency.symbol})
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Čuvanje...' : 'Sačuvaj'}
      </Button>
    </form>
  )
}
