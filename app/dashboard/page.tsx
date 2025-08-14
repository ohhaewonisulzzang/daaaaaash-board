'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/lib/components/ui/button'
import { Card } from '@/lib/components/ui/card'
import { Navbar } from '@/lib/components/ui/navbar'
import { Modal } from '@/lib/components/ui/modal'
import { Input } from '@/lib/components/ui/input'
import { Select } from '@/lib/components/ui/select'
import { Checkbox } from '@/lib/components/ui/checkbox'
import { Badge } from '@/lib/components/ui/badge'
import { Spacer } from '@/lib/components/ui/spacer'
import { Divider } from '@/lib/components/ui/divider'
import { useAuth } from '@/lib/hooks'
import { Plus, Edit, Save, Settings, Grid, Layout, Clock, Link as LinkIcon, List, LogOut } from 'lucide-react'

interface IWidget {
  id: string
  type: 'link' | 'checklist' | 'clock'
  position: { x: number; y: number }
  size: { width: number; height: number }
  settings: any
}

interface IChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface ILinkSettings {
  url: string
  title: string
  icon?: string
}

interface IChecklistSettings {
  title: string
  items: IChecklistItem[]
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const hasRedirectedRef = useRef(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false)
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('')
  const [widgets, setWidgets] = useState<IWidget[]>([
    {
      id: '1',
      type: 'clock',
      position: { x: 0, y: 0 },
      size: { width: 2, height: 1 },
      settings: {}
    },
    {
      id: '2',
      type: 'link',
      position: { x: 2, y: 0 },
      size: { width: 2, height: 1 },
      settings: {
        url: 'https://google.com',
        title: 'Google',
        icon: '🔍'
      }
    },
    {
      id: '3',
      type: 'checklist',
      position: { x: 0, y: 1 },
      size: { width: 4, height: 2 },
      settings: {
        title: '할 일 목록',
        items: [
          { id: '1', text: '프로젝트 문서 작성', completed: false },
          { id: '2', text: '코드 리뷰', completed: true },
          { id: '3', text: '회의 준비', completed: false }
        ]
      }
    }
  ])

  // 새 위젯 추가 폼 상태
  const [newWidgetData, setNewWidgetData] = useState<any>({})

  // 인증 상태 확인 - 로딩 완료 후에만 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  // 로그아웃 처리
  const handleLogout = () => {
    logout()
    router.push('/')
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

  const addWidget = () => {
    const newWidget: IWidget = {
      id: Date.now().toString(),
      type: selectedWidgetType as any,
      position: { x: 0, y: Math.max(...widgets.map(w => w.position.y + w.size.height), 0) },
      size: selectedWidgetType === 'clock' ? { width: 2, height: 1 } : 
             selectedWidgetType === 'link' ? { width: 2, height: 1 } : 
             { width: 4, height: 2 },
      settings: newWidgetData
    }

    setWidgets([...widgets, newWidget])
    setIsAddWidgetModalOpen(false)
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  const toggleChecklistItem = (widgetId: string, itemId: string) => {
    setWidgets(widgets.map(widget => {
      if (widget.id === widgetId && widget.type === 'checklist') {
        const updatedItems = widget.settings.items.map((item: IChecklistItem) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
        return {
          ...widget,
          settings: { ...widget.settings, items: updatedItems }
        }
      }
      return widget
    }))
  }

  const renderWidget = (widget: IWidget) => {
    const cardClass = `relative transition-all duration-200 ${
      isEditMode ? 'border-2 border-dashed border-blue-300' : ''
    }`

    switch (widget.type) {
      case 'clock':
        return (
          <Card key={widget.id} className={cardClass} style={{
            gridColumn: `span ${widget.size.width}`,
            gridRow: `span ${widget.size.height}`
          }}>
            <div className="p-6 text-center">
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
          <Card key={widget.id} className={cardClass} style={{
            gridColumn: `span ${widget.size.width}`,
            gridRow: `span ${widget.size.height}`
          }}>
            <div className="p-6">
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

      case 'checklist':
        const checklistSettings = widget.settings as IChecklistSettings
        return (
          <Card key={widget.id} className={cardClass} style={{
            gridColumn: `span ${widget.size.width}`,
            gridRow: `span ${widget.size.height}`
          }}>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <List className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">{checklistSettings.title}</h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {checklistSettings.items.map((item: IChecklistItem) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(widget.id, item.id)}
                    />
                    <span className={item.completed ? 'line-through text-gray-500' : ''}>
                      {item.text}
                    </span>
                  </div>
                ))}
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

  // 인증되지 않은 사용자는 렌더링하지 않음
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <div className="text-sm text-gray-600">
                안녕하세요, <span className="font-medium">{user.name}</span>님
              </div>
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
            <Button variant="ghost" size="sm">
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
              <Button variant="outline" className="w-full justify-start">
                <Layout className="w-4 h-4 mr-2" />
                배경 변경
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Grid className="w-4 h-4 mr-2" />
                레이아웃 초기화
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
            <div className="grid grid-cols-4 gap-4 auto-rows-fr">
              {widgets.map(renderWidget)}
            </div>

            {/* 빈 상태 */}
            {widgets.length === 0 && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  위젯을 추가해보세요
                </h3>
                <p className="text-gray-500 mb-6">
                  왼쪽 사이드바에서 원하는 위젯을 선택하여 대시보드를 구성하세요
                </p>
                <Button onClick={toggleSidebar}>
                  <Plus className="w-4 h-4 mr-2" />
                  위젯 추가하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 위젯 추가 모달 */}
      {renderAddWidgetModal()}

      {/* 사이드바 오버레이 (모바일) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-5 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}