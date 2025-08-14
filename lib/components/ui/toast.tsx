"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './icon'

export interface IToastProps {
  id: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<IToastProps> = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  onClose 
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: 'check'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: 'close'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: 'warning'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: 'info'
    }
  }

  const currentStyle = typeStyles[type] || typeStyles.info

  return (
    <div className={cn(
      "relative flex items-start gap-3 p-4 border rounded-none shadow-md transition-all duration-normal",
      currentStyle.bg,
      currentStyle.text
    )}>
      <div className="flex-shrink-0">
        <Icon name={currentStyle.icon} size="sm" />
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        <p className="text-sm">{message}</p>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-2 text-current hover:opacity-70 transition-opacity duration-fast"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  )
}

export { Toast }