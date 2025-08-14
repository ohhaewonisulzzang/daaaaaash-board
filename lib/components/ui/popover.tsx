"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IPopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
  className?: string
}

const Popover: React.FC<IPopoverProps> = ({
  trigger,
  content,
  isOpen: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  className
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, setIsOpen])

  const placementStyles = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={contentRef}
          className={cn(
            "absolute z-50 bg-white border border-border-light rounded-none shadow-lg p-4 transition-all duration-fast",
            placementStyles[placement],
            className
          )}
          style={{ transform: 'translateZ(0)' }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export { Popover }