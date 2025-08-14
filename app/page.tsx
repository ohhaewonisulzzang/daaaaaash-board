'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle, ThemeProvider, Spinner } from '@/lib/components/ui'
import { LoginForm } from '@/lib/components/auth'
import { useAuth } from '@/lib/hooks'

export default function HomePage() {
  const { user, isLoading, login, isAuthenticated } = useAuth()
  const router = useRouter()
  const hasRedirectedRef = useRef(false)

  // 로그인된 사용자는 대시보드로 리다이렉트 - 로딩 완료 후에만 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <ThemeProvider>
      {/* 테마 토글 버튼 */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {isLoading ? (
        // 로딩 중일 때
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-gray-50 to-blue-50 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-indigo-900 transition-all duration-500">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-primary-text-secondary dark:text-dark-text-secondary">
              로딩 중...
            </p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        // 로그인되지 않았을 때 로그인 폼 표시
        <LoginForm onLogin={login} isLoading={isLoading} />
      ) : null}
    </ThemeProvider>
  )
}