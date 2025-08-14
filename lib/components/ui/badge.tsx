"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = React.forwardRef<HTMLDivElement, IBadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 backdrop-blur-md"
    
    const variants = {
      default: "bg-glass-light dark:bg-glass-dark text-primary-text dark:text-dark-text border border-glass-border-light dark:border-glass-border-dark",
      primary: "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg",
      secondary: "bg-glass-light dark:bg-glass-dark text-primary-text-secondary dark:text-dark-text-secondary border border-glass-border-light dark:border-glass-border-dark",
      accent: "bg-gradient-to-r from-accent-orange to-accent-red text-white shadow-lg",
      success: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg",
      warning: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg",
      danger: "bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg"
    }
    
    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-2 text-base"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = "Badge"

export { Badge }