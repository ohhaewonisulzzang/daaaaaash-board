'use client'

import { useState, useRef } from 'react'
import { Card } from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { ISearchSettings, ISearchEngine } from '@/types'
import { Search, Globe, ExternalLink } from 'lucide-react'

interface ISearchWidgetProps {
  settings: ISearchSettings
  isEditMode?: boolean
  onRemove?: () => void
  onSettingsChange?: (settings: ISearchSettings) => void
}

export default function SearchWidget({ 
  settings, 
  isEditMode, 
  onRemove, 
  onSettingsChange 
}: ISearchWidgetProps) {
  const [query, setQuery] = useState('')
  const [selectedEngine, setSelectedEngine] = useState(settings.defaultEngine || 'google')
  const inputRef = useRef<HTMLInputElement>(null)

  const defaultEngines: ISearchEngine[] = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
    { id: 'naver', name: 'Naver', url: 'https://search.naver.com/search.naver?query=', icon: 'N' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: '📺' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=', icon: '⚡' }
  ]

  const engines = settings.engines && settings.engines.length > 0 ? settings.engines : defaultEngines
  const currentEngine = engines.find(e => e.id === selectedEngine) || engines[0]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && currentEngine) {
      const searchUrl = currentEngine.url + encodeURIComponent(query.trim())
      window.open(searchUrl, '_blank', 'noopener,noreferrer')
      setQuery('')
    }
  }

  const handleEngineChange = (engineId: string) => {
    setSelectedEngine(engineId)
    if (onSettingsChange) {
      onSettingsChange({
        ...settings,
        defaultEngine: engineId
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const currentIndex = engines.findIndex(e => e.id === selectedEngine)
      const nextIndex = (currentIndex + 1) % engines.length
      handleEngineChange(engines[nextIndex].id)
    }
  }

  return (
    <Card 
      className={`p-4 h-full relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}
      onMouseDown={(e) => {
        // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
        if (isEditMode) {
          e.stopPropagation()
        }
      }}
    >
      <div className="flex flex-col h-full">
        {/* 검색 엔진 선택 */}
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="w-4 h-4 text-gray-500" />
          <div className="flex space-x-1">
            {engines.map((engine) => (
              <Button
                key={engine.id}
                size="sm"
                variant={selectedEngine === engine.id ? "default" : "outline"}
                onClick={() => handleEngineChange(engine.id)}
                className="h-6 px-2 text-xs"
              >
                <span className="mr-1">{engine.icon}</span>
                {engine.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={settings.placeholder || `${currentEngine.name}에서 검색...`}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-2"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </form>

        {/* 빠른 검색 링크 */}
        <div className="mt-3 pt-2 border-t">
          <div className="flex flex-wrap gap-1">
            {['날씨', '뉴스', '번역', '지도'].map((keyword) => (
              <Button
                key={keyword}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery(keyword)
                  inputRef.current?.focus()
                }}
                className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
              >
                {keyword}
              </Button>
            ))}
          </div>
        </div>

        {/* 사용법 힌트 */}
        <div className="mt-2">
          <p className="text-xs text-gray-400 text-center">
            Tab키로 검색엔진 변경 • Enter로 검색
          </p>
        </div>
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