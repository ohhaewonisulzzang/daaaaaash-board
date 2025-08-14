import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from './types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 인증 토큰 새로고침 및 사용자 정보 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 인증이 필요한 페이지 접근 제어
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isSettingsPage = request.nextUrl.pathname.startsWith('/settings')

  // 인증되지 않은 사용자가 보호된 페이지에 접근하려고 할 때
  if (!user && (isDashboardPage || isSettingsPage)) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 인증된 사용자가 인증 페이지에 접근하려고 할 때
  if (user && isAuthPage && !request.nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

// 미들웨어에서 사용할 보호된 경로 설정
export const protectedPaths = ['/dashboard', '/settings']
export const authPaths = ['/auth/login', '/auth/signup', '/auth/reset-password']