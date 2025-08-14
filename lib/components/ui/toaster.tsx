"use client"

import React from 'react'
import { Toast, IToastProps } from './toast'

export interface IToasterContextValue {
  showToast: (toast: Omit<IToastProps, 'id' | 'onClose'>) => void
  hideToast: (id: string) => void
}

const ToasterContext = React.createContext<IToasterContextValue | null>(null)

export const useToaster = () => {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider')
  }
  return context
}

export interface IToasterProviderProps {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}

export const ToasterProvider: React.FC<IToasterProviderProps> = ({ 
  children, 
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = React.useState<(IToastProps & { id: string })[]>([])

  const showToast = React.useCallback((toast: Omit<IToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id, onClose: hideToast }
    
    setToasts(prev => {
      const updated = [newToast, ...prev]
      return updated.slice(0, maxToasts)
    })
  }, [maxToasts])

  const hideToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <ToasterContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className={`fixed z-50 ${positionStyles[position]}`}>
        <div className="flex flex-col gap-2 max-w-sm w-full">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      </div>
    </ToasterContext.Provider>
  )
}

// Convenience hooks
export const useToast = () => {
  const { showToast } = useToaster()
  
  return {
    success: (message: string, title?: string) => 
      showToast({ type: 'success', message, title }),
    error: (message: string, title?: string) => 
      showToast({ type: 'error', message, title }),
    warning: (message: string, title?: string) => 
      showToast({ type: 'warning', message, title }),
    info: (message: string, title?: string) => 
      showToast({ type: 'info', message, title }),
  }
}