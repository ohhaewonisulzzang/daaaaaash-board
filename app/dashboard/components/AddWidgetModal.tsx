import { useState } from 'react'
import { Modal } from '@/lib/components/ui/modal'
import { Input } from '@/lib/components/ui/input'
import { Button } from '@/lib/components/ui/button'
import { Select } from '@/lib/components/ui/select'
import { normalizeUrl, extractDomain, getRecommendedIcon } from '@/lib/utils/urlUtils'
import { getFaviconWithCache, DEFAULT_ICONS } from '@/lib/utils/faviconUtils'
import { useToast } from '@/lib/hooks/use-toast'

interface AddWidgetModalProps {
  isOpen: boolean
  onClose: () => void
  selectedWidgetType: string
  newWidgetData: any
  setNewWidgetData: (data: any) => void
  onAddWidget: () => void
  faviconLoading: boolean
  setFaviconLoading: (loading: boolean) => void
  faviconError: string | null
  setFaviconError: (error: string | null) => void
}

export default function AddWidgetModal({
  isOpen,
  onClose,
  selectedWidgetType,
  newWidgetData,
  setNewWidgetData,
  onAddWidget,
  faviconLoading,
  setFaviconLoading,
  faviconError,
  setFaviconError
}: AddWidgetModalProps) {
  const { toast } = useToast()

  // favicon 자동 가져오기 함수
  const fetchFaviconForUrl = async (url: string) => {
    if (!url || url.trim() === '') return

    setFaviconLoading(true)
    setFaviconError(null)

    try {
      const result = await getFaviconWithCache(url)
      
      if (result.success && result.faviconUrl) {
        // 성공적으로 favicon을 가져온 경우
        setNewWidgetData((prev: any) => ({
          ...prev,
          icon: result.faviconUrl,
          faviconUrl: result.faviconUrl,
          hasCustomIcon: false
        }))
        
        toast({
          title: '성공',
          description: 'Favicon을 자동으로 가져왔습니다.'
        })
      } else {
        // favicon을 가져오지 못한 경우
        setFaviconError(result.error || 'Favicon을 찾을 수 없습니다')
        
        // 기본 추천 아이콘 사용
        const recommendedIcon = getRecommendedIcon(url)
        setNewWidgetData((prev: any) => ({
          ...prev,
          icon: prev.icon || recommendedIcon,
          hasCustomIcon: true
        }))
      }
    } catch (error) {
      setFaviconError('Favicon 가져오기 중 오류가 발생했습니다')
      
      // 기본 추천 아이콘 사용
      const recommendedIcon = getRecommendedIcon(url)
      setNewWidgetData((prev: any) => ({
        ...prev,
        icon: prev.icon || recommendedIcon,
        hasCustomIcon: true
      }))
    } finally {
      setFaviconLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="새 위젯 추가"
    >
      <div className="space-y-4">
        {selectedWidgetType === 'link' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">제목</label>
              <Input
                value={newWidgetData.title || ''}
                onChange={(e) => setNewWidgetData({...newWidgetData, title: e.target.value})}
                placeholder="링크 제목을 입력하세요"
                className="form-input border-2 border-black bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">URL</label>
              <div className="space-y-2">
                <Input
                  value={newWidgetData.url || ''}
                  onChange={(e) => {
                    const url = e.target.value
                    setNewWidgetData({...newWidgetData, url})
                    
                    // URL이 입력되면 자동으로 제목 추천
                    if (url && !newWidgetData.title) {
                      const domain = extractDomain(url)
                      setNewWidgetData((prev: any) => ({
                        ...prev,
                        url,
                        title: prev.title || domain || '새 링크'
                      }))
                    }
                  }}
                  placeholder="다양한 형태의 URL을 입력하세요"
                  className="form-input border-2 border-black bg-white text-black"
                />
                
                {/* Favicon 가져오기 버튼 */}
                {newWidgetData.url && (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchFaviconForUrl(newWidgetData.url)}
                      disabled={faviconLoading}
                      className="macos-button-secondary"
                    >
                      {faviconLoading ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
                          Favicon 가져오는 중...
                        </>
                      ) : (
                        <>
                          🔄 Favicon 자동 가져오기
                        </>
                      )}
                    </Button>
                    
                    {faviconError && (
                      <div className="text-xs text-red-500">
                        {faviconError}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="font-medium mb-1">지원되는 URL 형태:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span>• https://example.com</span>
                  <span>• example.com</span>
                  <span>• localhost:3000</span>
                  <span>• 192.168.1.1</span>
                  <span>• mailto:test@email.com</span>
                  <span>• tel:010-1234-5678</span>
                  <span>• file:///path/to/file</span>
                  <span>• 검색어 (구글 검색)</span>
                </div>
              </div>
              {newWidgetData.url && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">미리보기:</div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {newWidgetData.icon || getRecommendedIcon(newWidgetData.url)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {newWidgetData.title || extractDomain(newWidgetData.url)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {extractDomain(newWidgetData.url)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">아이콘</label>
              
              {/* 현재 아이콘 미리보기 */}
              {newWidgetData.icon && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">현재 아이콘:</div>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {newWidgetData.faviconUrl ? (
                        <img 
                          src={newWidgetData.faviconUrl} 
                          alt="favicon" 
                          className="w-8 h-8 rounded"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            // favicon 로드 실패 시 기본 아이콘으로 변경
                            e.currentTarget.style.display = 'none'
                            setNewWidgetData((prev: any) => ({
                              ...prev,
                              icon: getRecommendedIcon(prev.url || ''),
                              faviconUrl: null,
                              hasCustomIcon: true
                            }))
                          }}
                        />
                      ) : (
                        newWidgetData.icon
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {newWidgetData.faviconUrl ? 'Favicon (자동)' : '이모지 아이콘'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {newWidgetData.faviconUrl ? '웹사이트에서 자동으로 가져온 아이콘' : '수동으로 선택한 아이콘'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 수동 아이콘 입력 */}
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newWidgetData.hasCustomIcon ? newWidgetData.icon || '' : ''}
                  onChange={(e) => setNewWidgetData({
                    ...newWidgetData, 
                    icon: e.target.value,
                    hasCustomIcon: true,
                    faviconUrl: null
                  })}
                  placeholder="🔗 또는 이모지를 직접 입력"
                  className="form-input flex-1 border-2 border-black bg-white text-black"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newWidgetData.url) {
                      const recommendedIcon = getRecommendedIcon(newWidgetData.url)
                      setNewWidgetData({
                        ...newWidgetData, 
                        icon: recommendedIcon,
                        hasCustomIcon: true,
                        faviconUrl: null
                      })
                    }
                  }}
                  className="macos-button-secondary px-3"
                >
                  추천
                </Button>
              </div>
              
              {/* 기본 아이콘 선택 */}
              <div className="mb-3">
                <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">빠른 선택:</div>
                <div className="grid grid-cols-8 gap-2 max-h-24 overflow-y-auto">
                  {DEFAULT_ICONS.slice(0, 24).map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewWidgetData({
                        ...newWidgetData, 
                        icon: emoji,
                        hasCustomIcon: true,
                        faviconUrl: null
                      })}
                      className={`text-xl hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded transition-colors ${
                        newWidgetData.icon === emoji && newWidgetData.hasCustomIcon ? 'bg-blue-100 dark:bg-blue-900' : ''
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* favicon vs 수동 선택 안내 */}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                💡 팁: URL을 입력한 후 "Favicon 자동 가져오기" 버튼을 클릭하면 해당 웹사이트의 실제 아이콘을 사용할 수 있습니다.
              </div>
            </div>
          </>
        )}

        {selectedWidgetType === 'checklist' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <Input
                value={newWidgetData.title || ''}
                onChange={(e) => setNewWidgetData({...newWidgetData, title: e.target.value})}
                placeholder="체크리스트 제목을 입력하세요"
                className="border-2 border-black bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">항목들 (각 줄마다 하나씩)</label>
              <textarea
                className="w-full p-2 border-2 border-black bg-white text-black rounded-md"
                rows={4}
                value={newWidgetData.itemsText || ''}
                onChange={(e) => {
                  const itemsText = e.target.value
                  const items = itemsText.split('\n').filter(item => item.trim()).map((text, index) => ({
                    id: (index + 1).toString(),
                    text: text.trim(),
                    completed: false
                  }))
                  setNewWidgetData({...newWidgetData, itemsText, items})
                }}
                placeholder="할 일 1&#10;할 일 2&#10;할 일 3"
              />
            </div>
          </>
        )}

        {selectedWidgetType === 'weather' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">도시</label>
              <Input
                value={newWidgetData.city || 'Seoul'}
                onChange={(e) => setNewWidgetData({...newWidgetData, city: e.target.value})}
                placeholder="Seoul"
                className="border-2 border-black bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">온도 단위</label>
              <Select
                value={newWidgetData.unit || 'metric'}
                onChange={(value) => setNewWidgetData({...newWidgetData, unit: value})}
                options={[
                  { value: 'metric', label: '섭씨 (°C)' },
                  { value: 'imperial', label: '화씨 (°F)' },
                  { value: 'kelvin', label: '켈빈 (K)' }
                ]}
              />
            </div>
          </>
        )}

        {selectedWidgetType === 'memo' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <Input
                value={newWidgetData.title || ''}
                onChange={(e) => setNewWidgetData({...newWidgetData, title: e.target.value})}
                placeholder="메모 제목을 입력하세요"
                className="border-2 border-black bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">내용</label>
              <textarea
                className="w-full p-2 border-2 border-black bg-white text-black rounded-md"
                rows={4}
                value={newWidgetData.content || ''}
                onChange={(e) => setNewWidgetData({...newWidgetData, content: e.target.value})}
                placeholder="메모 내용을 입력하세요"
              />
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} className="macos-button-secondary">
            취소
          </Button>
          <Button onClick={onAddWidget} className="macos-button">
            추가
          </Button>
        </div>
      </div>
    </Modal>
  )
}