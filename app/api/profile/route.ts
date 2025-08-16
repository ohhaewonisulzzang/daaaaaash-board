import { NextRequest, NextResponse } from 'next/server'
import { 
  updateUserProfile, 
  fetchUserProfile,
  createAuthResponse 
} from '@/lib/auth/utils'
import { supabaseServer } from '@/lib/supabase/server'

// 프로필 조회
export async function GET() {
  try {
    const { user, error: authError } = await supabaseServer.getCurrentUser()
    
    if (authError || !user) {
      return NextResponse.json(
        createAuthResponse({ success: false, error: '인증이 필요합니다.' }),
        { status: 401 }
      )
    }

    const profile = await fetchUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json(
        createAuthResponse({ success: false, error: '프로필을 찾을 수 없습니다.' }),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createAuthResponse({ 
        success: true, 
        user: { ...user, profile } 
      })
    )

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      createAuthResponse({ success: false, error: '서버 오류가 발생했습니다.' }),
      { status: 500 }
    )
  }
}

// 프로필 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await supabaseServer.getCurrentUser()
    
    if (authError || !user) {
      return NextResponse.json(
        createAuthResponse({ success: false, error: '인증이 필요합니다.' }),
        { status: 401 }
      )
    }

    const { full_name } = await request.json()

    // 입력 검증
    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json(
        createAuthResponse({ success: false, error: '사용자명을 입력해주세요.' }),
        { status: 400 }
      )
    }

    if (full_name.trim().length < 2) {
      return NextResponse.json(
        createAuthResponse({ success: false, error: '사용자명은 최소 2자 이상이어야 합니다.' }),
        { status: 400 }
      )
    }

    if (full_name.trim().length > 50) {
      return NextResponse.json(
        createAuthResponse({ success: false, error: '사용자명은 최대 50자까지 가능합니다.' }),
        { status: 400 }
      )
    }

    // 프로필 업데이트
    const updatedProfile = await updateUserProfile(user.id, { 
      full_name: full_name.trim() 
    })

    return NextResponse.json(
      createAuthResponse({
        success: true,
        user: { ...user, profile: updatedProfile },
        message: '사용자명이 성공적으로 변경되었습니다.'
      })
    )

  } catch (error) {
    console.error('Profile PATCH error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '프로필 업데이트에 실패했습니다.'
    
    return NextResponse.json(
      createAuthResponse({ success: false, error: errorMessage }),
      { status: 500 }
    )
  }
}