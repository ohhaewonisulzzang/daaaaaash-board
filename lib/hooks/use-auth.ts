'use client'

import { useState, useEffect, createContext, useContext } from 'react'

// 테스트용 사용자 정보 인터페이스
interface ITestUser {
  id: string
  email: string
  name: string
}

interface IAuthContext {
  user: ITestUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

// 테스트 계정 정보
const TEST_CREDENTIALS = {
  email: 'admin',
  password: 'q1w2e3r4'
}

const TEST_USER: ITestUser = {
  id: 'test-user-1',
  email: 'admin',
  name: '관리자'
}

// AuthContext 생성
const AuthContext = createContext<IAuthContext | undefined>(undefined)

// useAuth 훅
export function useAuth() {
  const [user, setUser] = useState<ITestUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 페이지 로드 시 저장된 인증 상태 확인
    const savedUser = localStorage.getItem('test-user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // 간단한 딜레이로 실제 로그인 과정을 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 테스트 계정 확인
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      setUser(TEST_USER)
      setIsAuthenticated(true)
      localStorage.setItem('test-user', JSON.stringify(TEST_USER))
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('test-user')
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated
  }
}