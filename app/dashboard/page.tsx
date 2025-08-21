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
import { ImageUpload } from '@/lib/components/ui/image-upload'
import { DataManager } from '@/lib/components/dashboard/DataManager'
import { LoginModal } from '@/lib/components/ui/login-modal'
import { useAuth } from '@/lib/hooks'
import { useToast } from '@/lib/hooks/use-toast'
import { guestStorage } from '@/lib/utils/guestStorage'
import UserNameEditor from '@/lib/components/profile/UserNameEditor'
import { ThemeToggle } from '@/lib/components/ui/theme-toggle'
import WeatherWidget from '@/lib/components/widgets/WeatherWidget'
import MemoWidget from '@/lib/components/widgets/MemoWidget'
import SearchWidget from '@/lib/components/widgets/SearchWidget'
import CalendarWidget from '@/lib/components/widgets/CalendarWidget'
import ResizableWidget from '@/lib/components/widgets/ResizableWidget'
import SortableWidget from '@/lib/components/widgets/SortableWidget'
import { 
  Plus, Edit, Save, Settings, Grid, Layout, Clock, 
  Link as LinkIcon, List, LogOut, Cloud, FileText, 
  Search, Palette, Download, Upload, Moon, Sun, Calendar as CalendarIcon
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
  ICalendarSettings,
  IBackgroundOption
} from '@/types'
import { normalizeUrl, extractDomain, detectUrlType, getRecommendedIcon } from '@/lib/utils/urlUtils'

