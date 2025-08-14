"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ISpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  axis?: 'x' | 'y' | 'both'
}

const Spacer = React.forwardRef<HTMLDivElement, ISpacerProps>(
  ({ className, size = 'md', axis = 'y', ...props }, ref) => {
    const sizes = {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px'
    }
    
    const axisStyles = {
      x: { width: sizes[size], height: '1px' },
      y: { width: '1px', height: sizes[size] },
      both: { width: sizes[size], height: sizes[size] }
    }
    
    return (
      <div
        ref={ref}
        className={cn("flex-shrink-0", className)}
        style={axisStyles[axis]}
        {...props}
      />
    )
  }
)

Spacer.displayName = "Spacer"

export { Spacer }