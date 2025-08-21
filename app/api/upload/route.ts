import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 선택되지 않았습니다.' }, { status: 400 })
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 })
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원되는 파일 형식: JPG, PNG, WebP, GIF' 
      }, { status: 400 })
    }

    // 파일명 생성 (사용자ID + 타임스탬프 + 확장자)
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${user.id}_${timestamp}.${extension}`
    const filePath = `backgrounds/${fileName}`

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dashboard-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('파일 업로드 오류:', uploadError)
      return NextResponse.json({ 
        error: '파일 업로드에 실패했습니다.' 
      }, { status: 500 })
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('dashboard-assets')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        fileName: fileName,
        filePath: filePath
      },
      message: '이미지가 성공적으로 업로드되었습니다.'
    })

  } catch (error) {
    console.error('이미지 업로드 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

// 이미지 삭제 (선택적)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { filePath } = await request.json()
    
    if (!filePath) {
      return NextResponse.json({ error: '파일 경로가 필요합니다.' }, { status: 400 })
    }

    // 파일 삭제
    const { error: deleteError } = await supabase.storage
      .from('dashboard-assets')
      .remove([filePath])

    if (deleteError) {
      console.error('파일 삭제 오류:', deleteError)
      return NextResponse.json({ 
        error: '파일 삭제에 실패했습니다.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '이미지가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('이미지 삭제 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}