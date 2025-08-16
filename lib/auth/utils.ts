import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export interface IAuthValidationError {
  field: string
  message: string
}

export interface IAuthResponse {
  success: boolean
  user?: any
  session?: any
  profile?: any
  message?: string
  needsVerification?: boolean
  error?: string
}

export interface ILoginCredentials {
  email: string
  password: string
}

export interface ISignupCredentials {
  email: string
  password: string
}

export interface IUserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
}

// 입력 검증 함수들
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validateAuthInput(email: string, password: string): IAuthValidationError[] {
  const errors: IAuthValidationError[] = []

  if (!email) {
    errors.push({ field: 'email', message: '이메일을 입력해주세요.' })
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: '유효한 이메일 주소를 입력해주세요.' })
  }

  if (!password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요.' })
  } else if (!validatePassword(password)) {
    errors.push({ field: 'password', message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  }

  return errors
}

// 에러 메시지 매핑 함수
export function mapAuthError(error: any): string {
  if (!error?.message) return '알 수 없는 오류가 발생했습니다.'

  const message = error.message.toLowerCase()

  // 로그인 에러 매핑
  if (message.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }
  if (message.includes('email not confirmed')) {
    return '이메일 인증이 필요합니다.'
  }
  if (message.includes('too many requests')) {
    return '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.'
  }

  // 회원가입 에러 매핑
  if (message.includes('user already registered') || message.includes('already_registered')) {
    return '이미 가입된 이메일입니다.'
  }
  if (message.includes('invalid_email') || message.includes('invalid email')) {
    return '유효하지 않은 이메일 주소입니다.'
  }
  if (message.includes('weak_password') || message.includes('password')) {
    return '비밀번호가 너무 약합니다. 최소 6자 이상 입력해주세요.'
  }

  // 기본 에러 메시지
  return error.message
}

// 사용자 프로필 가져오기
export async function fetchUserProfile(userId: string): Promise<IUserProfile | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.log('Profile fetch failed:', error?.message)
      return null
    }

    return data as IUserProfile
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

// 관리자 권한으로 사용자 생성
export async function createUserWithAdmin(credentials: ISignupCredentials): Promise<{
  user: any
  profile: IUserProfile | null
}> {
  const adminSupabase = createAdminClient()
  const fullName = credentials.email.split('@')[0]

  // 1. 사용자 생성
  const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
    email: credentials.email,
    password: credentials.password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (userError || !userData.user) {
    throw userError || new Error('사용자 생성에 실패했습니다.')
  }

  // 2. 프로필 생성
  let profile: IUserProfile | null = null
  try {
    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: userData.user.email!,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, full_name, created_at, updated_at')
      .single()

    if (!profileError && profileData) {
      profile = profileData as IUserProfile
    }
  } catch (profileError) {
    console.error('Profile creation failed:', profileError)
  }

  return { user: userData.user, profile }
}

// 일반 회원가입 (이메일 인증 필요)
export async function createUserWithEmailVerification(
  credentials: ISignupCredentials,
  redirectUrl: string
): Promise<{ user: any; needsVerification: boolean }> {
  const supabase = await createClient()
  const fullName = credentials.email.split('@')[0]

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { full_name: fullName }
    }
  })

  if (error || !data.user) {
    throw error || new Error('회원가입에 실패했습니다.')
  }

  return {
    user: data.user,
    needsVerification: !data.session
  }
}

// 로그인 처리
export async function authenticateUser(credentials: ILoginCredentials): Promise<{
  user: any
  session: any
  profile: IUserProfile | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  })

  if (error || !data.user || !data.session) {
    throw error || new Error('로그인에 실패했습니다.')
  }

  // 프로필 정보 가져오기
  const profile = await fetchUserProfile(data.user.id)

  return {
    user: data.user,
    session: data.session,
    profile
  }
}

// 소셜 로그인 처리
export async function signInWithProvider(
  provider: 'github' | 'google',
  redirectTo?: string
): Promise<{ url: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/auth/callback`
    }
  })

  if (error) {
    throw new Error(`${provider} 로그인에 실패했습니다: ${error.message}`)
  }

  if (!data.url) {
    throw new Error('OAuth URL을 생성할 수 없습니다.')
  }

  return { url: data.url }
}

// OAuth 콜백 처리
export async function handleOAuthCallback(code: string): Promise<{
  user: any
  session: any
  profile: IUserProfile | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user || !data.session) {
    throw new Error('OAuth 인증에 실패했습니다.')
  }

  // 소셜 로그인 시 프로필 자동 생성 또는 업데이트
  let profile = await fetchUserProfile(data.user.id)
  
  if (!profile) {
    try {
      const adminSupabase = createAdminClient()
      const fullName = data.user.user_metadata?.full_name || 
                      data.user.user_metadata?.name ||
                      data.user.email?.split('@')[0] || 
                      'Unknown User'

      const { data: profileData, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, email, full_name, created_at, updated_at')
        .single()

      if (!profileError && profileData) {
        profile = profileData as IUserProfile
      }
    } catch (profileError) {
      console.error('소셜 로그인 프로필 생성 실패:', profileError)
    }
  }

  return {
    user: data.user,
    session: data.session,
    profile
  }
}

// 응답 포매터
export function createAuthResponse(params: {
  success: boolean
  user?: any
  session?: any
  profile?: IUserProfile | null
  message?: string
  needsVerification?: boolean
  error?: string
  redirectUrl?: string
}): IAuthResponse & { redirectUrl?: string } {
  return {
    success: params.success,
    ...(params.user && {
      user: {
        id: params.user.id,
        email: params.user.email,
        user_metadata: params.user.user_metadata,
        ...(params.profile && { profile: params.profile })
      }
    }),
    ...(params.session && {
      session: {
        access_token: params.session.access_token,
        refresh_token: params.session.refresh_token,
        expires_at: params.session.expires_at
      }
    }),
    ...(params.message && { message: params.message }),
    ...(params.needsVerification !== undefined && { needsVerification: params.needsVerification }),
    ...(params.error && { error: params.error }),
    ...(params.redirectUrl && { redirectUrl: params.redirectUrl })
  }
}