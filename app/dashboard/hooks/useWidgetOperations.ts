import { useState } from 'react'
import { useAuth } from '@/lib/hooks'
import { useToast } from '@/lib/hooks/use-toast'
import { guestStorage } from '@/lib/utils/guestStorage'
import { 
  IWidget, 
  IWidgetSettings, 
  IChecklistSettings, 
  IChecklistItem,
  IDashboard,
  IBackgroundOption
} from '@/types'

export function useWidgetOperations(
  widgets: IWidget[],
  setWidgets: React.Dispatch<React.SetStateAction<IWidget[]>>,
  dashboard: IDashboard | null,
  setDashboard: React.Dispatch<React.SetStateAction<IDashboard | null>>
) {
  const { isGuestMode } = useAuth()
  const { toast } = useToast()
  const [newWidgetData, setNewWidgetData] = useState<any>({})
  const [faviconLoading, setFaviconLoading] = useState(false)
  const [faviconError, setFaviconError] = useState<string | null>(null)

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

  return {
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
  }
}