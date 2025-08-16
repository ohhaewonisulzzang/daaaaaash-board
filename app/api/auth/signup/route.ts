import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호가 필요합니다.' },
        { status: 400 }
      )
    }

    // 관리자 클라이언트를 사용하여 사용자 직접 생성 (개발 환경)
    const adminSupabase = createAdminClient()
    
    try {
      // 1. 관리자 권한으로 사용자 생성
      const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // 이메일 인증 생략
        user_metadata: {
          full_name: email.split('@')[0]
        }
      })
      
      if (userError) {
        throw userError
      }
      
      if (!userData.user) {
        throw new Error('사용자 생성에 실패했습니다.')
      }
      
      console.log('User created successfully:', userData.user.id)
      
      // 2. 프로필 테이블에 직접 삽입
      const { data: profileData, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // 사용자는 생성되었지만 프로필 생성 실패
      } else {
        console.log('Profile created successfully:', profileData)
      }
      
      return NextResponse.json({
        success: true,
        user: userData.user,
        message: '회원가입이 완료되었습니다. 로그인해주세요.',
        needsVerification: false,
      })
      
    } catch (adminError) {
      console.error('Admin signup failed:', adminError)
      
      // 관리자 방법이 실패하면 일반 signup 시도
      const supabase = await createClient()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0],
          }
        }
      })
      
      if (error) {
        console.error('Regular signup also failed:', error)
        throw error
      }
      
      return NextResponse.json({
        success: true,
        user: data.user,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
        needsVerification: !data.session,
      })
    }

  } catch (error) {
    console.error('Server error:', error)
    
    let errorMessage = '회원가입에 실패했습니다.'
    
    if (error instanceof Error) {
      if (error.message.includes('User already registered') || error.message.includes('already_registered')) {
        errorMessage = '이미 가입된 이메일입니다.'
      } else if (error.message.includes('invalid_email') || error.message.includes('Invalid email')) {
        errorMessage = '유효하지 않은 이메일 주소입니다.'
      } else if (error.message.includes('weak_password') || error.message.includes('Password')) {
        errorMessage = '비밀번호가 너무 약합니다. 최소 6자 이상 입력해주세요.'
      } else {
        errorMessage = `회원가입 실패: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}