"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ILabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Label = React.forwardRef<HTMLLabelElement, ILabelProps>(
  ({ className, children, required = false, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }

    return (
      <label
        ref={ref}
        className={cn(
          "font-medium text-primary-text",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-accent-red ml-1">*</span>
        )}
      </label>
    )
  }
)

Label.displayName = "Label"

export { Label }