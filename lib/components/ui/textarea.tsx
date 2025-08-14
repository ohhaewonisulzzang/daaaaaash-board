"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, ITextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary-text dark:text-dark-text mb-2">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "w-full px-4 py-3 bg-glass-light dark:bg-glass-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl text-primary-text dark:text-dark-text text-base placeholder-primary-text-muted dark:placeholder-dark-text-muted backdrop-blur-md transition-all duration-300 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 focus:shadow-lg hover:scale-[1.01] resize-vertical min-h-[100px]",
            error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-accent-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-primary-text-secondary dark:text-dark-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }