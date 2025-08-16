'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { IMemoSettings } from '@/types'
import { Edit3, Save, X, FileText } from 'lucide-react'

interface IMemoWidgetProps {
  settings: IMemoSettings
  isEditMode?: boolean
  onRemove?: () => void
  onSettingsChange?: (settings: IMemoSettings) => void
}

export default function MemoWidget({ 
  settings, 
  isEditMode, 
  onRemove, 
  onSettingsChange 
}: IMemoWidgetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(settings.title || '메모')
  const [content, setContent] = useState(settings.content || '')
  const [tempTitle, setTempTitle] = useState(title)
  const [tempContent, setTempContent] = useState(content)

  useEffect(() => {
    setTitle(settings.title || '메모')
    setContent(settings.content || '')
    setTempTitle(settings.title || '메모')
    setTempContent(settings.content || '')
  }, [settings])

  const handleSave = () => {
    const newSettings: IMemoSettings = {
      title: tempTitle.trim() || '메모',
      content: tempContent,
      color: settings.color
    }
    
    setTitle(newSettings.title)
    setContent(newSettings.content)
    setIsEditing(false)
    
    if (onSettingsChange) {
      onSettingsChange(newSettings)
    }
  }

  const handleCancel = () => {
    setTempTitle(title)
    setTempContent(content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  return (
    <Card className={`p-4 h-full relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            {isEditing ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm font-semibold h-6 px-1"
                placeholder="메모 제목"
                autoFocus
              />
            ) : (
              <h3 className="font-semibold text-sm">{title}</h3>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="h-6 px-2"
                >
                  <Save className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-6 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 min-h-0">
          {isEditing ? (
            <textarea
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메모를 입력하세요... (Ctrl+Enter로 저장, Esc로 취소)"
              className="w-full h-full p-2 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div 
              className="w-full h-full p-2 text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto cursor-pointer hover:bg-gray-50 rounded"
              onClick={() => setIsEditing(true)}
            >
              {content || (
                <span className="text-gray-400 italic">
                  클릭하여 메모를 작성하세요...
                </span>
              )}
            </div>
          )}
        </div>

        {/* 푸터 정보 */}
        {!isEditing && content && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-gray-400">
              {content.length}자 • 클릭하여 편집
            </p>
          </div>
        )}
      </div>

      {isEditMode && onRemove && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          ×
        </Button>
      )}
    </Card>
  )
}