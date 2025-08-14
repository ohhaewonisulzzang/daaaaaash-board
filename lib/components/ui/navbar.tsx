"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface INavbarProps {
  className?: string
  children?: React.ReactNode
}

const Navbar: React.FC<INavbarProps> = ({ className, children }) => {
  return (
    <header className={cn(
      "h-16 bg-glass-light dark:bg-glass-dark border-b border-glass-border-light dark:border-glass-border-dark backdrop-blur-lg relative z-10 px-10 flex items-center justify-between",
      className
    )}>
      {children}
    </header>
  )
}

const NavbarBrand: React.FC<{ children: React.ReactNode; href?: string }> = ({ 
  children, 
  href = "/" 
}) => {
  return (
    <Link 
      href={href}
      className="text-xl font-semibold text-primary-text dark:text-dark-text hover:text-primary-text-secondary dark:hover:text-dark-text-secondary transition-colors duration-300"
    >
      {children}
    </Link>
  )
}

const NavbarNav: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <nav className={cn("flex items-center space-x-8", className)}>
      {children}
    </nav>
  )
}

const NavbarItem: React.FC<{ 
  children: React.ReactNode; 
  href: string; 
  isActive?: boolean 
}> = ({ children, href, isActive = false }) => {
  return (
    <Link 
      href={href}
      className={cn(
        "text-sm font-medium transition-colors duration-300",
        isActive 
          ? "text-primary-text dark:text-dark-text" 
          : "text-primary-text-secondary dark:text-dark-text-secondary hover:text-primary-text dark:hover:text-dark-text"
      )}
    >
      {children}
    </Link>
  )
}

export { Navbar, NavbarBrand, NavbarNav, NavbarItem }