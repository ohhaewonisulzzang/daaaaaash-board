"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ICheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  onChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, ICheckboxProps>(
  ({ className, label, error, onChange, checked, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <div className="flex items-start space-x-3">
        <div className="relative">
          <input
            type="checkbox"
            className={cn(
              "w-4 h-4 border border-border-medium rounded-none bg-white checked:bg-primary-text checked:border-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text transition-colors duration-fast appearance-none cursor-pointer",
              error && "border-accent-red",
              className
            )}
            ref={ref}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          {checked && (
            <svg
              className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        {label && (
          <div className="flex-1">
            <label className="text-sm text-primary-text cursor-pointer">
              {label}
            </label>
            {error && (
              <p className="mt-1 text-sm text-accent-red">{error}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }