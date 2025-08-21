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
import { Navbar } from '@/lib/components/ui/navbar'
import { Badge } from '@/lib/components/ui/badge'
import { LoginModal } from '@/lib/components/ui/login-modal'
import { useAuth } from '@/lib/hooks'
import { useToast } from '@/lib/hooks/use-toast'
import UserNameEditor from '@/lib/components/profile/UserNameEditor'
import { ThemeToggle } from '@/lib/components/ui/theme-toggle'
import ResizableWidget from '@/lib/components/widgets/ResizableWidget'
import SortableWidget from '@/lib/components/widgets/SortableWidget'
import { 
  Plus, Edit, Save, Settings, Grid, LogOut
} from 'lucide-react'
import { 
  IWidget, 
  IWidgetSettings,
  ILinkSettings,
  IChecklistSettings,
  IWeatherSettings,
  IMemoSettings,
  ISearchSettings,
  ICalendarSettings,
  IBackgroundOption
} from '@/types'
import { normalizeUrl, extractDomain, getRecommendedIcon } from '@/lib/utils/urlUtils'
import { guestStorage } from '@/lib/utils/guestStorage'
import { useDashboard, useWidgetOperations } from './hooks'
import { AddWidgetModal, SettingsModal, WidgetRenderer, Sidebar } from './components'

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading, isGuestMode, exitGuestMode } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const hasRedirectedRef = useRef(false)

  // 대시보드 데이터 관리 훅
  const {
    dashboard,
    setDashboard,
    widgets,
    setWidgets,
    isDashboardLoading,
    loadDashboard
  } = useDashboard()

  // 위젯 작업 관리 훅
  const {
    newWidgetData,
    setNewWidgetData,
    faviconLoading,
    setFaviconLoading,
    faviconError,
    setFaviconError,
    saveWidgetPositions,
    handleWidgetResize,
    removeWidget,
    updateChecklistItem,
    updateWidgetSettings,
    updateDashboardBackground,
    handleLayoutReset
  } = useWidgetOperations(widgets, setWidgets, dashboard, setDashboard)
  
  // UI 상태 관리
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // 시계 위젯용 현재 시간 상태
  const [currentTime, setCurrentTime] = useState(new Date())

  // 배경 옵션
  const backgroundOptions: IBackgroundOption[] = [
    { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: '보라 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: '핑크 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: '파란 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: '녹색 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', name: '로즈 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: '민트 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', name: '라벤더 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', name: '스카이 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)', name: '선셋 그라데이션' },
    { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: '네온 그라데이션' },
    { type: 'color', value: '#f8fafc', name: '라이트 그레이' },
    { type: 'color', value: '#1e293b', name: '다크 그레이' },
    { type: 'color', value: '#ffffff', name: '화이트' },
    { type: 'color', value: '#000000', name: '블랙' },
    { type: 'color', value: '#1e3a8a', name: '다크 블루' },
    { type: 'color', value: '#7c2d12', name: '다크 오렌지' },
    { type: 'color', value: '#14532d', name: '다크 그린' },
    { type: 'color', value: '#581c87', name: '다크 퍼플' }
  ]

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 모달 핸들러 함수들
  const handleShowLoginModal = () => {
    setIsLoginModalOpen(true)
  }

  const handleLoginFromModal = () => {
    setIsLoginModalOpen(false)
    window.location.href = '/'
  }

  const handleSignUpFromModal = () => {
    setIsLoginModalOpen(false)
    window.location.href = '/signup'
  }

  const handleLogout = async () => {
    if (isGuestMode) {
      await exitGuestMode()
    } else {
      await logout()
    }
    router.push('/')
  }

  const handleUserNameUpdate = (newName: string) => {
    setUserName(newName)
  }

  // 위젯 관련 함수들
  const toggleEditMode = () => setIsEditMode(!isEditMode)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const openAddWidgetModal = (type: string) => {
    setSelectedWidgetType(type)
    setNewWidgetData({})
    setFaviconLoading(false)
    setFaviconError(null)
    setIsAddWidgetModalOpen(true)
  }

  // 위젯 추가
  const addWidget = async () => {
    if (!dashboard) return

    let settings: IWidgetSettings

    switch (selectedWidgetType) {
      case 'link':
        const normalizedUrl = normalizeUrl(newWidgetData.url || 'https://example.com')
        const displayDomain = extractDomain(newWidgetData.url || 'https://example.com')
        const recommendedIcon = getRecommendedIcon(newWidgetData.url || 'https://example.com')
        
        const finalIcon = newWidgetData.faviconUrl || newWidgetData.icon || recommendedIcon
        
        settings = {
          url: normalizedUrl,
          title: newWidgetData.title || displayDomain || '새 링크',
          icon: finalIcon,
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
        
      case 'calendar':
        settings = {
          view: 'month',
          startDayOfWeek: 0,
          showWeekNumbers: false,
          showTodayButton: true
        } as ICalendarSettings
        break
        
      default:
        settings = {} as IWidgetSettings
    }

    // 화면 크기에 따른 최대 열 수 계산
    const getMaxCols = () => {
      if (typeof window === 'undefined') return 6
      const width = window.innerWidth
      if (width < 640) return 1
      if (width < 768) return 2
      if (width < 1024) return 3
      if (width < 1280) return 4
      return 6
    }

    const getMaxRows = () => {
      if (typeof window === 'undefined') return 4
      const availableHeight = window.innerHeight - 64 - 48
      const estimatedRowHeight = 200
      return Math.floor(availableHeight / estimatedRowHeight)
    }

    const maxCols = getMaxCols()
    const maxRows = getMaxRows()
    const maxWidgets = maxCols * maxRows

    if (widgets.length >= maxWidgets) {
      toast({
        variant: 'destructive',
        title: '알림',
        description: `현재 화면에는 최대 ${maxWidgets}개의 위젯만 배치할 수 있습니다.`
      })
      return
    }

    // 빈 위치 찾기
    const findAvailablePosition = () => {
      for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < maxCols; col++) {
          const isOccupied = widgets.some(w => w.position_x === col && w.position_y === row)
          if (!isOccupied) {
            return { x: col, y: row }
          }
        }
      }
      return { x: 0, y: 0 }
    }

    const position = findAvailablePosition()

    const widgetData = {
      dashboard_id: dashboard.id,
      type: selectedWidgetType,
      position_x: position.x,
      position_y: position.y,
      width: selectedWidgetType === 'clock' ? 2 : 
             selectedWidgetType === 'search' ? 4 :
             selectedWidgetType === 'weather' ? 2 : 
             selectedWidgetType === 'calendar' ? 2 : 2,
      height: selectedWidgetType === 'checklist' ? 2 :
              selectedWidgetType === 'memo' ? 2 :
              selectedWidgetType === 'calendar' ? 3 : 1,
      settings
    }

    try {
      if (isGuestMode) {
        const widgetId = guestStorage.addWidget({
          type: selectedWidgetType,
          position_x: widgetData.position_x,
          position_y: widgetData.position_y,
          width: widgetData.width,
          height: widgetData.height,
          settings
        })
        
        const newWidget: IWidget = {
          id: widgetId,
          dashboard_id: 'guest-dashboard',
          type: selectedWidgetType as 'link' | 'checklist' | 'clock' | 'weather' | 'calendar' | 'search' | 'memo',
          position_x: widgetData.position_x,
          position_y: widgetData.position_y,
          width: widgetData.width,
          height: widgetData.height,
          settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setWidgets([...widgets, newWidget])
        setIsAddWidgetModalOpen(false)
        toast({
          title: '성공',
          description: '위젯이 추가되었습니다.'
        })
      } else {
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
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '위젯 추가 중 오류가 발생했습니다.'
      })
    }
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (imageUrl: string) => {
    const background: IBackgroundOption = {
      type: 'image',
      value: `url(${imageUrl})`,
      name: '업로드된 이미지'
    }
    await updateDashboardBackground(background)
  }

  const handleImageRemove = async () => {
    const background: IBackgroundOption = {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      name: '기본 그라데이션'
    }
    await updateDashboardBackground(background)
  }

  // DnD 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const activeWidget = widgets.find(w => w.id === active.id)
      const overWidget = widgets.find(w => w.id === over.id)
      
      if (activeWidget && overWidget) {
        const updatedWidgets = widgets.map(widget => {
          if (widget.id === active.id) {
            return {
              ...widget,
              position_x: overWidget.position_x,
              position_y: overWidget.position_y
            }
          }
          if (widget.id === over.id) {
            return {
              ...widget,
              position_x: activeWidget.position_x,
              position_y: activeWidget.position_y
            }
          }
          return widget
        })
        
        setWidgets(updatedWidgets)
        saveWidgetPositions(updatedWidgets)
      }
    }
  }

  // 인증 상태 확인
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  // 사용자 정보 로드
  useEffect(() => {
    if (isGuestMode) {
      const guestUsername = localStorage.getItem('guest_username')
      setUserName(guestUsername || '게스트')
    } else if ((user as any)?.profile?.full_name) {
      setUserName((user as any).profile.full_name)
    } else if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name)
    } else if (user?.email) {
      setUserName(user.email.split('@')[0])
    }
  }, [user, isGuestMode])

  // 대시보드 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard()
    }
  }, [isAuthenticated, loadDashboard])

  // 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
    <div className="h-screen overflow-hidden" style={backgroundStyle}>
      {/* 상단 네비게이션 */}
      <Navbar className="glass-effect border-b border-white/20 dark:border-gray-800/40">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="macos-button-secondary hover:scale-105 transition-transform"
            >
              <Grid className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">PersonalDash</h1>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            {user && (
              <UserNameEditor 
                currentName={userName}
                onNameUpdate={handleUserNameUpdate}
                isGuestMode={isGuestMode}
              />
            )}
            <Badge variant={isEditMode ? "default" : "secondary"} className="hidden sm:inline-flex">
              {isEditMode ? '편집 모드' : '보기 모드'}
            </Badge>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
              className={`${isEditMode ? 'macos-button animate-macos-pulse' : 'macos-button-secondary'} hover:scale-105 transition-all`}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">완료</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">편집</span>
                </>
              )}
            </Button>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSettingsModalOpen(true)}
              className="macos-button-secondary hover:scale-105 transition-transform"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="macos-button-secondary text-red-500 hover:text-red-600 hover:scale-105 transition-all border-red-200 dark:border-red-800"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        </div>
      </Navbar>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 사이드바 */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          onOpenAddWidgetModal={openAddWidgetModal}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onLayoutReset={handleLayoutReset}
        />

        {/* 메인 콘텐츠 */}
        <div className={`flex-1 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? 'lg:ml-80 md:ml-72 sm:ml-64 ml-0' : 'ml-0'
        }`}>
          <div className="h-full p-4 sm:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {/* 위젯 그리드 */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={widgets?.map(w => w.id) || []} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-fr min-h-[calc(100vh-8rem)]">
                    {widgets
                      ?.sort((a, b) => {
                        if (a.position_y !== b.position_y) {
                          return a.position_y - b.position_y
                        }
                        return a.position_x - b.position_x
                      })
                      ?.map((widget) => (
                        <SortableWidget
                          key={widget.id}
                          id={widget.id}
                          widget={widget}
                          isEditMode={isEditMode}
                        >
                          <ResizableWidget
                            id={widget.id}
                            widget={widget}
                            isEditMode={isEditMode}
                            onResize={handleWidgetResize}
                          >
                            <WidgetRenderer
                              widget={widget}
                              isEditMode={isEditMode}
                              onRemove={removeWidget}
                              onSettingsChange={updateWidgetSettings}
                              onChecklistItemChange={updateChecklistItem}
                              currentTime={currentTime}
                            />
                          </ResizableWidget>
                        </SortableWidget>
                      )) || []}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <div className="opacity-0">
                      <WidgetRenderer
                        widget={widgets.find(w => w.id === activeId)!}
                        isEditMode={isEditMode}
                        onRemove={removeWidget}
                        currentTime={currentTime}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {/* 빈 상태 */}
              {widgets.length === 0 && (
                <div className="text-center py-12 min-h-[calc(100vh-8rem)] flex flex-col justify-center">
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
      </div>

      {/* 모달들 */}
      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        selectedWidgetType={selectedWidgetType}
        newWidgetData={newWidgetData}
        setNewWidgetData={setNewWidgetData}
        onAddWidget={addWidget}
        faviconLoading={faviconLoading}
        setFaviconLoading={setFaviconLoading}
        faviconError={faviconError}
        setFaviconError={setFaviconError}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        dashboard={dashboard}
        backgroundOptions={backgroundOptions}
        onUpdateBackground={updateDashboardBackground}
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
        isGuestMode={isGuestMode}
        onShowLoginModal={handleShowLoginModal}
        onImportSuccess={() => {
          loadDashboard()
          setIsSettingsModalOpen(false)
        }}
      />
      
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginFromModal}
        onSignUp={handleSignUpFromModal}
        title="로그인이 필요합니다"
        message="이 기능을 사용하려면 로그인이 필요합니다."
      />

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