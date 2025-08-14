"use client"

import React from 'react'

export interface IThemeProviderProps {
  children: React.ReactNode
}

const ThemeProvider: React.FC<IThemeProviderProps> = ({ children }) => {
  React.useEffect(() => {
    // 페이지 로드 시 저장된 테마 적용
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}

export { ThemeProvider }