import { NextRequest, NextResponse } from 'next/server'
import {
  signInWithProvider,
  mapAuthError,
  createAuthResponse
} from '@/lib/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // 지원하는 프로바이더 검증
    if (!provider || !['github', 'google'].includes(provider)) {
      return NextResponse.json(
        createAuthResponse({ 
          success: false, 
          error: '지원하지 않는 소셜 로그인 제공자입니다.' 
        }),
        { status: 400 }
      )
    }

    // 소셜 로그인 URL 생성
    const { url } = await signInWithProvider(provider as 'github' | 'google')

    return NextResponse.json(
      createAuthResponse({
        success: true,
        message: `${provider} 로그인 페이지로 이동합니다.`,
        redirectUrl: url
      })
    )

  } catch (error) {
    console.error('소셜 로그인 API 오류:', error)
    
    const errorMessage = mapAuthError(error)
    
    return NextResponse.json(
      createAuthResponse({ success: false, error: errorMessage }),
      { status: 500 }
    )
  }
}