'use server'

import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/verification-store'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: '이메일과 인증 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    const result = verifyCode(email, code)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('인증 코드 검증 오류:', error)
    return NextResponse.json(
      { error: '인증 코드 검증에 실패했습니다.' },
      { status: 500 }
    )
  }
}