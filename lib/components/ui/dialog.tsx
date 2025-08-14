"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
}

const Dialog: React.FC<IDialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children, 
  className,
  size = 'md',
  closeOnBackdrop = true
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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full mx-4'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-normal"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* 다이얼로그 */}
      <div className={cn(
        "relative bg-white rounded-none shadow-xl transition-all duration-normal w-full",
        sizes[size],
        className
      )}>
        <div className="p-6">
          {/* 헤더 */}
          {(title || description) && (
            <div className="mb-4">
              {title && (
                <h2 className="text-lg font-medium text-primary-text mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-primary-text-secondary">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* 컨텐츠 */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

const DialogActions: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("flex justify-end gap-3 mt-6", className)}>
      {children}
    </div>
  )
}

export { Dialog, DialogActions }