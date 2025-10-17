import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Skip auth check for public pages to improve performance
  const publicPaths = ['/', '/auth/signin', '/auth/signup', '/auth/verify-email', '/auth/callback']
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/signin?redirect=' + encodeURIComponent(request.nextUrl.pathname), request.url))
      }

      // Only allow super admin email to access admin routes
      if (user.email !== 'mntomfordigitalllc@gmail.com') {
        return NextResponse.redirect(new URL('/dashboard?error=admin_access_denied', request.url))
      }
      
      // For setup page, allow access if user has correct email
      if (request.nextUrl.pathname === '/admin/setup-super-admin') {
        return response
      }
      
      // For other admin routes, check if super admin is set up
      try {
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('role', 'super_admin')
          .eq('is_active', true)
          .single()

        if (adminError || !adminUser) {
          return NextResponse.redirect(new URL('/admin/setup-super-admin', request.url))
        }
      } catch (adminCheckError) {
        console.error('Admin check error:', adminCheckError)
        return NextResponse.redirect(new URL('/admin/setup-super-admin', request.url))
      }
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
    }

  } catch (error) {
    console.error('Middleware auth error:', error)
    // For admin routes, redirect to signin on error
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/signin?redirect=' + encodeURIComponent(request.nextUrl.pathname), request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (webhook endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}