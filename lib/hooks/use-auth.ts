'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { guestStorage } from '@/lib/utils/guestStorage'

interface IAuthContext {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isGuestMode: boolean
  enterGuestMode: () => void
  exitGuestMode: () => Promise<void>
}

export function useAuth(): IAuthContext {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    // 게스트 모드 확인
    const guestMode = guestStorage.isGuestMode()
    setIsGuestMode(guestMode)

    if (guestMode) {
      // 게스트 모드일 때는 로딩 완료 처리
      setIsLoading(false)
      return
    }

    // 현재 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        return false
      }

      return !!data.user
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const enterGuestMode = (): void => {
    guestStorage.enableGuestMode()
    setIsGuestMode(true)
    setUser(null)
    
    // 기본 게스트 데이터 생성
    if (!guestStorage.loadData()) {
      guestStorage.saveData(guestStorage.createDefaultData())
    }
  }

  const exitGuestMode = async (): Promise<void> => {
    guestStorage.disableGuestMode()
    setIsGuestMode(false)
    
    // 일반 인증 모드로 전환 후 세션 재확인
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user || isGuestMode,
    isGuestMode,
    enterGuestMode,
    exitGuestMode
  }
}