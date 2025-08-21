'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '@/lib/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-[1.2rem] w-[1.2rem]" />
    }
    return resolvedTheme === 'dark' 
      ? <Moon className="h-[1.2rem] w-[1.2rem]" />
      : <Sun className="h-[1.2rem] w-[1.2rem]" />
  }

  const getTooltip = () => {
    switch (theme) {
      case 'light': return '라이트 모드'
      case 'dark': return '다크 모드'
      case 'system': return '시스템 설정'
      default: return '테마 전환'
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      title={getTooltip()}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-300 hover:scale-110"
    >
      <div className="relative">
        {theme === 'system' ? (
          <Monitor className="h-5 w-5" />
        ) : resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5 text-blue-400" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
        {/* 글로우 효과 */}
        {resolvedTheme === 'dark' && (
          <div className="absolute inset-0 h-5 w-5 rounded-full bg-blue-400/20 blur-sm" />
        )}
        {resolvedTheme === 'light' && (
          <div className="absolute inset-0 h-5 w-5 rounded-full bg-amber-500/20 blur-sm" />
        )}
      </div>
      <span className="sr-only">테마 토글</span>
    </Button>
  )
}