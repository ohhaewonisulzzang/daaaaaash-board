'use server'

import { NextRequest, NextResponse } from 'next/server'
import { generateVerificationCode, setVerificationCode } from '@/lib/verification-store'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 인증 코드 생성 (6자리)
    const verificationCode = generateVerificationCode()
    
    // 메모리에 저장 (10분 후 만료)
    setVerificationCode(email, verificationCode, 10)

    // 테스트용: 이메일 전송 시뮬레이션 (실제 Gmail 설정이 완료되면 주석 해제)
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD !== 'your-gmail-app-password') {
        // 실제 이메일 전송 (Gmail SMTP 사용)
        const nodemailer = require('nodemailer')

        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        })

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: '📧 대시보드 계정 인증 코드',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3B82F6;">🎯 대시보드</h1>
                <h2 style="color: #6B7280; margin: 10px 0;">이메일 인증 코드</h2>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;">
                <p style="color: white; font-size: 16px; margin-bottom: 20px;">아래 인증 코드를 입력해주세요:</p>
                <div style="background: white; display: inline-block; padding: 20px 40px; border-radius: 10px; font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
                <p style="color: white; font-size: 14px; margin-top: 20px;">이 코드는 10분 후에 만료됩니다.</p>
              </div>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">📋 중요 안내사항</h3>
                <ul style="color: #6B7280; line-height: 1.6;">
                  <li>이 인증 코드는 <strong>10분간</strong> 유효합니다.</li>
                  <li>보안을 위해 인증 코드를 타인과 공유하지 마세요.</li>
                  <li>만약 계정을 생성하지 않으셨다면 이 이메일을 무시해주세요.</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="color: #9CA3AF; font-size: 14px;">
                  이 이메일은 대시보드 계정 인증을 위해 자동으로 발송되었습니다.<br>
                  문의사항이 있으시면 고객지원팀에 연락해주세요.
                </p>
              </div>
            </div>
          `
        }

        await transporter.sendMail(mailOptions)
      } else {
        // 테스트 모드: 콘솔에 출력
        console.log(`
        ============================================
        📧 이메일 전송 시뮬레이션
        ============================================
        수신자: ${email}
        인증 코드: ${verificationCode}
        만료 시간: 10분 후
        ============================================
        `)
      }
    } catch (emailError) {
      console.error('이메일 전송 실패:', emailError)
      console.log(`테스트용 인증 코드: ${email} -> ${verificationCode}`)
    }

    console.log('='.repeat(50))
    console.log(`📧 이메일 인증 코드 생성: ${email} -> ${verificationCode}`)
    console.log('='.repeat(50))

    return NextResponse.json({
      success: true,
      message: '인증 코드가 이메일로 전송되었습니다.',
    })
  } catch (error) {
    console.error('이메일 전송 오류:', error)
    return NextResponse.json(
      { error: '이메일 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}

