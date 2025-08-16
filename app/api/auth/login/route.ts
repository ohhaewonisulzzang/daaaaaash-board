import { NextRequest, NextResponse } from 'next/server'
import {
  validateAuthInput,
  authenticateUser,
  mapAuthError,
  createAuthResponse,
  type ILoginCredentials
} from '@/lib/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password }: ILoginCredentials = await request.json()

    // 입력 검증
    const validationErrors = validateAuthInput(email, password)
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(err => err.message).join(' ')
      return NextResponse.json(
        createAuthResponse({ success: false, error: errorMessage }),
        { status: 400 }
      )
    }

    // 로그인 처리
    const { user, session, profile } = await authenticateUser({ email, password })

    return NextResponse.json(
      createAuthResponse({
        success: true,
        user,
        session,
        profile,
        message: '로그인이 완료되었습니다.'
      })
    )

  } catch (error) {
    console.error('Login API error:', error)
    
    const errorMessage = mapAuthError(error)
    const isAuthError = error && typeof error === 'object' && 'message' in error
    const statusCode = isAuthError ? 401 : 500

    return NextResponse.json(
      createAuthResponse({ success: false, error: errorMessage }),
      { status: statusCode }
    )
  }
}