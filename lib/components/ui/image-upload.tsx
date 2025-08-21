'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface IImageUploadProps {
  onUpload: (imageUrl: string) => void
  currentImage?: string
  onRemove?: () => void
  className?: string
  isGuestMode?: boolean
  onShowLoginModal?: () => void
}

export function ImageUpload({ 
  onUpload, 
  currentImage, 
  onRemove, 
  className = '',
  isGuestMode = false,
  onShowLoginModal
}: IImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // 게스트 모드에서는 로그인 모달 표시
    if (isGuestMode) {
      if (onShowLoginModal) {
        onShowLoginModal()
      }
      return
    }

    // 클라이언트 사이드 검증
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: '파일 크기 초과',
        description: '파일 크기는 5MB 이하여야 합니다.'
      })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: '지원되지 않는 파일 형식',
        description: '지원되는 파일 형식: JPG, PNG, WebP, GIF'
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        onUpload(result.data.url)
        toast({
          title: '성공',
          description: '이미지가 업로드되었습니다.'
        })
      } else {
        toast({
          variant: 'destructive',
          title: '업로드 실패',
          description: result.error || '이미지 업로드에 실패했습니다.'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '이미지 업로드 중 오류가 발생했습니다.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleClick = () => {
    if (isGuestMode) {
      if (onShowLoginModal) {
        onShowLoginModal()
      }
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {currentImage ? (
        <div className="relative group">
          <div 
            className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-gray-200"
            style={{ backgroundImage: `url(${currentImage})` }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                변경
              </Button>
              {onRemove && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onRemove}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 mr-1" />
                  제거
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            {isGuestMode 
              ? '로그인 후 이미지 업로드 가능' 
              : (isUploading ? '업로드 중...' : '이미지를 드래그하거나 클릭하여 업로드')
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isGuestMode ? '회원가입 후 배경 이미지를 업로드하세요' : 'JPG, PNG, WebP, GIF (최대 5MB)'}
          </p>
        </div>
      )}
    </div>
  )
}