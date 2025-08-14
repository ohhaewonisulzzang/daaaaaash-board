import { createClient as createServerClient } from '../server'
import type { Database } from '../types'

// 사용자 관련 데이터베이스 쿼리 함수들

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

// 사용자 생성 (회원가입 후 추가 정보 저장)
export async function createUserProfile(userData: {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`사용자 프로필 생성 실패: ${error.message}`)
  }
  
  return data
}

// 사용자 프로필 조회
export async function getUserProfileById(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`사용자 프로필 조회 실패: ${error.message}`)
  }
  
  return data
}

// 사용자 프로필 업데이트
export async function updateUserProfile(userId: string, updates: UserUpdate) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`사용자 프로필 업데이트 실패: ${error.message}`)
  }
  
  return data
}

// 사용자 프로필 삭제
export async function deleteUserProfile(userId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) {
    throw new Error(`사용자 프로필 삭제 실패: ${error.message}`)
  }
  
  return { success: true }
}