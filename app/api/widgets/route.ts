import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IWidget } from '@/types'

// 위젯 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const widgetData = await request.json()
    
    // 필수 필드 검증
    const requiredFields = ['dashboard_id', 'type', 'position_x', 'position_y', 'width', 'height', 'settings']
    for (const field of requiredFields) {
      if (!(field in widgetData)) {
        return NextResponse.json({ error: `${field}가 필요합니다.` }, { status: 400 })
      }
    }

    // 대시보드 소유권 확인
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('id')
      .eq('id', widgetData.dashboard_id)
      .eq('user_id', user.id)
      .single()

    if (dashboardError || !dashboard) {
      return NextResponse.json({ error: '대시보드를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 위젯 생성
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .insert({
        dashboard_id: widgetData.dashboard_id,
        type: widgetData.type,
        position_x: widgetData.position_x,
        position_y: widgetData.position_y,
        width: widgetData.width,
        height: widgetData.height,
        settings: widgetData.settings
      })
      .select()
      .single()

    if (widgetError) {
      return NextResponse.json({ error: '위젯 생성에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: widget,
      message: '위젯이 생성되었습니다.'
    })

  } catch (error) {
    console.error('Widget POST error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 위젯 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { widgetId, ...updates } = await request.json()
    
    if (!widgetId) {
      return NextResponse.json({ error: 'widgetId가 필요합니다.' }, { status: 400 })
    }

    // 위젯 소유권 확인
    const { data: widget, error: widgetCheckError } = await supabase
      .from('widgets')
      .select(`
        id,
        dashboard_id,
        dashboards!inner(user_id)
      `)
      .eq('id', widgetId)
      .single()

    if (widgetCheckError || !widget || widget.dashboards.user_id !== user.id) {
      return NextResponse.json({ error: '위젯을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 허용된 필드만 업데이트
    const allowedFields = ['type', 'position_x', 'position_y', 'width', 'height', 'settings']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 })
    }

    const { data: updatedWidget, error: updateError } = await supabase
      .from('widgets')
      .update(filteredUpdates)
      .eq('id', widgetId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: '위젯 업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedWidget,
      message: '위젯이 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('Widget PATCH error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 위젯 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { widgetId } = await request.json()
    
    if (!widgetId) {
      return NextResponse.json({ error: 'widgetId가 필요합니다.' }, { status: 400 })
    }

    // 위젯 소유권 확인 후 삭제
    const { error: deleteError } = await supabase
      .from('widgets')
      .delete()
      .eq('id', widgetId)
      .eq('dashboard_id', await supabase
        .from('dashboards')
        .select('id')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => data?.id)
      )

    if (deleteError) {
      return NextResponse.json({ error: '위젯 삭제에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '위젯이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Widget DELETE error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}