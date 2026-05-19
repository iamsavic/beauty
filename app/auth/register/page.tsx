'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { SUPPORTED_COUNTRIES, getCurrency } from '@/lib/currency'

type AccountType = 'salon' | 'client'

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>('salon')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('RS')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: accountType === 'salon' ? 'org_admin' : 'client',
          account_type: accountType,
          country: accountType === 'salon' ? country : null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (accountType === 'salon') {
      toast.success('Nalog kreiran! Proverite email za potvrdu.')
      router.push('/admin/dashboard')
    } else {
      toast.success('Nalog kreiran!')
      router.push('/client/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-8">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: '#e91e8c' }}>beauty.</div>
          <CardTitle className="text-xl">Kreirajte nalog</CardTitle>
          <CardDescription>Počnite besplatno danas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={accountType} onValueChange={(v) => setAccountType(v as AccountType)} className="mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="salon" className="flex-1">Salon / Tehničarka</TabsTrigger>
              <TabsTrigger value="client" className="flex-1">Klijentkinja</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                {accountType === 'salon' ? 'Ime salona ili vaše ime' : 'Vaše ime'}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={accountType === 'salon' ? 'Nail Studio Ana' : 'Ana Novak'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vasa@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {accountType === 'salon' && (
              <div className="space-y-1.5">
                <Label htmlFor="country">Zemlja poslovanja</Label>
                <Select value={country} onValueChange={(v) => setCountry(v ?? 'RS')}>
                  <SelectTrigger id="country">
                    <SelectValue>
                      {SUPPORTED_COUNTRIES.find((c) => c.code === country)
                        ? `${SUPPORTED_COUNTRIES.find((c) => c.code === country)!.flag} ${SUPPORTED_COUNTRIES.find((c) => c.code === country)!.name}`
                        : 'Izaberi zemlju'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="mr-2">{c.flag}</span>{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Valuta: <strong>{getCurrency(country).code} ({getCurrency(country).symbol})</strong>
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 karaktera"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#e91e8c] hover:bg-[#c4186f] text-white"
              disabled={loading}
            >
              {loading ? 'Kreiranje naloga...' : 'Kreiraj nalog besplatno'}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Registracijom prihvatate naše uslove korišćenja.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Već imate nalog?{' '}
            <Link href="/auth/login" className="text-[#e91e8c] hover:underline font-medium">
              Prijavite se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
