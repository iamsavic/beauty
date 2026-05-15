import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  /^\/$/,
  /^\/auth\//,
  /^\/[^/]+\/book/,
  /^\/[^/]+\/gallery/,
  /^\/[^/]+\/reviews/,
  /^\/[^/]+\/promotions/,
  /^\/[^/]+$/,
  /^\/review/,
  /^\/rebook/,
  /^\/api\/webhooks\//,
]

const ADMIN_ROUTES = /^\/admin\//
const WORKER_ROUTES = /^\/worker\//
const CLIENT_ROUTES = /^\/client\//

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isPublic = PUBLIC_ROUTES.some((pattern) => pattern.test(pathname))
  if (isPublic) return supabaseResponse

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Fetch user role from metadata
  const userRole = user.user_metadata?.role as string | undefined

  if (ADMIN_ROUTES.test(pathname)) {
    if (!['super_admin', 'org_admin', 'manager', 'receptionist'].includes(userRole ?? '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  if (WORKER_ROUTES.test(pathname)) {
    if (!['worker', 'org_admin', 'manager'].includes(userRole ?? '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  if (CLIENT_ROUTES.test(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
