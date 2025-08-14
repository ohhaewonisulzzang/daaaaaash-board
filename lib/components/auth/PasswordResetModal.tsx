'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface IPasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
}

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const EmailIcon = () => (
  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
)

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

export default function PasswordResetModal({ isOpen, onClose }: IPasswordResetModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage('비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해주세요.')
      } else {
        setError(data.error || '비밀번호 재설정 이메일 전송에 실패했습니다.')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('비밀번호 재설정 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setMessage('')
    setIsSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            비밀번호 재설정
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {!isSuccess ? (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                가입할 때 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    이메일
                  </label>
                  <div className="relative">
                    <EmailIcon />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="pl-10 h-12"
                      disabled={isLoading}
                      required
                    />
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

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 h-12 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        전송 중...
                      </>
                    ) : (
                      '재설정 이메일 전송'
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  이메일 전송 완료
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message}
                </p>
                <Button
                  onClick={handleClose}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg"
                >
                  확인
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}