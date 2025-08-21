import { useState, useEffect } from 'react'
import { Card } from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'
import WeatherWidget from '@/lib/components/widgets/WeatherWidget'
import MemoWidget from '@/lib/components/widgets/MemoWidget'
import SearchWidget from '@/lib/components/widgets/SearchWidget'
import CalendarWidget from '@/lib/components/widgets/CalendarWidget'
import { 
  Clock, List
} from 'lucide-react'
import { 
  IWidget, 
  IWeatherSettings, 
  IMemoSettings, 
  ISearchSettings, 
  ICalendarSettings,
  ILinkSettings,
  IChecklistSettings,
  IChecklistItem
} from '@/types'
import { normalizeUrl, extractDomain, detectUrlType, getRecommendedIcon } from '@/lib/utils/urlUtils'

interface WidgetRendererProps {
  widget: IWidget
  isEditMode: boolean
  onRemove: (widgetId: string) => void
  onSettingsChange?: (widgetId: string, settings: any) => void
  onChecklistItemChange?: (widgetId: string, itemId: string, completed: boolean) => void
}

export default function WidgetRenderer({
  widget,
  isEditMode,
  onRemove,
  onSettingsChange,
  onChecklistItemChange
}: WidgetRendererProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // 클라이언트에서만 시간을 설정하여 hydration 문제 해결
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  const baseProps = {
    isEditMode,
    onRemove: () => onRemove(widget.id)
  }

  switch (widget.type) {
    case 'weather':
      return <WeatherWidget key={widget.id} {...baseProps} settings={widget.settings as IWeatherSettings} />
    
    case 'memo':
      return (
        <MemoWidget 
          key={widget.id}
          {...baseProps} 
          settings={widget.settings as IMemoSettings}
          onSettingsChange={(newSettings) => onSettingsChange?.(widget.id, newSettings)}
        />
      )
    
    case 'search':
      return <SearchWidget key={widget.id} {...baseProps} settings={widget.settings as ISearchSettings} />
    
    case 'calendar':
      return <CalendarWidget key={widget.id} {...baseProps} settings={widget.settings as ICalendarSettings} />
    
    case 'clock':
      return (
        <Card 
          key={widget.id}
          className={`macos-widget p-6 relative animate-macos-fade-in ${isEditMode ? 'border-2 border-dashed border-blue-300 animate-macos-pulse' : ''}`}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
            // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
            if (isEditMode) {
              e.stopPropagation()
            }
          }}
        >
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            {isClient && currentTime ? (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentTime.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentTime.toLocaleDateString('ko-KR')}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  --:--:--
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ----/--/--
                </div>
              </>
            )}
          </div>
          {isEditMode && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onRemove(widget.id)}
            >
              ×
            </Button>
          )}
        </Card>
      )
    
    case 'link':
      const linkSettings = widget.settings as ILinkSettings
      
      const normalizedUrl = normalizeUrl(linkSettings.url)
      const displayUrl = extractDomain(linkSettings.url)
      const urlType = detectUrlType(linkSettings.url)
      const recommendedIcon = getRecommendedIcon(linkSettings.url)
      
      return (
        <Card 
          key={widget.id}
          className={`macos-widget bg-white dark:bg-white p-6 relative animate-macos-fade-in ${isEditMode ? 'border-2 border-dashed border-blue-300 animate-macos-pulse' : ''}`}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
            // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
            if (isEditMode) {
              e.stopPropagation()
            }
          }}
        >
          <a 
            href={normalizedUrl} 
            target={urlType === 'local' || urlType === 'file' ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-100 rounded-lg p-3 transition-all duration-200 group"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              // 검색인 경우 새 탭에서 열기
              if (urlType === 'search') {
                e.preventDefault()
                window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            <div className="flex-shrink-0">
              {/* favicon URL인지 확인 (http로 시작하는 경우) */}
              {linkSettings.icon && linkSettings.icon.startsWith('http') ? (
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-gray-200 dark:border-gray-700">
                  <img 
                    src={linkSettings.icon} 
                    alt="favicon" 
                    className="w-8 h-8 rounded"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      // favicon 로드 실패 시 기본 아이콘으로 대체
                      e.currentTarget.style.display = 'none'
                      const fallbackDiv = document.createElement('div')
                      fallbackDiv.className = 'text-2xl'
                      fallbackDiv.textContent = recommendedIcon
                      e.currentTarget.parentNode?.appendChild(fallbackDiv)
                    }}
                  />
                </div>
              ) : linkSettings.icon && linkSettings.icon !== '🔗' ? (
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {linkSettings.icon}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">{recommendedIcon}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                {linkSettings.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200 truncate">
                {displayUrl}
              </div>
              {urlType !== 'web' && (
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                  {urlType === 'email' && '이메일'}
                  {urlType === 'phone' && '전화번호'}
                  {urlType === 'file' && '파일'}
                  {urlType === 'local' && '로컬'}
                  {urlType === 'search' && '검색'}
                </div>
              )}
            </div>
          </a>
          {isEditMode && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-80 hover:opacity-100"
              onClick={() => onRemove(widget.id)}
            >
              ×
            </Button>
          )}
        </Card>
      )
    
    case 'checklist':
      const checklistSettings = widget.settings as IChecklistSettings
      return (
        <Card 
          key={widget.id}
          className={`macos-widget p-6 relative animate-macos-fade-in ${isEditMode ? 'border-2 border-dashed border-blue-300 animate-macos-pulse' : ''}`}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
            // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
            if (isEditMode) {
              e.stopPropagation()
            }
          }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <List className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{checklistSettings.title}</h3>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {checklistSettings.items.map((item: IChecklistItem) => (
              <div key={item.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onChecklistItemChange?.(widget.id, item.id, !item.completed)}
                  className="rounded"
                />
                <span className={item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          {isEditMode && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onRemove(widget.id)}
            >
              ×
            </Button>
          )}
        </Card>
      )
    
    default:
      return null
  }
}