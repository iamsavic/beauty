'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createService, updateService } from '@/app/admin/services/actions'

const CATEGORIES = [
  { value: 'manikir', label: 'Manikir' },
  { value: 'pedikir', label: 'Pedikir' },
  { value: 'gel', label: 'Gel nokti' },
  { value: 'akril', label: 'Akrilni nokti' },
  { value: 'ukrasi', label: 'Ukrasi i dizajn' },
  { value: 'tretman', label: 'Tretmani' },
  { value: 'ostalo', label: 'Ostalo' },
]

export { CATEGORIES }

const DURATIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 sat' },
  { value: '75', label: '1h 15min' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 sata' },
  { value: '150', label: '2h 30min' },
  { value: '180', label: '3 sata' },
]

interface Service {
  id: string
  name: string
  description: string | null
  category: string
  duration_minutes: number
  price: number
  repeat_cycle_days: number | null
}

interface ServiceFormProps {
  service?: Service
  currencySymbol?: string
  onDone: () => void
}

export function ServiceForm({ service, currencySymbol = 'din', onDone }: ServiceFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState(service?.category ?? 'manikir')
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? '60'))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData(formRef.current!)
    formData.set('category', category)
    formData.set('duration_minutes', duration)

    startTransition(async () => {
      try {
        if (service) {
          await updateService(service.id, formData)
          toast.success('Usluga ažurirana')
        } else {
          await createService(formData)
          toast.success('Usluga dodana')
        }
        onDone()
      } catch {
        toast.error('Greška pri čuvanju usluge')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="name">Naziv usluge *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={service?.name}
            placeholder="Npr. Gel lak + ukrasi"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Kategorija *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? 'manikir')}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue>
                {CATEGORIES.find((c) => c.value === category)?.label ?? 'Izaberi kategoriju'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="duration">Trajanje *</Label>
          <Select value={duration} onValueChange={(v) => setDuration(v ?? '60')}>
            <SelectTrigger id="duration">
              <SelectValue>
                {DURATIONS.find((d) => d.value === duration)?.label ?? 'Izaberi trajanje'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Cena ({currencySymbol}) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={service?.price}
            placeholder="3500"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="repeat_cycle_days">
            Ciklus ponavljanja (dani)
            <span className="text-muted-foreground text-xs ml-1">opciono</span>
          </Label>
          <Input
            id="repeat_cycle_days"
            name="repeat_cycle_days"
            type="number"
            min="1"
            defaultValue={service?.repeat_cycle_days ?? ''}
            placeholder="Npr. 21"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="description">Opis
            <span className="text-muted-foreground text-xs ml-1">opciono</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ''}
            placeholder="Kratki opis usluge..."
            rows={2}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto">
          {isPending ? 'Čuvanje...' : service ? 'Sačuvaj izmene' : 'Dodaj uslugu'}
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending} className="w-full sm:w-auto">
          Otkaži
        </Button>
      </div>
    </form>
  )
}
