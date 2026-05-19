'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrency } from '@/lib/currency'
import { revalidatePath } from 'next/cache'

export async function updateSalonSettings({
  organizationId,
  name,
  country,
}: {
  organizationId: string
  name: string
  country: string
}) {
  const supabase = await createClient()
  const currency = getCurrency(country)

  const { error: orgError } = await supabase
    .from('organizations')
    .update({ name })
    .eq('id', organizationId)

  if (orgError) throw new Error(orgError.message)

  const { error: settingsError } = await supabase
    .from('organization_settings')
    .update({
      country,
      currency: currency.code,
      currency_symbol: currency.symbol,
    })
    .eq('organization_id', organizationId)

  if (settingsError) throw new Error(settingsError.message)

  revalidatePath('/admin/settings')
  revalidatePath('/admin/dashboard')
}
