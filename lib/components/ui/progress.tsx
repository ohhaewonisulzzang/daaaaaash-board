"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, IProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = 'md', 
    variant = 'default',
    showLabel = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }

    const variants = {
      default: 'bg-primary-text',
      accent: 'bg-accent-orange',
      success: 'bg-green-500',
      warning: 'bg-accent-yellow',
      danger: 'bg-accent-red'
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-primary-text">
              {label || `진행률`}
            </span>
            <span className="text-sm text-primary-text-secondary">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        
        <div className={cn(
          "w-full bg-gray-200 rounded-none overflow-hidden",
          sizes[size]
        )}>
          <div
            className={cn(
              "h-full rounded-none transition-all duration-normal ease-out",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }