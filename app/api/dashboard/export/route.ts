import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 사용자의 대시보드와 위젯 가져오기
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select(`
        *,
        widgets:widgets(*)
      `)
      .eq('user_id', user.id)
      .single()

    if (dashboardError && dashboardError.code !== 'PGRST116') {
      console.error('대시보드 조회 오류:', dashboardError)
      return NextResponse.json({ error: '대시보드 데이터를 가져올 수 없습니다' }, { status: 500 })
    }

    const widgets = dashboard?.widgets || []

    // 내보낼 데이터 구성
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      },
      dashboard: {
        id: dashboard?.id,
        name: dashboard?.name || 'My Dashboard',
        background_type: dashboard?.background_type || 'gradient',
        background_value: dashboard?.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        layout_settings: dashboard?.layout_settings || { gap: 16, gridCols: 4, gridRows: 'auto' }
      },
      widgets: widgets.map(widget => ({
        id: widget.id,
        type: widget.type,
        position_x: widget.position_x,
        position_y: widget.position_y,
        width: widget.width,
        height: widget.height,
        settings: widget.settings || {}
      }))
    }

    // JSON 응답 반환
    const fileName = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: '데이터 내보내기에 실패했습니다' }, { status: 500 })
  }
}