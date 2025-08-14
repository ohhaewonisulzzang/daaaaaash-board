"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ISkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, ISkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular', 
    width, 
    height, 
    animation = 'pulse',
    ...props 
  }, ref) => {
    const baseStyles = "bg-gray-200"
    
    const variants = {
      text: "rounded-none h-4",
      circular: "rounded-full",
      rectangular: "rounded-none"
    }
    
    const animations = {
      pulse: "animate-pulse",
      wave: "animate-wave",
      none: ""
    }

    const style: React.CSSProperties = {}
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (height) style.height = typeof height === 'number' ? `${height}px` : height

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          animations[animation],
          className
        )}
        style={style}
        {...props}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

// Preset skeleton components
const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  )
}

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      <Skeleton variant="rectangular" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  )
}

const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizes[size], className)}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar }