'use client'

import { useState, useCallback } from 'react'

export interface IToast {
  id: string
  variant?: 'default' | 'destructive' | 'success'
  title?: string
  description?: string
  duration?: number
}

export interface IToastOptions {
  variant?: 'default' | 'destructive' | 'success'
  title?: string
  description?: string
  duration?: number
}

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<IToast[]>([])

  const addToast = useCallback((options: IToastOptions) => {
    const id = (++toastCount).toString()
    const toast: IToast = {
      id,
      variant: options.variant || 'default',
      title: options.title,
      description: options.description,
      duration: options.duration || 5000,
    }

    setToasts((prevToasts) => [...prevToasts, toast])

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, toast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((options: IToastOptions) => {
    return addToast(options)
  }, [addToast])

  return {
    toast,
    toasts,
    removeToast,
  }
}