// 기본 위젯 타입 정의
interface IChecklistItem {
  id: string
  text: string
  completed: boolean
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading, isGuestMode, exitGuestMode } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const hasRedirectedRef = useRef(false)

  // 로그인 모달 표시 함수
  const handleShowLoginModal = () => {
    setIsLoginModalOpen(true)
  }

  // 로그인 모달에서 로그인 처리
  const handleLoginFromModal = () => {
    setIsLoginModalOpen(false)
    window.location.href = '/'
  }

  // 로그인 모달에서 회원가입 처리
  const handleSignUpFromModal = () => {
    setIsLoginModalOpen(false)
    window.location.href = '/signup'
  }

  // 로그인 리다이렉트 처리
  const handleLoginRedirect = () => {
    setIsLoginModalOpen(false)
    window.location.href = '/'
  }
  
  // 상태 관리
  const [dashboard, setDashboard] = useState<IDashboard | null>(null)
  const [widgets, setWidgets] = useState<IWidget[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  // 새 위젯 추가 폼 상태
  const [newWidgetData, setNewWidgetData] = useState<any>({})
  
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
        distance: 8, // 드래그 시작 거리
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
    if (isGuestMode) {
      // 게스트 모드: localStorage에서 사용자명 불러오기
      const guestUsername = localStorage.getItem('guest_username')
      setUserName(guestUsername || '게스트')
    } else if (user?.profile?.full_name) {
      setUserName(user.profile.full_name)
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
  }, [isAuthenticated])

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

  const loadDashboard = async () => {
    try {
      if (isGuestMode) {
        // 게스트 모드: localStorage에서 데이터 로드
        let guestData = guestStorage.loadData()
        
        if (!guestData) {
          // 게스트 데이터가 없으면 기본 데이터 생성
          guestData = guestStorage.createDefaultData()
          guestStorage.saveData(guestData)
        }
        
        // 게스트 데이터를 대시보드 형식으로 변환
        setDashboard({
          id: 'guest-dashboard',
          user_id: 'guest',
          name: 'Guest Dashboard',
          background_type: guestData.dashboard.background_type,
          background_value: guestData.dashboard.background_value,
          layout_settings: guestData.dashboard.layout_settings,
          created_at: guestData.createdAt,
          updated_at: guestData.createdAt
        })
        
        setWidgets(guestData.widgets.map(w => ({
          ...w,
          dashboard_id: 'guest-dashboard',
          created_at: guestData.createdAt,
          updated_at: guestData.createdAt
        })))
      } else {
        // 일반 모드: API에서 데이터 로드
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
    console.log('드래그 시작:', event.active.id)
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('드래그 종료:', event)
    setActiveId(null)
    
    const { active, over } = event
    
    console.log('Active ID:', active.id, 'Over ID:', over?.id)
    
    if (over && active.id !== over.id) {
      const activeWidget = widgets.find(w => w.id === active.id)
      const overWidget = widgets.find(w => w.id === over.id)
      
      console.log('Active Widget:', activeWidget)
      console.log('Over Widget:', overWidget)
      
      if (activeWidget && overWidget) {
        // 두 위젯의 위치를 간단히 교체
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
        
        console.log('업데이트된 위젯들:', updatedWidgets)
        setWidgets(updatedWidgets)
        saveWidgetPositions(updatedWidgets)
      }
    } else {
      console.log('드래그 취소 또는 같은 위치')
    }
  }

  const saveWidgetPositions = async (updatedWidgets: IWidget[]) => {
    if (isGuestMode) {
      // 게스트 모드: localStorage에 위치 정보 저장
      const positions = updatedWidgets.map(w => ({
        id: w.id,
        position_x: w.position_x,
        position_y: w.position_y
      }))
      guestStorage.updateWidgetPositions(positions)
    } else {
      // 일반 모드: API 호출
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
  }

  const handleWidgetResize = async (widgetId: string, width: number, height: number) => {
    try {
      if (isGuestMode) {
        // 게스트 모드: localStorage에 크기 정보 저장
        guestStorage.updateWidget(widgetId, { width, height })
        
        // 로컬 상태 업데이트
        setWidgets(widgets.map(widget => 
          widget.id === widgetId 
            ? { ...widget, width, height }
            : widget
        ))
        
        toast({
          title: '성공',
          description: '위젯 크기가 변경되었습니다.'
        })
      } else {
        // 일반 모드: API 호출
        const response = await fetch('/api/widgets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId,
            width,
            height
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          // 로컬 상태 업데이트
          setWidgets(widgets.map(widget => 
            widget.id === widgetId 
              ? { ...widget, width, height }
              : widget
          ))
          
          toast({
            title: '성공',
            description: '위젯 크기가 변경되었습니다.'
          })
        } else {
          toast({
            variant: 'destructive',
            title: '오류',
            description: result.error || '위젯 크기 변경에 실패했습니다.'
          })
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '위젯 크기 변경 중 오류가 발생했습니다.'
      })
    }
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
        const normalizedUrl = normalizeUrl(newWidgetData.url || 'https://example.com')
        const displayDomain = extractDomain(newWidgetData.url || 'https://example.com')
        const recommendedIcon = getRecommendedIcon(newWidgetData.url || 'https://example.com')
        
        settings = {
          url: normalizedUrl,
          title: newWidgetData.title || displayDomain || '새 링크',
          icon: newWidgetData.icon || recommendedIcon,
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
      if (width < 640) return 1 // sm
      if (width < 768) return 2 // md
      if (width < 1024) return 3 // lg
      if (width < 1280) return 4 // xl
      return 6 // 2xl 이상
    }

    // 뷰포트 높이에 따른 최대 행 수 계산 (네비게이션 바와 패딩 제외)
    const getMaxRows = () => {
      if (typeof window === 'undefined') return 4
      const availableHeight = window.innerHeight - 64 - 48 // navbar(64px) + padding(48px)
      const estimatedRowHeight = 200 // 위젯 기본 높이 + gap
      return Math.floor(availableHeight / estimatedRowHeight)
    }

    const maxCols = getMaxCols()
    const maxRows = getMaxRows()
    const maxWidgets = maxCols * maxRows

    // 이미 최대 위젯 수에 도달했는지 확인
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
      // 빈 위치가 없으면 첫 번째 위치에 배치
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
        // 게스트 모드: localStorage에 저장
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
          type: selectedWidgetType,
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
        // 일반 모드: API 호출
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

  const removeWidget = async (widgetId: string) => {
    try {
      if (isGuestMode) {
        // 게스트 모드: localStorage에서 삭제
        guestStorage.deleteWidget(widgetId)
        setWidgets(widgets.filter(w => w.id !== widgetId))
        toast({
          title: '성공',
          description: '위젯이 삭제되었습니다.'
        })
      } else {
        // 일반 모드: API 호출
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
      if (isGuestMode) {
        // 게스트 모드: localStorage에 저장
        guestStorage.updateDashboard({
          background_type: background.type,
          background_value: background.value
        })
        
        setDashboard({
          ...dashboard,
          background_type: background.type,
          background_value: background.value
        })
        
        toast({
          title: '성공',
          description: '배경이 변경되었습니다.'
        })
      } else {
        // 일반 모드: API 호출
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
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '배경 변경에 실패했습니다.'
      })
    }
  }

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

  const handleLayoutReset = async () => {
    if (!confirm('모든 위젯의 위치를 초기화하시겠습니까?')) {
      return
    }

    try {
      // 위젯들을 그리드 순서대로 재배치
      const updatedWidgets = widgets.map((widget, index) => ({
        ...widget,
        position_x: index % 4,
        position_y: Math.floor(index / 4)
      }))

      setWidgets(updatedWidgets)
      await saveWidgetPositions(updatedWidgets)

      toast({
        title: '성공',
        description: '레이아웃이 초기화되었습니다.'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '레이아웃 초기화에 실패했습니다.'
      })
    }
  }

  const updateChecklistItem = async (widgetId: string, itemId: string, completed: boolean) => {
    try {
      // 로컬 상태 업데이트
      setWidgets(widgets.map(widget => {
        if (widget.id === widgetId && widget.type === 'checklist') {
          const settings = widget.settings as IChecklistSettings
          const updatedItems = settings.items.map((item: IChecklistItem) =>
            item.id === itemId ? { ...item, completed } : item
          )
          return {
            ...widget,
            settings: { ...settings, items: updatedItems }
          }
        }
        return widget
      }))

      if (isGuestMode) {
        // 게스트 모드: localStorage에 저장
        const widget = widgets.find(w => w.id === widgetId)
        if (widget && widget.type === 'checklist') {
          const settings = widget.settings as IChecklistSettings
          const updatedItems = settings.items.map((item: IChecklistItem) =>
            item.id === itemId ? { ...item, completed } : item
          )
          guestStorage.updateWidget(widgetId, { 
            settings: { ...settings, items: updatedItems }
          })
        }
      } else {
        // 일반 모드: API 호출
        const widget = widgets.find(w => w.id === widgetId)
        if (widget && widget.type === 'checklist') {
          const settings = widget.settings as IChecklistSettings
          const updatedItems = settings.items.map((item: IChecklistItem) =>
            item.id === itemId ? { ...item, completed } : item
          )
          
          await fetch('/api/widgets', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              widgetId,
              settings: { ...settings, items: updatedItems }
            })
          })
        }
      }
    } catch (error) {
      console.error('체크리스트 업데이트 실패:', error)
      toast({
        variant: 'destructive',
        title: '오류',
        description: '체크리스트 업데이트에 실패했습니다.'
      })
    }
  }

  const updateWidgetSettings = async (widgetId: string, newSettings: IWidgetSettings) => {
    try {
      // 로컬 상태 업데이트
      setWidgets(widgets.map(widget =>
        widget.id === widgetId 
          ? { ...widget, settings: newSettings }
          : widget
      ))

      if (isGuestMode) {
        // 게스트 모드: localStorage에 저장
        guestStorage.updateWidget(widgetId, { settings: newSettings })
      } else {
        // 일반 모드: API 호출
        await fetch('/api/widgets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId,
            settings: newSettings
          })
        })
      }
    } catch (error) {
      console.error('위젯 설정 업데이트 실패:', error)
      toast({
        variant: 'destructive',
        title: '오류',
        description: '위젯 설정 업데이트에 실패했습니다.'
      })
    }
  }

  const renderWidget = (widget: IWidget) => {
    const baseProps = {
      isEditMode,
      onRemove: () => removeWidget(widget.id)
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
            onSettingsChange={(newSettings) => updateWidgetSettings(widget.id, newSettings)}
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
            onMouseDown={(e) => {
              // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
              if (isEditMode) {
                e.stopPropagation()
              }
            }}
          >
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
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
        
        const normalizedUrl = normalizeUrl(linkSettings.url)
        const displayUrl = extractDomain(linkSettings.url)
        const urlType = detectUrlType(linkSettings.url)
        const recommendedIcon = getRecommendedIcon(linkSettings.url)
        
        return (
          <Card 
            key={widget.id}
            className={`macos-widget p-6 relative animate-macos-fade-in ${isEditMode ? 'border-2 border-dashed border-blue-300 animate-macos-pulse' : ''}`}
            onMouseDown={(e) => {
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
              className="flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 transition-all duration-200 group"
              onClick={(e) => {
                // 검색인 경우 새 탭에서 열기
                if (urlType === 'search') {
                  e.preventDefault()
                  window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              <div className="flex-shrink-0">
                {linkSettings.icon && linkSettings.icon !== '🔗' ? (
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
          <Card 
            key={widget.id}
            className={`macos-widget p-6 relative animate-macos-fade-in ${isEditMode ? 'border-2 border-dashed border-blue-300 animate-macos-pulse' : ''}`}
            onMouseDown={(e) => {
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
                    onChange={() => updateChecklistItem(widget.id, item.id, !item.completed)}
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">제목</label>
                <Input
                  value={newWidgetData.title || ''}
                  onChange={(e) => setNewWidgetData({...newWidgetData, title: e.target.value})}
                  placeholder="링크 제목을 입력하세요"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">URL</label>
                <Input
                  value={newWidgetData.url || ''}
                  onChange={(e) => {
                    const url = e.target.value
                    setNewWidgetData({...newWidgetData, url})
                    
                    // URL이 입력되면 자동으로 아이콘과 제목 추천
                    if (url && !newWidgetData.title) {
                      const recommendedIcon = getRecommendedIcon(url)
                      const domain = extractDomain(url)
                      
                      setNewWidgetData(prev => ({
                        ...prev,
                        url,
                        icon: prev.icon || recommendedIcon,
                        title: prev.title || domain || '새 링크'
                      }))
                    }
                  }}
                  placeholder="다양한 형태의 URL을 입력하세요"
                  className="form-input"
                />
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">아이콘 (선택사항)</label>
                <div className="flex space-x-2">
                  <Input
                    value={newWidgetData.icon || ''}
                    onChange={(e) => setNewWidgetData({...newWidgetData, icon: e.target.value})}
                    placeholder="🔗"
                    className="form-input flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newWidgetData.url) {
                        setNewWidgetData({...newWidgetData, icon: getRecommendedIcon(newWidgetData.url)})
                      }
                    }}
                    className="px-3"
                  >
                    추천
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['🔗', '🌐', '📚', '💼', '🎯', '⚡', '🔧', '📊', '🎨', '🎵', '📺', '🎮'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewWidgetData({...newWidgetData, icon: emoji})}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
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
            <Button variant="outline" onClick={() => setIsAddWidgetModalOpen(false)} className="macos-button-secondary">
              취소
            </Button>
            <Button onClick={addWidget} className="macos-button">
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
        <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {/* 배경 설정 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">배경 설정</h3>
            
            {/* 이미지 업로드 섹션 */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">사용자 정의 이미지</h4>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={
                  dashboard?.background_type === 'image' 
                    ? dashboard.background_value.replace(/^url\(|\)$/g, '').replace(/['"]/g, '')
                    : undefined
                }
                onRemove={handleImageRemove}
                className="mb-3"
                isGuestMode={isGuestMode}
                onShowLoginModal={handleShowLoginModal}
              />
            </div>

            {/* 프리셋 배경들 */}
            <div>
              <h4 className="text-md font-medium mb-2">프리셋 배경</h4>
              <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
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

          {/* 데이터 관리 섹션 */}
          <DataManager 
            onImportSuccess={() => {
              loadDashboard()
              setIsSettingsModalOpen(false)
              toast({
                title: '성공',
                description: '페이지를 새로고침하여 변경사항을 확인하세요.'
              })
            }}
            isGuestMode={isGuestMode}
            onShowLoginModal={handleShowLoginModal}
          />

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
    <div className="h-screen overflow-hidden" style={backgroundStyle}>
      {/* macOS 스타일 상단 네비게이션 */}
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
        {/* macOS 스타일 사이드바 */}
        <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] glass-effect border-r border-white/20 dark:border-gray-800/40 transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 lg:w-80 md:w-72 sm:w-64 overflow-y-auto custom-scrollbar animate-macos-fade-in`}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">위젯 추가</h2>
            
            <div className="space-y-3">
              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('search')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">검색 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      통합 검색 (Google, Naver 등)
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('weather')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">날씨 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      현재 날씨 및 예보 정보
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('memo')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">메모 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      빠른 메모 작성 및 관리
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('link')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">링크 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      자주 사용하는 웹사이트 바로가기
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('checklist')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <List className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">체크리스트 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      할 일 목록 관리
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('clock')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">시계 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      현재 시간 표시
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
                onClick={() => openAddWidgetModal('calendar')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">캘린더 위젯</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      월별 캘린더 보기
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="h-6" />
            <Divider />
            <div className="h-6" />

            <h3 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">대시보드 설정</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Palette className="w-4 h-4 mr-2" />
                배경 및 테마 변경
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLayoutReset}
              >
                <Layout className="w-4 h-4 mr-2" />
                레이아웃 초기화
              </Button>
            </div>
          </div>
        </div>

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
                        // position_y(행)로 먼저 정렬, 같으면 position_x(열)로 정렬
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
                            {renderWidget(widget)}
                          </ResizableWidget>
                        </SortableWidget>
                      )) || []}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <div className="opacity-0">
                      {renderWidget(widgets.find(w => w.id === activeId)!)}
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
      {renderAddWidgetModal()}
      {renderSettingsModal()}
      
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