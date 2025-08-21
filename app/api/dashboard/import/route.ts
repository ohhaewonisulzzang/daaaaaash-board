import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ImportData {
  version: string
  exportDate: string
  user: {
    id: string
    email: string
  }
  dashboard: {
    id?: string
    name?: string
    background_type?: string
    background_value?: string
    layout_settings?: any
  }
  widgets: Array<{
    id?: string
    type: string
    position_x: number
    position_y: number
    width: number
    height: number
    settings?: any
  }>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 요청에서 파일 데이터 가져오기
    const body = await request.json()
    const importData: ImportData = body

    // 데이터 유효성 검사
    if (!importData.version || !importData.dashboard || !Array.isArray(importData.widgets)) {
      return NextResponse.json({ error: '잘못된 백업 파일 형식입니다' }, { status: 400 })
    }

    // 버전 호환성 검사
    if (importData.version !== '1.0') {
      return NextResponse.json({ error: '지원하지 않는 백업 파일 버전입니다' }, { status: 400 })
    }

    // 트랜잭션으로 처리
    try {
      // 1. 사용자의 대시보드 가져오기 또는 생성
      let { data: dashboard, error: dashboardError } = await supabase
        .from('dashboards')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (dashboardError && dashboardError.code === 'PGRST116') {
        // 대시보드가 없으면 생성
        const { data: newDashboard, error: createError } = await supabase
          .from('dashboards')
          .insert({
            user_id: user.id,
            name: importData.dashboard.name || 'My Dashboard',
            background_type: importData.dashboard.background_type || 'gradient',
            background_value: importData.dashboard.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            layout_settings: importData.dashboard.layout_settings || { gap: 16, gridCols: 4, gridRows: 'auto' }
          })
          .select('id')
          .single()

        if (createError) {
          throw new Error('대시보드 생성 실패')
        }
        dashboard = newDashboard
      } else if (dashboardError) {
        throw new Error('대시보드 조회 실패')
      } else {
        // 기존 대시보드 업데이트
        const { error: updateError } = await supabase
          .from('dashboards')
          .update({
            name: importData.dashboard.name || 'My Dashboard',
            background_type: importData.dashboard.background_type || 'gradient',
            background_value: importData.dashboard.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            layout_settings: importData.dashboard.layout_settings || { gap: 16, gridCols: 4, gridRows: 'auto' },
            updated_at: new Date().toISOString()
          })
          .eq('id', dashboard.id)

        if (updateError) {
          throw new Error('대시보드 업데이트 실패')
        }
      }

      // 2. 기존 위젯 삭제
      const { error: deleteWidgetsError } = await supabase
        .from('widgets')
        .delete()
        .eq('dashboard_id', dashboard.id)

      if (deleteWidgetsError) {
        throw new Error('기존 위젯 삭제 실패')
      }

      // 3. 새 위젯 추가
      if (importData.widgets.length > 0) {
        const widgetsToInsert = importData.widgets.map(widget => ({
          dashboard_id: dashboard.id,
          type: widget.type,
          position_x: widget.position_x,
          position_y: widget.position_y,
          width: widget.width,
          height: widget.height,
          settings: widget.settings || {}
        }))

        const { error: insertWidgetsError } = await supabase
          .from('widgets')
          .insert(widgetsToInsert)

        if (insertWidgetsError) {
          throw new Error('위젯 가져오기 실패')
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: '백업 데이터를 성공적으로 가져왔습니다',
        importedWidgets: importData.widgets.length
      })

    } catch (transactionError) {
      console.error('Transaction error:', transactionError)
      return NextResponse.json({ 
        error: `데이터 가져오기 실패: ${transactionError.message}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: '데이터 가져오기에 실패했습니다' }, { status: 500 })
  }
}