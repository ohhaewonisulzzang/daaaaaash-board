"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ISelectOption {
  value: string
  label: string
}

export interface ISelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: ISelectOption[]
  placeholder?: string
  onChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, ISelectProps>(
  ({ className, label, error, helperText, options, placeholder, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary-text dark:text-dark-text mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "w-full px-4 py-3 bg-glass-light dark:bg-glass-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl text-primary-text dark:text-dark-text text-base backdrop-blur-md transition-all duration-300 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 focus:shadow-lg hover:scale-[1.01] appearance-none cursor-pointer",
              error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg className="w-4 h-4 text-primary-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-accent-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-primary-text-secondary dark:text-dark-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }