'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/lib/components/ui/button'
import { Card } from '@/lib/components/ui/card'
import { Navbar } from '@/lib/components/ui/navbar'
import { Modal } from '@/lib/components/ui/modal'
import { Input } from '@/lib/components/ui/input'
import { Select } from '@/lib/components/ui/select'
import { Badge } from '@/lib/components/ui/badge'
import { Spacer } from '@/lib/components/ui/spacer'
import { Divider } from '@/lib/components/ui/divider'
import { useAuth } from '@/lib/hooks'
import { useToast } from '@/lib/hooks/use-toast'
import UserNameEditor from '@/lib/components/profile/UserNameEditor'
import WeatherWidget from '@/lib/components/widgets/WeatherWidget'
import MemoWidget from '@/lib/components/widgets/MemoWidget'
import SearchWidget from '@/lib/components/widgets/SearchWidget'
import SortableWidget from '@/lib/components/widgets/SortableWidget'
import { 
  Plus, Edit, Save, Settings, Grid, Layout, Clock, 
  Link as LinkIcon, List, LogOut, Cloud, FileText, 
  Search, Palette, Download, Upload, Moon, Sun
} from 'lucide-react'
import { 
  IDashboard, 
  IWidget, 
  IWidgetSettings,
  ILinkSettings,
  IChecklistSettings,
  IWeatherSettings,
  IMemoSettings,
  ISearchSettings,
  IBackgroundOption
} from '@/types'

// 기본 위젯 타입 정의
interface IChecklistItem {
  id: string
  text: string
  completed: boolean
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const hasRedirectedRef = useRef(false)
  
  // 상태 관리
  const [dashboard, setDashboard] = useState<IDashboard | null>(null)
  const [widgets, setWidgets] = useState<IWidget[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  // 새 위젯 추가 폼 상태
  const [newWidgetData, setNewWidgetData] = useState<any>({})

  // 배경 옵션
  const backgroundOptions: IBackgroundOption[] = [
    { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: '보라 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: '핑크 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: '파란 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: '녹색 그라데이션' },
    { type: 'color', value: '#f8fafc', name: '라이트 그레이' },
    { type: 'color', value: '#1e293b', name: '다크 그레이' },
    { type: 'color', value: '#ffffff', name: '화이트' },
    { type: 'color', value: '#000000', name: '블랙' }
  ]

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 인증 상태 확인
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  // 사용자 정보 로드
  useEffect(() => {
    if (user?.profile?.full_name) {
      setUserName(user.profile.full_name)
    } else if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name)
    } else if (user?.email) {
      setUserName(user.email.split('@')[0])
    }
  }, [user])

