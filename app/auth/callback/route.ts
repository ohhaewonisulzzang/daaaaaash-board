import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fetchUserProfile } from '@/lib/auth/utils'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const supabase = await createClient()
      
      // OAuth 코드를 세션으로 교환
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user && data.session) {
        console.log('소셜 로그인 성공:', data.user.id, data.user.email)
        
        // 프로필 확인 및 생성
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
              console.log('소셜 로그인 프로필 생성 성공:', profileData.id)
            }
          } catch (profileError) {
            console.error('소셜 로그인 프로필 생성 실패:', profileError)
          }
        }
        
        // 성공적으로 로그인한 경우 대시보드로 리다이렉트
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        console.error('OAuth 세션 교환 실패:', error)
      }
    } catch (error) {
      console.error('OAuth 콜백 처리 오류:', error)
    }
  }

  // 오류가 발생한 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
}