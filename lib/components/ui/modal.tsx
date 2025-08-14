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
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className={cn(
        "relative bg-glass-light dark:bg-glass-dark border border-glass-border-light dark:border-glass-border-dark backdrop-blur-xl shadow-glass rounded-2xl transition-all duration-300 w-full mx-4 animate-fade-in",
        sizes[size],
        className
      )}>
        {/* 헤더 */}
        {title && (
          <div className="px-6 py-4 border-b border-glass-border-light dark:border-glass-border-dark">
            <h2 className="text-xl font-semibold text-primary-text dark:text-dark-text">{title}</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-primary-text-secondary dark:text-dark-text-secondary hover:text-primary-text dark:hover:text-dark-text transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* 컨텐츠 */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export { Modal }