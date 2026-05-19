'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getOrgId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('workers')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  return (data as { organization_id: string } | null)?.organization_id ?? null
}

export async function createService(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  if (!orgId) throw new Error('Organizacija nije pronađena')

  const { error } = await supabase.from('services').insert({
    organization_id: orgId,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    duration_minutes: parseInt(formData.get('duration_minutes') as string),
    price: parseFloat(formData.get('price') as string),
    repeat_cycle_days: formData.get('repeat_cycle_days')
      ? parseInt(formData.get('repeat_cycle_days') as string)
      : null,
    is_active: true,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  if (!orgId) throw new Error('Organizacija nije pronađena')

  const { error } = await supabase
    .from('services')
    .update({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string),
      price: parseFloat(formData.get('price') as string),
      repeat_cycle_days: formData.get('repeat_cycle_days')
        ? parseInt(formData.get('repeat_cycle_days') as string)
        : null,
    })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  if (!orgId) throw new Error('Organizacija nije pronađena')

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  if (!orgId) throw new Error('Organizacija nije pronađena')

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}
