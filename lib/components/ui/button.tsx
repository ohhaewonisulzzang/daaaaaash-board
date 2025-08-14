"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'glass' | 'destructive' | 'ghost' | 'outline' | 'default'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      primary: "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-accent-blue/50",
      default: "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-accent-blue/50",
      secondary: "bg-glass-light dark:bg-glass-dark text-primary-text dark:text-dark-text border border-glass-border-light dark:border-glass-border-dark backdrop-blur-md hover:bg-glass-border-light dark:hover:bg-glass-border-dark hover:scale-105 focus:ring-accent-blue/50",
      outline: "bg-transparent text-primary-text dark:text-dark-text border border-glass-border-light dark:border-glass-border-dark hover:bg-glass-light dark:hover:bg-glass-dark hover:scale-105 focus:ring-accent-blue/50",
      ghost: "bg-transparent text-primary-text dark:text-dark-text hover:bg-glass-light dark:hover:bg-glass-dark hover:scale-105 focus:ring-accent-blue/50",
      accent: "bg-gradient-to-r from-accent-orange to-accent-red text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-accent-orange/50",
      danger: "bg-gradient-to-r from-accent-red to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-accent-red/50",
      destructive: "bg-gradient-to-r from-accent-red to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-accent-red/50",
      glass: "bg-glass-light dark:bg-glass-dark text-primary-text dark:text-dark-text border border-glass-border-light dark:border-glass-border-dark backdrop-blur-lg shadow-glass hover:bg-glass-border-light dark:hover:bg-glass-border-dark hover:scale-105 focus:ring-white/20"
    }
    
    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    }
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            로딩 중...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }