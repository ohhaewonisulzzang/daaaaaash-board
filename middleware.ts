import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: any) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // 임시로 미들웨어 비활성화 - 테스트 목적
    '/auth/(.*)'
  ],
}