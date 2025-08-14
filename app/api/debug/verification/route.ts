'use server'

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // 개발 환경에서만 디버깅 정보 제공
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      )
    }

    // 파일에서 인증 코드 로드
    const STORAGE_FILE = path.join(process.cwd(), 'temp', 'verification-codes.json')
    let codes: any[] = []
    
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      const entries = JSON.parse(data)
      codes = entries.map(([email, data]: [string, { code: string, expires: number }]) => ({
        email,
        code: data.code,
        expires: new Date(data.expires).toISOString(),
        isExpired: Date.now() > data.expires
      }))
    }

    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Debug verification error:', error)
    return NextResponse.json(
      { error: 'Debug failed' },
      { status: 500 }
    )
  }
}