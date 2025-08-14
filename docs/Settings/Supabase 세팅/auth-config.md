# 인증 설정 가이드

## 개요
PersonalDash 프로젝트의 Supabase 인증 시스템 설정 방법을 설명합니다.

## 인증 방식

### 1. 이메일/비밀번호 인증
- 기본 제공되는 인증 방식
- 이메일 확인 기능 포함
- 비밀번호 재설정 기능

### 2. Google OAuth 인증
- 소셜 로그인 기능
- 원클릭 회원가입/로그인
- Google 계정 정보 자동 연동

### 3. 게스트 모드
- 임시 사용자 세션
- 로컬 스토리지 기반
- 회원 전환 기능

## Supabase Auth 설정

### 1. 기본 인증 설정

#### 1.1 Authentication 설정 접근
1. Supabase 대시보드 → Authentication → Settings
2. 기본 설정 확인 및 수정

#### 1.2 Site URL 설정
```
Development: http://localhost:3000
Production: https://your-domain.com
```

#### 1.3 Redirect URLs 설정
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
https://your-domain.com/auth/callback
https://your-domain.com/dashboard
```

### 2. 이메일 인증 설정

#### 2.1 이메일 템플릿 커스터마이징
1. Authentication → Email Templates
2. 다음 템플릿들을 한국어로 수정:
   - **Confirm signup**: 회원가입 확인
   - **Invite user**: 사용자 초대
   - **Magic Link**: 매직 링크
   - **Reset Password**: 비밀번호 재설정

#### 2.2 회원가입 확인 이메일 템플릿
```html
<h2>PersonalDash에 오신 것을 환영합니다!</h2>
<p>아래 버튼을 클릭하여 이메일 주소를 확인해주세요:</p>
<a href="{{ .ConfirmationURL }}">이메일 확인하기</a>
<p>이 링크는 24시간 후 만료됩니다.</p>
```

#### 2.3 비밀번호 재설정 이메일 템플릿
```html
<h2>비밀번호 재설정</h2>
<p>비밀번호를 재설정하려면 아래 버튼을 클릭해주세요:</p>
<a href="{{ .ConfirmationURL }}">비밀번호 재설정하기</a>
<p>이 링크는 1시간 후 만료됩니다.</p>
```

### 3. Google OAuth 설정

#### 3.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. APIs & Services → Credentials 이동

#### 3.2 OAuth 2.0 클라이언트 생성
1. "Create Credentials" → "OAuth 2.0 Client IDs"
2. Application type: "Web application"
3. Name: "PersonalDash"
4. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
5. Authorized redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

#### 3.3 Supabase에 Google 설정 적용
1. Supabase → Authentication → Providers
2. Google 활성화
3. Client ID와 Client Secret 입력:
   ```
   Client ID: your-google-client-id.apps.googleusercontent.com
   Client Secret: your-google-client-secret
   ```

### 4. 보안 설정

#### 4.1 세션 설정
```
JWT expiry: 3600 (1시간)
Refresh token rotation: enabled
Reuse interval: 10 (10초)
```

#### 4.2 비밀번호 정책
```
최소 길이: 8자
최소 요구사항: 영문자 + 숫자
특수문자 요구: 선택사항
```

#### 4.3 Rate Limiting
```
회원가입: 분당 5회
로그인: 분당 30회
비밀번호 재설정: 시간당 5회
```

## 클라이언트 구현

### 1. 인증 상태 관리

#### 1.1 인증 컨텍스트 생성
```typescript
// lib/hooks/use-auth.ts
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### 1.2 인증 가드 컴포넌트
```typescript
// lib/components/auth-guard.tsx
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/auth/login')
      } else if (!requireAuth && user) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, requireAuth, router])

  if (loading) {
    return <div>로딩 중...</div>
  }

  return <>{children}</>
}
```

### 2. 인증 플로우

#### 2.1 로그인 처리
```typescript
const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // 로그인 성공 시 대시보드로 리다이렉트
  router.push('/dashboard')
}
```

#### 2.2 회원가입 처리
```typescript
const handleSignUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // 이메일 확인 안내
  setMessage('이메일을 확인하여 회원가입을 완료해주세요.')
}
```

#### 2.3 Google 로그인 처리
```typescript
const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}
```

### 3. 인증 콜백 처리

#### 3.1 콜백 페이지 구현
```typescript
// app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // 사용자 프로필 생성 또는 업데이트
          const { user } = session
          
          // users 테이블에 사용자 정보 저장
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata.full_name,
              avatar_url: user.user_metadata.avatar_url,
            })

          if (!error) {
            router.push('/dashboard')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return <div>인증 처리 중...</div>
}
```

## 게스트 모드 구현

### 1. 게스트 세션 관리
```typescript
// lib/utils/guest-session.ts
interface GuestSession {
  id: string
  created_at: string
  dashboards: any[]
}

export const guestSession = {
  create(): GuestSession {
    const session = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      dashboards: [],
    }
    localStorage.setItem('guest_session', JSON.stringify(session))
    return session
  },

  get(): GuestSession | null {
    const stored = localStorage.getItem('guest_session')
    return stored ? JSON.parse(stored) : null
  },

  update(session: GuestSession) {
    localStorage.setItem('guest_session', JSON.stringify(session))
  },

  clear() {
    localStorage.removeItem('guest_session')
  },
}
```

### 2. 게스트 → 회원 전환
```typescript
const convertGuestToUser = async (email: string, password: string) => {
  const guestData = guestSession.get()
  
  // 회원가입
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  // 게스트 데이터를 회원 계정으로 마이그레이션
  if (guestData && data.user) {
    await supabase
      .from('dashboards')
      .insert(
        guestData.dashboards.map(dashboard => ({
          ...dashboard,
          user_id: data.user.id,
        }))
      )
  }

  // 게스트 세션 정리
  guestSession.clear()
}
```

## 보안 체크리스트

### 클라이언트 사이드
- [ ] Service Role Key가 클라이언트에 노출되지 않음
- [ ] 인증 토큰이 안전하게 저장됨 (httpOnly 쿠키)
- [ ] 인증 상태 변경 시 적절한 리다이렉션
- [ ] 보호된 페이지에 인증 가드 적용

### 서버 사이드
- [ ] RLS 정책이 모든 테이블에 적용됨
- [ ] 서버 액션에서 사용자 인증 확인
- [ ] 민감한 데이터 접근 시 권한 검증
- [ ] API 엔드포인트에 인증 미들웨어 적용

### 일반적인 보안
- [ ] HTTPS 사용 (프로덕션)
- [ ] 적절한 CORS 설정
- [ ] Rate Limiting 적용
- [ ] 비밀번호 정책 준수

## 문제 해결

### 일반적인 오류
1. **Invalid login credentials**: 이메일/비밀번호 불일치
2. **Email not confirmed**: 이메일 미확인 상태
3. **Too many requests**: Rate Limit 초과
4. **Invalid redirect URL**: 잘못된 리다이렉트 URL 설정

### 디버깅 방법
```typescript
// 인증 상태 디버깅
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})

// 현재 사용자 확인
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current user:', user)
}
```