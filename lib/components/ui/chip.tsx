"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './icon'

export interface IChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  deletable?: boolean
  onDelete?: () => void
  onClick?: () => void
  icon?: string
}

const Chip = React.forwardRef<HTMLDivElement, IChipProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    selected = false,
    deletable = false,
    onDelete,
    onClick,
    icon,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center gap-2 rounded-full font-normal transition-all duration-fast cursor-pointer"
    
    const variants = {
      default: selected 
        ? "bg-primary-text text-white" 
        : "bg-gray-100 text-primary-text hover:bg-gray-200",
      primary: selected
        ? "bg-primary-text text-white"
        : "bg-primary-bg text-primary-text hover:bg-gray-100",
      accent: selected
        ? "bg-accent-orange text-white"
        : "bg-accent-yellow text-primary-text hover:bg-accent-orange hover:text-white"
    }
    
    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
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
        onClick={onClick}
        {...props}
      >
        {icon && <Icon name={icon} size="xs" />}
        <span>{children}</span>
        {deletable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
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

Chip.displayName = "Chip"

export { Chip }