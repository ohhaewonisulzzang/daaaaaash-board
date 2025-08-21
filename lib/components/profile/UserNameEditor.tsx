'use client'

import { useState } from 'react'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { useToast } from '@/lib/hooks/use-toast'
import { Edit, Save, X, User } from 'lucide-react'

interface IUserNameEditorProps {
  currentName: string
  onNameUpdate: (newName: string) => void
  isGuestMode?: boolean
}

export default function UserNameEditor({ currentName, onNameUpdate, isGuestMode = false }: IUserNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(currentName || '')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!newName.trim()) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '사용자명을 입력해주세요.'
      })
      return
    }

    if (newName.trim() === currentName) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)

    try {
      if (isGuestMode) {
        // 게스트 모드: localStorage에 저장
        localStorage.setItem('guest_username', newName.trim())
        onNameUpdate(newName.trim())
        setIsEditing(false)
        toast({
          title: '성공',
          description: '사용자명이 변경되었습니다. (게스트 모드)'
        })
      } else {
        // 일반 모드: API 호출
        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ full_name: newName.trim() }),
        })

        const data = await response.json()

        if (data.success) {
          onNameUpdate(newName.trim())
          setIsEditing(false)
          toast({
            title: '성공',
            description: '사용자명이 변경되었습니다.'
          })
        } else {
          toast({
            variant: 'destructive',
            title: '오류',
            description: data.error || '사용자명 변경에 실패했습니다.'
          })
        }
      }
    } catch (error) {
      console.error('Username update error:', error)
      toast({
        variant: 'destructive',
        title: '오류',
        description: '서버 오류가 발생했습니다.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setNewName(currentName || '')
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 flex-1">
          <User className="w-4 h-4 text-gray-500" />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="사용자명을 입력하세요"
            className="flex-1 text-sm"
            disabled={isLoading}
            maxLength={50}
            autoFocus
          />
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <Save className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 group">
      <div className="flex items-center space-x-2 flex-1">
        <span className="text-sm font-medium">
          안녕하세요, <span className="text-blue-600 dark:text-blue-400">{currentName || '사용자'}</span>님
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="w-3 h-3" />
      </Button>
    </div>
  )
}