  // 대시보드 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard()
    }
  }, [isAuthenticated])

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      switch (e.key.toLowerCase()) {
        case 'e':
          e.preventDefault()
          setIsEditMode(!isEditMode)
          break
        case 'escape':
          e.preventDefault()
          setIsEditMode(false)
          setIsSidebarOpen(false)
          setIsAddWidgetModalOpen(false)
          setIsSettingsModalOpen(false)
          break
        case 'tab':
          e.preventDefault()
          setIsSidebarOpen(!isSidebarOpen)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditMode, isSidebarOpen])

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setDashboard(result.data.dashboard)
        setWidgets(result.data.widgets)
      } else {
        toast({
          variant: 'destructive',
          title: '오류',
          description: result.error || '대시보드를 불러올 수 없습니다.'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '대시보드를 불러오는데 실패했습니다.'
      })
    } finally {
      setIsDashboardLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id)
      const newIndex = widgets.findIndex(w => w.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newWidgets = [...widgets]
        const [moved] = newWidgets.splice(oldIndex, 1)
        newWidgets.splice(newIndex, 0, moved)
        
        // 위치 업데이트
        const updatedWidgets = newWidgets.map((widget, index) => ({
          ...widget,
          position_x: index % 4,
          position_y: Math.floor(index / 4)
        }))
        
        setWidgets(updatedWidgets)
        saveWidgetPositions(updatedWidgets)
      }
    }
  }

  const saveWidgetPositions = async (updatedWidgets: IWidget[]) => {
    // 배치 업데이트 API 호출
    for (const widget of updatedWidgets) {
      try {
        await fetch('/api/widgets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId: widget.id,
            position_x: widget.position_x,
            position_y: widget.position_y
          })
        })
      } catch (error) {
        console.error('위젯 위치 저장 실패:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleUserNameUpdate = (newName: string) => {
    setUserName(newName)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const openAddWidgetModal = (type: string) => {
    setSelectedWidgetType(type)
    setNewWidgetData({})
    setIsAddWidgetModalOpen(true)
  }

  const addWidget = async () => {
    if (!dashboard) return

    let settings: IWidgetSettings

    switch (selectedWidgetType) {
      case 'link':
        settings = {
          url: newWidgetData.url || 'https://example.com',
          title: newWidgetData.title || '새 링크',
          icon: newWidgetData.icon || '🔗',
          description: newWidgetData.description || ''
        } as ILinkSettings
        break
      
      case 'checklist':
        settings = {
          title: newWidgetData.title || '새 체크리스트',
          items: newWidgetData.items || [
            { id: '1', text: '새 할 일', completed: false }
          ]
        } as IChecklistSettings
        break
        
      case 'weather':
        settings = {
          city: newWidgetData.city || 'Seoul',
          country: newWidgetData.country || 'KR',
          unit: newWidgetData.unit || 'metric',
          showForecast: newWidgetData.showForecast || false
        } as IWeatherSettings
        break
        
      case 'memo':
        settings = {
          title: newWidgetData.title || '새 메모',
          content: newWidgetData.content || '',
          color: newWidgetData.color || '#f3f4f6'
        } as IMemoSettings
        break
        
      case 'search':
        settings = {
          engines: [
            { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
            { id: 'naver', name: 'Naver', url: 'https://search.naver.com/search.naver?query=', icon: 'N' }
          ],
          defaultEngine: 'google',
          placeholder: '검색어를 입력하세요...'
        } as ISearchSettings
        break
        
      default:
        settings = {} as IWidgetSettings
    }

    const widgetData = {
      dashboard_id: dashboard.id,
      type: selectedWidgetType,
      position_x: widgets.length % 4,
      position_y: Math.floor(widgets.length / 4),
      width: selectedWidgetType === 'clock' ? 2 : 
             selectedWidgetType === 'search' ? 4 :
             selectedWidgetType === 'weather' ? 2 : 2,
      height: selectedWidgetType === 'checklist' ? 2 :
              selectedWidgetType === 'memo' ? 2 : 1,
      settings
    }

    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgetData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setWidgets([...widgets, result.data])
        setIsAddWidgetModalOpen(false)
        toast({
          title: '성공',
          description: '위젯이 추가되었습니다.'
        })
      } else {
        toast({
          variant: 'destructive',
          title: '오류',
          description: result.error || '위젯 추가에 실패했습니다.'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '위젯 추가 중 오류가 발생했습니다.'
      })
    }
  }

  const removeWidget = async (widgetId: string) => {
    try {
      const response = await fetch('/api/widgets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setWidgets(widgets.filter(w => w.id !== widgetId))
        toast({
          title: '성공',
          description: '위젯이 삭제되었습니다.'
        })
      } else {
        toast({
          variant: 'destructive',
          title: '오류',
          description: result.error || '위젯 삭제에 실패했습니다.'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '위젯 삭제 중 오류가 발생했습니다.'
      })
    }
  }

  const updateDashboardBackground = async (background: IBackgroundOption) => {
    if (!dashboard) return

    try {
      const response = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          background_type: background.type,
          background_value: background.value
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setDashboard(result.data)
        toast({
          title: '성공',
          description: '배경이 변경되었습니다.'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '배경 변경에 실패했습니다.'
      })
    }
  }

  const renderWidget = (widget: IWidget) => {
    const baseProps = {
      key: widget.id,
      isEditMode,
      onRemove: () => removeWidget(widget.id)
    }

    switch (widget.type) {
      case 'weather':
        return <WeatherWidget {...baseProps} settings={widget.settings as IWeatherSettings} />
      case 'memo':
        return <MemoWidget {...baseProps} settings={widget.settings as IMemoSettings} />
      case 'search':
        return <SearchWidget {...baseProps} settings={widget.settings as ISearchSettings} />
      case 'clock':
        return (
          <Card className={`p-6 relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ko-KR')}
              </div>
            </div>
            {isEditMode && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeWidget(widget.id)}
              >
                ×
              </Button>
            )}
          </Card>
        )
      case 'link':
        const linkSettings = widget.settings as ILinkSettings
        return (
          <Card className={`p-6 relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
            <a 
              href={linkSettings.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover:bg-gray-50 rounded p-2 transition-colors"
            >
              <div className="text-2xl">
                {linkSettings.icon || <LinkIcon className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-medium">{linkSettings.title}</div>
                <div className="text-sm text-gray-500">
                  {new URL(linkSettings.url).hostname}
                </div>
              </div>
            </a>
            {isEditMode && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeWidget(widget.id)}
              >
                ×
              </Button>
            )}
          </Card>
        )
      case 'checklist':
        const checklistSettings = widget.settings as IChecklistSettings
        return (
          <Card className={`p-6 relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
            <div className="flex items-center space-x-2 mb-4">
              <List className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">{checklistSettings.title}</h3>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {checklistSettings.items.map((item: IChecklistItem) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}} // TODO: 체크리스트 업데이트 구현
                    className="rounded"
                  />
                  <span className={item.completed ? 'line-through text-gray-500' : ''}>
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
                onClick={() => removeWidget(widget.id)}
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

  const renderAddWidgetModal = () => {
    return (
      <Modal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        title="새 위젯 추가"
      >
        <div className="space-y-4">
          {selectedWidgetType === 'link' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">제목</label>
                <Input
                  value={newWidgetData.title || ''}
                  onChange={(e) => setNewWidgetData({...newWidgetData, title: e.target.value})}
                  placeholder="링크 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <Input
                  value={newWidgetData.url || ''}
                  onChange={(e) => setNewWidgetData({...newWidgetData, url: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">아이콘 (선택사항)</label>
                <Input
                  value={newWidgetData.icon || ''}
                  onChange={(e) => setNewWidgetData({...newWidgetData, icon: e.target.value})}
                  placeholder="🔗"
                />
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">항목들 (각 줄마다 하나씩)</label>
                <textarea
                  className="w-full p-2 border rounded-md"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">내용</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  value={newWidgetData.content || ''}
                  onChange={(e) => setNewWidgetData({...newWidgetData, content: e.target.value})}
                  placeholder="메모 내용을 입력하세요"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddWidgetModalOpen(false)}>
              취소
            </Button>
            <Button onClick={addWidget}>
              추가
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  const renderSettingsModal = () => {
    return (
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="대시보드 설정"
      >
        <div className="space-y-6">
          {/* 배경 설정 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">배경 설정</h3>
            <div className="grid grid-cols-2 gap-3">
              {backgroundOptions.map((option, index) => (
                <div
                  key={index}
                  className="cursor-pointer border-2 rounded-lg p-3 hover:border-blue-300 transition-colors"
                  style={{
                    background: option.value,
                    borderColor: dashboard?.background_value === option.value ? '#3b82f6' : '#e5e7eb'
                  }}
                  onClick={() => updateDashboardBackground(option)}
                >
                  <div className="h-16 rounded mb-2"></div>
                  <p className="text-sm font-medium text-center text-gray-700">
                    {option.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 레이아웃 설정 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">레이아웃 설정</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">그리드 열 수</label>
                <Select
                  value={dashboard?.layout_settings?.gridCols?.toString() || '4'}
                  onChange={(value) => {
                    // TODO: 레이아웃 설정 업데이트
                  }}
                  options={[
                    { value: '3', label: '3열' },
                    { value: '4', label: '4열' },
                    { value: '5', label: '5열' },
                    { value: '6', label: '6열' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  // 인증되지 않은 사용자는 렌더링하지 않음
  if (!isAuthenticated || isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const backgroundStyle = dashboard ? {
    background: dashboard.background_value
  } : {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {/* 상단 네비게이션 */}
      <Navbar className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
            >
              <Grid className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">PersonalDash</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {user && (
              <UserNameEditor 
                currentName={userName}
                onNameUpdate={handleUserNameUpdate}
              />
            )}
            <Badge variant={isEditMode ? "default" : "secondary"}>
              {isEditMode ? '편집 모드' : '보기 모드'}
            </Badge>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  완료
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </Navbar>

      <div className="flex">
        {/* 사이드바 */}
        <div className={`fixed left-0 top-16 h-full bg-white border-r transition-transform duration-300 z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80`}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">위젯 추가</h2>
            
            <div className="space-y-3">
              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openAddWidgetModal('search')}
              >
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-medium">검색 위젯</div>
                    <div className="text-sm text-gray-500">
                      통합 검색 (Google, Naver 등)
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openAddWidgetModal('weather')}
              >
                <div className="flex items-center space-x-3">
                  <Cloud className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="font-medium">날씨 위젯</div>
                    <div className="text-sm text-gray-500">
                      현재 날씨 및 예보 정보
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openAddWidgetModal('memo')}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-medium">메모 위젯</div>
                    <div className="text-sm text-gray-500">
                      빠른 메모 작성 및 관리
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openAddWidgetModal('link')}
              >
                <div className="flex items-center space-x-3">
                  <LinkIcon className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="font-medium">링크 위젯</div>
                    <div className="text-sm text-gray-500">
                      자주 사용하는 웹사이트 바로가기
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openAddWidgetModal('checklist')}
              >
                <div className="flex items-center space-x-3">
                  <List className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-medium">체크리스트 위젯</div>
                    <div className="text-sm text-gray-500">
                      할 일 목록 관리
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openAddWidgetModal('clock')}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-purple-500" />
                  <div>
                    <div className="font-medium">시계 위젯</div>
                    <div className="text-sm text-gray-500">
                      현재 시간 표시
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Spacer y={6} />
            <Divider />
            <Spacer y={6} />

            <h3 className="text-md font-semibold mb-4">대시보드 설정</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Palette className="w-4 h-4 mr-2" />
                배경 및 테마 변경
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Layout className="w-4 h-4 mr-2" />
                레이아웃 초기화
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                설정 백업
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                설정 복원
              </Button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarOpen ? 'ml-80' : 'ml-0'
        }`}>
          <div className="max-w-7xl mx-auto">
            {/* 위젯 그리드 */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={widgets?.map(w => w.id) || []} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                  {widgets?.map((widget) => (
                    <SortableWidget
                      key={widget.id}
                      id={widget.id}
                      widget={widget}
                      isEditMode={isEditMode}
                    >
                      {renderWidget(widget)}
                    </SortableWidget>
                  )) || []}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeId ? (
                  <div className="opacity-50">
                    {renderWidget(widgets.find(w => w.id === activeId)!)}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* 빈 상태 */}
            {widgets.length === 0 && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 mx-auto text-white/50 mb-4" />
                <h3 className="text-lg font-medium text-white/80 mb-2">
                  위젯을 추가해보세요
                </h3>
                <p className="text-white/60 mb-6">
                  왼쪽 사이드바에서 원하는 위젯을 선택하여 대시보드를 구성하세요
                </p>
                <Button onClick={toggleSidebar} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  위젯 추가하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {renderAddWidgetModal()}
      {renderSettingsModal()}

      {/* 사이드바 오버레이 (모바일) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-5 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 단축키 힌트 */}
      <div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        E: 편집 | Tab: 사이드바 | Esc: 종료
      </div>
    </div>
  )
}