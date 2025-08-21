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
      <div className="relative glass-effect dark:dark-modal rounded-xl p-8 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            size="lg"
          >
            <LogIn className="w-5 h-5 mr-3" />
            로그인하기
          </Button>
          
          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <UserPlus className="w-5 h-5 mr-3" />
            회원가입하기
          </Button>
        </div>

        {/* 게스트 모드 안내 */}
        <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 flex-shrink-0 mt-0.5 shadow-sm"></div>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-2 text-amber-900 dark:text-amber-100">게스트 모드 제한사항</p>
              <ul className="space-y-1.5 text-amber-700 dark:text-amber-300">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mr-2"></span>
                  데이터 백업 및 복원 불가
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mr-2"></span>
                  배경 이미지 업로드 불가
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mr-2"></span>
                  브라우저 종료 시 데이터 삭제
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}