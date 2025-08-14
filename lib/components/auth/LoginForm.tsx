'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { storage } from '../../utils/storage'
import PasswordResetModal from './PasswordResetModal'
import Link from 'next/link'

interface ILoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>
  isLoading: boolean
}

// SVG 아이콘 컴포넌트들
const DashboardIcon = () => (
  <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#dashGradient)" />
    <rect x="20" y="20" width="25" height="25" rx="4" fill="white" opacity="0.9" />
    <rect x="55" y="20" width="25" height="15" rx="4" fill="white" opacity="0.9" />
    <rect x="55" y="40" width="25" height="15" rx="4" fill="white" opacity="0.9" />
    <rect x="20" y="55" width="60" height="10" rx="4" fill="white" opacity="0.9" />
    <rect x="20" y="70" width="40" height="10" rx="4" fill="white" opacity="0.9" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

const LoginIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
)

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

export default function LoginForm({ onLogin, isLoading }: ILoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'github' | 'google' | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  // 컴포넌트 마운트 시 기억된 정보 불러오기
  useEffect(() => {
    const remembered = storage.getRememberMe()
    const rememberedEmail = storage.getRememberedEmail()
    
    if (remembered && rememberedEmail) {
      setRememberMe(true)
      setEmail(rememberedEmail)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    const success = await onLogin(email, password)
    if (success) {
      // 로그인 성공 시 Remember Me 정보 저장
      if (rememberMe) {
        storage.setRememberMe(true)
        storage.setRememberedEmail(email)
      } else {
        storage.clearRememberMe()
      }
    } else {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
    }
  }

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      passwordRef.current?.focus()
    }
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setSocialLoading(provider)
    setError('')
    
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || `${provider} 로그인에 실패했습니다.`)
      }
    } catch (err) {
      console.error(`${provider} login error:`, err)
      setError(`${provider} 로그인 처리 중 오류가 발생했습니다.`)
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-all duration-500 p-4 flex items-center justify-center">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 md:w-80 md:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <Card className="login-card-neon w-full p-4 sm:p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/90 border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <DashboardIcon />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              계정 정보를 입력하여 로그인하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <div className="relative">
                <UserIcon />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleEmailKeyPress}
                  placeholder="your@email.com"
                  className="pl-10 h-10 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <div className="relative">
                <LockIcon />
                <Input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Remember Me 체크박스와 비밀번호 찾기 링크 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    disabled={isLoading}
                    className="flex items-center justify-center w-4 h-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {rememberMe && <CheckIcon />}
                  </button>
                </div>
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  로그인 정보 기억하기
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                disabled={isLoading}
                onClick={() => setShowResetModal(true)}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:shadow-lg dark:shadow-purple-500/30 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg dark:hover:shadow-purple-500/50 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  로그인 중...
                </>
              ) : (
                <>
                  <LoginIcon />
                  로그인
                </>
              )}
            </Button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
            <span className="px-3 text-xs text-gray-500 dark:text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading || socialLoading !== null}
              className="w-full h-9 sm:h-10 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
            >
              {socialLoading === 'github' ? (
                <>
                  <LoadingSpinner />
                  연결 중...
                </>
              ) : (
                <>
                  <GitHubIcon />
                  GitHub로 계속하기
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading || socialLoading !== null}
              className="w-full h-9 sm:h-10 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 flex items-center justify-center text-sm"
            >
              {socialLoading === 'google' ? (
                <>
                  <LoadingSpinner />
                  연결 중...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Google로 계속하기
                </>
              )}
            </Button>
          </div>

          {/* 회원가입 링크 */}
          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              계정이 없으신가요?{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
              >
                회원가입하기
              </Link>
            </p>
          </div>

        </Card>
      </div>

      {/* 비밀번호 찾기 모달 */}
      <PasswordResetModal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  )
}