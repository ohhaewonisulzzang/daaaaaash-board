'use server'

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호가 필요합니다.' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup error:', error)
      let errorMessage = '회원가입에 실패했습니다.'
      
      if (error.message.includes('already registered')) {
        errorMessage = '이미 가입된 이메일입니다.'
      } else if (error.message.includes('invalid')) {
        errorMessage = '유효하지 않은 이메일 주소입니다.'
      } else if (error.message.includes('weak_password')) {
        errorMessage = '비밀번호가 너무 약합니다.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      needsVerification: !data.user?.email_confirmed_at,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}