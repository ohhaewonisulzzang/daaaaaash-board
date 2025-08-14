"use client"

import React from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils/cn'

export interface IImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
}

const Image: React.FC<IImageProps> = ({ 
  src, 
  alt, 
  className,
  objectFit = 'cover',
  loading = 'lazy',
  quality = 75,
  ...props 
}) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <NextImage
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-normal",
          objectFit === 'contain' && "object-contain",
          objectFit === 'cover' && "object-cover",
          objectFit === 'fill' && "object-fill",
          objectFit === 'none' && "object-none",
          objectFit === 'scale-down' && "object-scale-down"
        )}
        loading={loading}
        quality={quality}
        {...props}
      />
    </div>
  )
}

export { Image }