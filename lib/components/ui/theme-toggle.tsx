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
      className="transition-all duration-200"
    >
      {getIcon()}
      <span className="sr-only">테마 토글</span>
    </Button>
  )
}