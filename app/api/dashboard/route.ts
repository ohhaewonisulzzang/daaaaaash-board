import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IDashboard, IWidget } from '@/types'

// 대시보드 조회
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 사용자의 대시보드 조회 (없으면 자동 생성)
    let { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // 대시보드가 없으면 기본 대시보드 생성
    if (dashboardError || !dashboard) {
      const { data: newDashboard, error: createError } = await supabase
        .from('dashboards')
        .insert({
          user_id: user.id,
          name: 'My Dashboard',
          background_type: 'gradient',
          background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          layout_settings: { gridCols: 4, gridRows: 'auto', gap: 16 }
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: '대시보드 생성에 실패했습니다.' }, { status: 500 })
      }
      
      dashboard = newDashboard

      // 기본 위젯들 생성
      const defaultWidgets = [
        {
          dashboard_id: dashboard.id,
          type: 'clock',
          position_x: 0,
          position_y: 0,
          width: 2,
          height: 1,
          settings: { format: '24h', showDate: true, showSeconds: false }
        },
        {
          dashboard_id: dashboard.id,
          type: 'search',
          position_x: 2,
          position_y: 0,
          width: 2,
          height: 1,
          settings: {
            engines: [
              { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
              { id: 'naver', name: 'Naver', url: 'https://search.naver.com/search.naver?query=', icon: 'N' }
            ],
            defaultEngine: 'google',
            placeholder: '검색어를 입력하세요...'
          }
        },
        {
          dashboard_id: dashboard.id,
          type: 'checklist',
          position_x: 0,
          position_y: 1,
          width: 4,
          height: 2,
          settings: {
            title: '할 일 목록',
            items: [
              { id: '1', text: 'PersonalDash 사용법 익히기', completed: false },
              { id: '2', text: '위젯 추가해보기', completed: false },
              { id: '3', text: '대시보드 커스터마이징', completed: false }
            ]
          }
        }
      ]

      await supabase.from('widgets').insert(defaultWidgets)
    }

    // 위젯들 조회
    const { data: widgets, error: widgetsError } = await supabase
      .from('widgets')
      .select('*')
      .eq('dashboard_id', dashboard.id)
      .order('position_y')
      .order('position_x')

    if (widgetsError) {
      return NextResponse.json({ error: '위젯 조회에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        widgets: widgets || []
      }
    })

  } catch (error) {
    console.error('Dashboard GET error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 대시보드 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const updates = await request.json()
    
    // 허용된 필드만 업데이트
    const allowedFields = ['name', 'background_type', 'background_value', 'layout_settings']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 })
    }

    const { data: dashboard, error: updateError } = await supabase
      .from('dashboards')
      .update(filteredUpdates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: '대시보드 업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: dashboard,
      message: '대시보드가 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('Dashboard PATCH error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}