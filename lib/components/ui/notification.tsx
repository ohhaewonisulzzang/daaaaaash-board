"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './icon'

export interface INotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  closable?: boolean
  onClose?: () => void
  icon?: boolean
}

const Notification = React.forwardRef<HTMLDivElement, INotificationProps>(
  ({ 
    className, 
    type = 'info', 
    title, 
    message, 
    closable = true, 
    onClose,
    icon = true,
    ...props 
  }, ref) => {
    const typeConfig = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        iconName: 'check',
        iconColor: 'text-green-500'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        iconName: 'close',
        iconColor: 'text-red-500'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        iconName: 'settings',
        iconColor: 'text-yellow-500'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconName: 'settings',
        iconColor: 'text-blue-500'
      }
    }

    const config = typeConfig[type]

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex gap-3 p-4 border rounded-none",
          config.bg,
          config.border,
          config.text,
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0">
            <Icon name={config.iconName} size="sm" className={config.iconColor} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        
        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current hover:opacity-70 transition-opacity duration-fast"
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>
    )
  }
)

Notification.displayName = "Notification"

export { Notification }