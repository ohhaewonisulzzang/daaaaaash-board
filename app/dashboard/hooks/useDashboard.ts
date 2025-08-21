import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks'
import { useToast } from '@/lib/hooks/use-toast'
import { guestStorage } from '@/lib/utils/guestStorage'
import { IDashboard, IWidget, ILayoutSettings } from '@/types'

export function useDashboard() {
  const { isGuestMode } = useAuth()
  const { toast } = useToast()
  const [dashboard, setDashboard] = useState<IDashboard | null>(null)
  const [widgets, setWidgets] = useState<IWidget[]>([])
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)

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
          background_type: guestData.dashboard.background_type as 'color' | 'gradient' | 'image',
          background_value: guestData.dashboard.background_value,
          layout_settings: guestData.dashboard.layout_settings as ILayoutSettings,
          created_at: guestData.createdAt,
          updated_at: guestData.createdAt
        })
        
        setWidgets(guestData.widgets.map(w => ({
          ...w,
          type: w.type as 'link' | 'checklist' | 'clock' | 'weather' | 'calendar' | 'search' | 'memo',
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

  return {
    dashboard,
    setDashboard,
    widgets,
    setWidgets,
    isDashboardLoading,
    loadDashboard
  }
}