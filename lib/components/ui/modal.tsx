"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal: React.FC<IModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = 'md'
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div 
        className="fixed inset-0 modal-overlay"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className={cn(
        "relative rounded-2xl transition-all duration-300 w-full mx-4 animate-fade-in",
        title === "새 위젯 추가" 
          ? "bg-white dark:bg-white border border-gray-200 shadow-xl" 
          : "glass-effect dark:dark-modal",
        sizes[size],
        className
      )}>
        {/* 헤더 */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={cn(
              "text-xl font-semibold",
              title === "새 위젯 추가" 
                ? "text-gray-900" 
                : "text-gray-900 dark:text-white"
            )}>{title}</h2>
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 transition-all duration-200 hover:scale-110 p-1 rounded-lg",
                title === "새 위젯 추가"
                  ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* 컨텐츠 */}
        <div className={cn(
          "px-6 py-4",
          title === "새 위젯 추가" && "widget-modal-content"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { Modal }