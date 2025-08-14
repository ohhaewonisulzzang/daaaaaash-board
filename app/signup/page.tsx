'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { Card } from '@/lib/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import Link from 'next/link'

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

const EmailIcon = () => (
  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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

const UserPlusIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'verification' | 'success'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [isCodeSending, setIsCodeSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 주소를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      // 인증 코드 전송 요청
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('verification')
        toast({
          title: '인증 코드 전송됨',
          description: '이메일로 인증 코드를 보냈습니다.',
        })
      } else {
        setError(data.error || '인증 코드 전송에 실패했습니다.')
      }
    } catch (err) {
      console.error('Send verification error:', err)
      setError('인증 코드 전송 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      passwordRef.current?.focus()
    }
  }

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      confirmPasswordRef.current?.focus()
    }
  }

  const handleConfirmPasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleCodeVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      // 인증 코드 검증
      const verifyResponse = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        // 인증 성공 후 실제 회원가입 진행
        const signupResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const signupData = await signupResponse.json()

        if (signupData.success) {
          setStep('success')
          toast({
            title: '계정 만들기 성공!',
            description: '이메일 인증이 완료되었습니다.',
          })
          
          // 3초 후 로그인 페이지로 이동
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setError(signupData.error || '회원가입에 실패했습니다.')
        }
      } else {
        setError(verifyData.error || '인증 코드가 올바르지 않습니다.')
      }
    } catch (err) {
      console.error('Code verification error:', err)
      setError('인증 코드 검증 처리 중 오류가 발생했습니다.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsCodeSending(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: '인증 코드 재전송됨',
          description: '새로운 인증 코드를 이메일로 보냈습니다.',
        })
      } else {
        setError(data.error || '인증 코드 재전송에 실패했습니다.')
      }
    } catch (err) {
      console.error('Resend code error:', err)
      setError('인증 코드 재전송 처리 중 오류가 발생했습니다.')
    } finally {
      setIsCodeSending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-all duration-500 p-4">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 md:w-80 md:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full p-8 backdrop-blur-lg bg-white/80 dark:bg-slate-900/90 border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl">
          
          {step === 'form' && (
            <>
              <div className="text-center mb-8">
                <DashboardIcon />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  계정 만들기
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  새 계정을 만들어 대시보드를 사용하세요
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    이메일
                  </label>
                  <div className="relative">
                    <EmailIcon />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleEmailKeyPress}
                      placeholder="your@email.com"
                      className="pl-10 h-12"
                      disabled={isLoading}
                      required
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
                      onKeyPress={handlePasswordKeyPress}
                      placeholder="비밀번호 (6자 이상)"
                      className="pl-10 pr-10 h-12"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <LockIcon />
                    <Input
                      ref={confirmPasswordRef}
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleConfirmPasswordKeyPress}
                      placeholder="비밀번호 확인"
                      className="pl-10 pr-10 h-12"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      계정 만드는 중...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon />
                      계정 만들기
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  이미 계정이 있으신가요?{' '}
                  <Link 
                    href="/login" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    로그인하기
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 'verification' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                이메일 인증 코드 입력
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                <strong>{email}</strong>로 6자리 인증 코드를 보냈습니다.<br />
                이메일을 확인하고 인증 코드를 입력해주세요.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    인증 코드 (6자리)
                  </label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setVerificationCode(value)
                    }}
                    placeholder="123456"
                    className="h-12 text-center text-lg font-mono tracking-widest"
                    disabled={isVerifying}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                {error && (
                  <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleCodeVerification}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <LoadingSpinner />
                      인증 중...
                    </>
                  ) : (
                    '인증 코드 확인'
                  )}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleResendCode}
                    disabled={isCodeSending || isVerifying}
                    className="flex-1 h-12 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg disabled:opacity-50"
                  >
                    {isCodeSending ? (
                      <>
                        <LoadingSpinner />
                        전송 중...
                      </>
                    ) : (
                      '코드 재전송'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/login')}
                    className="flex-1 h-12 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                  >
                    나중에 하기
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">
                계정 만들기 성공! 🎉
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                회원가입이 완료되었습니다.<br />
                잠시 후 로그인 페이지로 이동합니다.
              </p>

              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="text-gray-600 dark:text-gray-300">로그인 페이지로 이동 중...</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}