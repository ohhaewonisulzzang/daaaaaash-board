'use client'

import { useState } from 'react'
import { Modal } from './modal'
import { Button } from './button'
import { X, LogIn, UserPlus } from 'lucide-react'

interface ILoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin?: () => void
  onSignUp?: () => void
  title?: string
  message?: string
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onLogin,
  onSignUp,
  title = "로그인이 필요합니다",
  message = "이 기능을 사용하려면 로그인이 필요합니다."
}: ILoginModalProps) {
  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      window.location.href = '/'
    }
  }

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp()
    } else {
      window.location.href = '/signup'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-white dark:bg-dark-bg-secondary rounded-xl p-6 w-full max-w-md mx-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm">
            {message}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            로그인하기
          </Button>
          
          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            회원가입하기
          </Button>
        </div>

        {/* 게스트 모드 안내 */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 rounded-full bg-amber-400 dark:bg-amber-500 flex-shrink-0 mt-0.5"></div>
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">게스트 모드 제한사항</p>
              <ul className="space-y-1 text-amber-700 dark:text-amber-300">
                <li>• 데이터 백업 및 복원 불가</li>
                <li>• 배경 이미지 업로드 불가</li>
                <li>• 브라우저 종료 시 데이터 삭제</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}