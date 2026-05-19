'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Clock, RefreshCw } from 'lucide-react'
import { ServiceForm, CATEGORIES } from './service-form'
import { toggleServiceActive, deleteService } from '@/app/admin/services/actions'
import { formatPrice, getCurrency } from '@/lib/currency'

interface Service {
  id: string
  name: string
  description: string | null
  category: string
  duration_minutes: number
  price: number
  repeat_cycle_days: number | null
  is_active: boolean
}

interface ServicesListProps {
  services: Service[]
  country?: string | null
}

export function ServicesList({ services, country }: ServicesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const currency = getCurrency(country)

  const categoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label ?? value

  const categories = [...new Set(services.map((s) => s.category))]

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await toggleServiceActive(id, !current)
        toast.success(!current ? 'Usluga aktivirana' : 'Usluga deaktivirana')
      } catch {
        toast.error('Greška')
      }
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Obriši uslugu "${name}"?`)) return
    startTransition(async () => {
      try {
        await deleteService(id)
        toast.success('Usluga obrisana')
      } catch {
        toast.error('Greška pri brisanju')
      }
    })
  }

  if (editingId) {
    const service = services.find((s) => s.id === editingId)!
    return (
      <Card>
        <CardContent className="pt-5">
          <h3 className="font-semibold mb-4">Izmeni uslugu</h3>
          <ServiceForm
            service={service}
            currencySymbol={currency.symbol}
            onDone={() => setEditingId(null)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Nova usluga forma */}
      {showNewForm ? (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold mb-4">Nova usluga</h3>
            <ServiceForm
              currencySymbol={currency.symbol}
              onDone={() => setShowNewForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto"
        >
          + Dodaj uslugu
        </Button>
      )}

      {/* Lista po kategorijama */}
      {services.length === 0 && !showNewForm && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">Još nema usluga. Dodaj prvu uslugu gore.</p>
          </CardContent>
        </Card>
      )}

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {categoryLabel(cat)}
          </h3>
          <div className="space-y-2">
            {services
              .filter((s) => s.category === cat)
              .map((service) => (
                <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{service.name}</p>
                          {!service.is_active && (
                            <Badge variant="secondary" className="text-xs">Neaktivna</Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration_minutes} min
                          </span>
                          {service.repeat_cycle_days && (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              svakih {service.repeat_cycle_days} dana
                            </span>
                          )}
                          <span className="font-semibold text-foreground">
                            {formatPrice(service.price, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggle(service.id, service.is_active)}
                          disabled={isPending}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingId(service.id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(service.id, service.name)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
