"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './icon'

export interface ITagProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
}

const Tag = React.forwardRef<HTMLDivElement, ITagProps>(
  ({ className, variant = 'default', size = 'md', removable = false, onRemove, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center gap-1 rounded-none font-normal transition-colors duration-fast"
    
    const variants = {
      default: "bg-gray-100 text-primary-text border border-border-light",
      outline: "bg-transparent text-primary-text border border-border-medium",
      filled: "bg-primary-text text-white border border-primary-text"
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
        <span>{children}</span>
        {removable && (
          <button
            onClick={onRemove}
            className="ml-1 hover:text-accent-red transition-colors duration-fast"
            type="button"
          >
            <Icon name="close" size="xs" />
          </button>
        )}
      </div>
    )
  }
)

Tag.displayName = "Tag"

export { Tag }