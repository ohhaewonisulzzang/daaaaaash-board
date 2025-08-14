import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트 생성 함수
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 싱글톤 클라이언트 인스턴스
export const supabase = createClient()

// 클라이언트 사이드에서 사용하는 헬퍼 함수들
export const supabaseClient = {
  // 현재 사용자 세션 가져오기
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 인증 상태 변경 리스너
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // 로그아웃
  async signOut() {
    return await supabase.auth.signOut()
  },

  // 이메일/비밀번호 로그인
  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  // 이메일/비밀번호 회원가입
  async signUpWithPassword(email: string, password: string, options?: { data?: any }) {
    return await supabase.auth.signUp({ email, password, options })
  },

  // Google 소셜 로그인
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
}