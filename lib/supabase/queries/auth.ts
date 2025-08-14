import { createClient as createBrowserClient } from '../client'
import { createClient as createServerClient } from '../server'
import type { Database } from '../types'

// 인증 관련 쿼리 함수들

// 사용자 프로필 조회 (서버 사이드)
export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(`사용자 프로필 조회 실패: ${error.message}`)
  }
  
  return data.user
}

// 사용자 메타데이터 업데이트 (클라이언트 사이드)
export async function updateUserMetadata(updates: { 
  full_name?: string
  avatar_url?: string
  [key: string]: any 
}) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })

  if (error) {
    throw new Error(`사용자 정보 업데이트 실패: ${error.message}`)
  }
  
  return data
}

// 비밀번호 변경
export async function updateUserPassword(newPassword: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw new Error(`비밀번호 변경 실패: ${error.message}`)
  }
  
  return data
}

// 이메일 변경
export async function updateUserEmail(newEmail: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (error) {
    throw new Error(`이메일 변경 실패: ${error.message}`)
  }
  
  return data
}

// 비밀번호 재설정 이메일 발송
export async function sendPasswordResetEmail(email: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw new Error(`비밀번호 재설정 이메일 발송 실패: ${error.message}`)
  }
  
  return data
}

// 이메일 확인 재발송
export async function resendEmailConfirmation() {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: '', // 현재 사용자의 이메일이 자동으로 사용됨
  })

  if (error) {
    throw new Error(`이메일 확인 재발송 실패: ${error.message}`)
  }
  
  return data
}