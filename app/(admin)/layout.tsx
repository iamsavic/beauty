import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role as string | undefined
  const allowedRoles = ['super_admin', 'org_admin', 'manager', 'receptionist']
  if (!allowedRoles.includes(role ?? '')) redirect('/unauthorized')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
