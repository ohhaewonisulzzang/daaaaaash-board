"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  onChange?: (checked: boolean) => void
}

const Toggle = React.forwardRef<HTMLInputElement, IToggleProps>(
  ({ className, label, description, onChange, checked = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium text-primary-text">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-primary-text-secondary mt-1">{description}</p>
          )}
        </div>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-primary-text focus:ring-offset-2",
              checked ? "bg-primary-text" : "bg-gray-400",
              className
            )}
            onClick={() => onChange?.(!checked)}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-normal",
                checked ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle }