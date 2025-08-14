// 로컬 스토리지 유틸리티 함수들

const REMEMBER_ME_KEY = 'dash_remember_me'
const REMEMBERED_EMAIL_KEY = 'dash_remembered_email'

export const storage = {
  // Remember Me 상태 저장/불러오기
  setRememberMe: (remember: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REMEMBER_ME_KEY, remember.toString())
    }
  },

  getRememberMe: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
    }
    return false
  },

  // 기억된 이메일 저장/불러오기
  setRememberedEmail: (email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
    }
  },

  getRememberedEmail: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''
    }
    return ''
  },

  // Remember Me 데이터 삭제
  clearRememberMe: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(REMEMBER_ME_KEY)
      localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }
  }
}