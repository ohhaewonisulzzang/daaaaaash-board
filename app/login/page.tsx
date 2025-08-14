'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/lib/components/auth/LoginForm'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.replace('/dashboard')
      }
    }
    
    checkUser()
  }, [router])

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: '로그인 실패',
          description: error.message === 'Invalid login credentials' 
            ? '아이디 또는 비밀번호가 올바르지 않습니다.'
            : error.message,
        })
        return false
      }

      if (data.user) {
        toast({
          title: '로그인 성공',
          description: '대시보드로 이동합니다.',
        })
        
        router.push('/dashboard')
        return true
      }

      return false
    } catch (err) {
      console.error('Login error:', err)
      toast({
        variant: 'destructive',
        title: '로그인 오류',
        description: '로그인 처리 중 오류가 발생했습니다.',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />
}