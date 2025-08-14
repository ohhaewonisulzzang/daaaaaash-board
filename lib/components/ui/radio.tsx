"use client"

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface IRadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface IRadioGroupProps {
  name: string
  options: IRadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const RadioGroup: React.FC<IRadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className,
  orientation = 'vertical'
}) => {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-primary-text mb-3">
          {label}
        </label>
      )}
      <div className={cn(
        "flex",
        orientation === 'horizontal' ? "flex-row space-x-6" : "flex-col space-y-3"
      )}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={option.disabled}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-accent-red">{error}</p>
      )}
    </div>
  )
}

export interface IRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  onChange?: () => void
}

const Radio = React.forwardRef<HTMLInputElement, IRadioProps>(
  ({ className, label, onChange, checked, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="radio"
            className={cn(
              "w-4 h-4 border border-border-medium rounded-full bg-white checked:bg-primary-text checked:border-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text transition-colors duration-fast appearance-none cursor-pointer",
              className
            )}
            ref={ref}
            checked={checked}
            onChange={onChange}
            {...props}
          />
          {checked && (
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
          )}
        </div>
        {label && (
          <label className="text-sm text-primary-text cursor-pointer">
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = "Radio"

export { Radio, RadioGroup }