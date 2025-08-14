import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

// 서버 컴포넌트/액션에서 사용하는 Supabase 클라이언트 생성 함수
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll 메서드는 Server Component에서 호출되었을 수 있습니다.
            // 이 경우 쿠키를 설정할 수 없으므로 조용히 실패합니다.
          }
        },
      },
    }
  )
}

// 서비스 롤 키를 사용하는 관리자 클라이언트 (RLS 우회 가능)
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      cookies: {
        getAll() { return [] },
        setAll() { /* 관리자 클라이언트는 쿠키를 사용하지 않음 */ },
      },
    }
  )
}

// 서버 사이드 헬퍼 함수들
export const supabaseServer = {
  // 현재 사용자 정보 가져오기 (서버 사이드)
  async getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 현재 세션 가져오기 (서버 사이드)
  async getCurrentSession() {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 사용자 인증 확인
  async requireAuth() {
    const { user, error } = await this.getCurrentUser()
    if (error || !user) {
      throw new Error('인증이 필요합니다.')
    }
    return user
  }
}