"use client"

import React from 'react'
import NextLink from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface ILinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  underline?: 'none' | 'hover' | 'always'
  external?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, ILinkProps>(
  ({ className, href, children, variant = 'default', underline = 'hover', external = false, ...props }, ref) => {
    const baseStyles = "transition-colors duration-fast"
    
    const variants = {
      default: "text-primary-text hover:text-primary-text-secondary",
      primary: "text-primary-text hover:text-gray-600",
      secondary: "text-primary-text-secondary hover:text-primary-text",
      accent: "text-accent-orange hover:text-accent-red"
    }
    
    const underlineStyles = {
      none: "no-underline",
      hover: "no-underline hover:underline",
      always: "underline"
    }

    const linkClasses = cn(
      baseStyles,
      variants[variant],
      underlineStyles[underline],
      className
    )

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={linkClasses}
        {...props}
      >
        {children}
      </NextLink>
    )
  }
)

Link.displayName = "Link"

export { Link }