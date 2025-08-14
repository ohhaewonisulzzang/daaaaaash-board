"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  thickness?: 'thin' | 'medium' | 'thick'
  spacing?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

const Divider = React.forwardRef<HTMLDivElement, IDividerProps>(
  ({ 
    className, 
    orientation = 'horizontal', 
    variant = 'solid',
    thickness = 'thin',
    spacing = 'md',
    children,
    ...props 
  }, ref) => {
    const baseStyles = "border-border-light"
    
    const orientations = {
      horizontal: "w-full border-t",
      vertical: "h-full border-l"
    }
    
    const variants = {
      solid: "border-solid",
      dashed: "border-dashed",
      dotted: "border-dotted"
    }
    
    const thicknesses = {
      thin: "border-t-[1px] border-l-[1px]",
      medium: "border-t-2 border-l-2",
      thick: "border-t-4 border-l-4"
    }
    
    const spacings = {
      sm: orientation === 'horizontal' ? "my-2" : "mx-2",
      md: orientation === 'horizontal' ? "my-4" : "mx-4",
      lg: orientation === 'horizontal' ? "my-6" : "mx-6"
    }

    if (children) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative flex items-center",
            spacings[spacing],
            className
          )}
          {...props}
        >
          <div className={cn(
            "flex-1",
            baseStyles,
            orientations[orientation],
            variants[variant],
            thicknesses[thickness]
          )} />
          <span className="px-4 text-sm text-primary-text-secondary bg-primary-bg">
            {children}
          </span>
          <div className={cn(
            "flex-1",
            baseStyles,
            orientations[orientation],
            variants[variant],
            thicknesses[thickness]
          )} />
        </div>
      )
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          orientations[orientation],
          variants[variant],
          thicknesses[thickness],
          spacings[spacing],
          className
        )}
        {...props}
      />
    )
  }
)

Divider.displayName = "Divider"

export { Divider }