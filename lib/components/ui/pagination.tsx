"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './icon'

export interface IPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPrevNext?: boolean
  showFirstLast?: boolean
  maxVisible?: number
  className?: string
}

const Pagination: React.FC<IPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
  showFirstLast = true,
  maxVisible = 5,
  className
}) => {
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2)
      let start = Math.max(1, currentPage - halfVisible)
      let end = Math.min(totalPages, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('...')
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className={cn("flex items-center justify-center space-x-1", className)}>
      {/* First Page */}
      {showFirstLast && currentPage > 1 && (
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <Icon name="arrow" className="w-4 h-4 rotate-180" />
          <Icon name="arrow" className="w-4 h-4 rotate-180 -ml-1" />
        </PaginationButton>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Icon name="arrow" className="w-4 h-4 rotate-180" />
        </PaginationButton>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-primary-text-secondary">...</span>
          ) : (
            <PaginationButton
              onClick={() => onPageChange(page as number)}
              active={page === currentPage}
            >
              {page}
            </PaginationButton>
          )}
        </React.Fragment>
      ))}

      {/* Next Page */}
      {showPrevNext && (
        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Icon name="arrow" className="w-4 h-4" />
        </PaginationButton>
      )}

      {/* Last Page */}
      {showFirstLast && currentPage < totalPages && (
        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <Icon name="arrow" className="w-4 h-4" />
          <Icon name="arrow" className="w-4 h-4 -ml-1" />
        </PaginationButton>
      )}
    </nav>
  )
}

interface IPaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: React.ReactNode
}

const PaginationButton: React.FC<IPaginationButtonProps> = ({
  active = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-none transition-colors duration-fast border",
        active
          ? "bg-primary-text text-white border-primary-text"
          : "bg-white text-primary-text border-border-light hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed hover:bg-white",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export { Pagination }