import { NextRequest, NextResponse } from 'next/server'
import {
  validateAuthInput,
  createUserWithAdmin,
  createUserWithEmailVerification,
  mapAuthError,
  createAuthResponse,
  type ISignupCredentials
} from '@/lib/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password }: ISignupCredentials = await request.json()

    // 입력 검증
    const validationErrors = validateAuthInput(email, password)
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(err => err.message).join(' ')
      return NextResponse.json(
        createAuthResponse({ success: false, error: errorMessage }),
        { status: 400 }
      )
    }

    try {
      // 1차 시도: 관리자 권한으로 사용자 직접 생성 (개발 환경)
      const { user, profile } = await createUserWithAdmin({ email, password })
      
      console.log('Admin signup successful:', user.id)
      
      return NextResponse.json(
        createAuthResponse({
          success: true,
          user,
          profile,
          message: '회원가입이 완료되었습니다. 로그인해주세요.',
          needsVerification: false
        })
      )

    } catch (adminError) {
      console.log('Admin signup failed, trying regular signup:', adminError)

      // 2차 시도: 일반 회원가입 (이메일 인증 필요)
      const redirectUrl = `${request.nextUrl.origin}/auth/callback`
      const { user, needsVerification } = await createUserWithEmailVerification(
        { email, password },
        redirectUrl
      )

      const message = needsVerification 
        ? '회원가입이 완료되었습니다. 이메일을 확인해주세요.'
        : '회원가입이 완료되었습니다. 로그인해주세요.'

      return NextResponse.json(
        createAuthResponse({
          success: true,
          user,
          message,
          needsVerification
        })
      )
    }

  } catch (error) {
    console.error('Signup API error:', error)
    
    const errorMessage = mapAuthError(error)
    
    return NextResponse.json(
      createAuthResponse({ success: false, error: errorMessage }),
      { status: 400 }
    )
  }
}