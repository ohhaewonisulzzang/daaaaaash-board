// 게스트 모드 전용 데이터 저장소
interface IGuestWidget {
  id: string
  type: string
  position_x: number
  position_y: number
  width: number
  height: number
  settings: any
}

interface IGuestDashboard {
  background_type: string
  background_value: string
  layout_settings: {
    gap: number
    gridCols: number
    gridRows: string
  }
}

interface IGuestData {
  dashboard: IGuestDashboard
  widgets: IGuestWidget[]
  createdAt: string
}

const GUEST_STORAGE_KEY = 'personaldash_guest_data'

export const guestStorage = {
  // 게스트 데이터 저장
  saveData(data: IGuestData): void {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('게스트 데이터 저장 실패:', error)
    }
  },

  // 게스트 데이터 불러오기
  loadData(): IGuestData | null {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('게스트 데이터 불러오기 실패:', error)
      return null
    }
  },

  // 게스트 데이터 삭제
  clearData(): void {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY)
    } catch (error) {
      console.error('게스트 데이터 삭제 실패:', error)
    }
  },

  // 게스트 모드 활성화 상태 확인
  isGuestMode(): boolean {
    return localStorage.getItem('is_guest_mode') === 'true'
  },

  // 게스트 모드 활성화
  enableGuestMode(): void {
    localStorage.setItem('is_guest_mode', 'true')
  },

  // 게스트 모드 비활성화
  disableGuestMode(): void {
    localStorage.removeItem('is_guest_mode')
    this.clearData()
  },

  // 기본 게스트 데이터 생성
  createDefaultData(): IGuestData {
    return {
      dashboard: {
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        layout_settings: {
          gap: 16,
          gridCols: 4,
          gridRows: 'auto'
        }
      },
      widgets: [
        {
          id: 'guest-search-widget',
          type: 'search',
          position_x: 0,
          position_y: 0,
          width: 2,
          height: 1,
          settings: {}
        },
        {
          id: 'guest-clock-widget',
          type: 'clock',
          position_x: 2,
          position_y: 0,
          width: 1,
          height: 1,
          settings: {}
        },
        {
          id: 'guest-checklist-widget',
          type: 'checklist',
          position_x: 0,
          position_y: 1,
          width: 2,
          height: 2,
          settings: {
            items: [
              { id: '1', text: 'PersonalDash 체험해보기', completed: false },
              { id: '2', text: '위젯 추가해보기', completed: false },
              { id: '3', text: '배경 변경해보기', completed: false }
            ]
          }
        }
      ],
      createdAt: new Date().toISOString()
    }
  },

  // 위젯 추가
  addWidget(widget: Omit<IGuestWidget, 'id'>): string {
    const data = this.loadData() || this.createDefaultData()
    const newWidget: IGuestWidget = {
      ...widget,
      id: `guest-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    data.widgets.push(newWidget)
    this.saveData(data)
    return newWidget.id
  },

  // 위젯 업데이트
  updateWidget(id: string, updates: Partial<IGuestWidget>): void {
    const data = this.loadData()
    if (!data) return

    const widgetIndex = data.widgets.findIndex(w => w.id === id)
    if (widgetIndex >= 0) {
      data.widgets[widgetIndex] = { ...data.widgets[widgetIndex], ...updates }
      this.saveData(data)
    }
  },

  // 위젯 삭제
  deleteWidget(id: string): void {
    const data = this.loadData()
    if (!data) return

    data.widgets = data.widgets.filter(w => w.id !== id)
    this.saveData(data)
  },

  // 대시보드 설정 업데이트
  updateDashboard(updates: Partial<IGuestDashboard>): void {
    const data = this.loadData() || this.createDefaultData()
    data.dashboard = { ...data.dashboard, ...updates }
    this.saveData(data)
  },

  // 모든 위젯 위치 업데이트 (드래그앤드롭용)
  updateWidgetPositions(positions: Array<{id: string, position_x: number, position_y: number}>): void {
    const data = this.loadData()
    if (!data) return

    positions.forEach(pos => {
      const widget = data.widgets.find(w => w.id === pos.id)
      if (widget) {
        widget.position_x = pos.position_x
        widget.position_y = pos.position_y
      }
    })
    this.saveData(data)
  }
}

export type { IGuestWidget, IGuestDashboard, IGuestData }