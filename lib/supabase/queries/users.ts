import { createClient as createServerClient } from '../server'
import type { Database } from '../types'
import { User } from '@supabase/supabase-js'

// 사용자 관련 헬퍼 함수들 (Supabase Auth 사용)

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('사용자 정보 조회 실패:', error)
    return null
  }
  
  return user
}

// 사용자 세션 가져오기
export async function getCurrentSession() {
  const supabase = await createServerClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('세션 조회 실패:', error)
    return null
  }
  
  return session
}

// 사용자 인증 필수 확인
export async function requireAuthUser(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('인증이 필요합니다.')
  }
  
  return user
}