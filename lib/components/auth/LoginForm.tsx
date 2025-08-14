'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'

interface ILoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>
  isLoading: boolean
}

export default function LoginForm({ onLogin, isLoading }: ILoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    const success = await onLogin(email, password)
    if (!success) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-gray-50 to-blue-50 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-indigo-900 transition-all duration-500">
      <Card className="w-full max-w-md p-8 backdrop-blur-md bg-white/10 border-white/20 dark:bg-black/10 dark:border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-normal text-primary-text dark:text-dark-text mb-2">
            대시보드 로그인
          </h1>
          <p className="text-primary-text-secondary dark:text-dark-text-secondary">
            계정 정보를 입력하여 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-text dark:text-dark-text mb-2">
              아이디
            </label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary-text dark:text-dark-text mb-2">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="q1w2e3r4"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="glass"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
            테스트 계정
          </h3>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
            아이디: admin<br />
            비밀번호: q1w2e3r4
          </p>
        </div>
      </Card>
    </div>
  )
}