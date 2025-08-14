import fs from 'fs'
import path from 'path'

// 파일 기반 저장소 경로 (개발 모드에서 Hot Reload 대응)
const STORAGE_FILE = path.join(process.cwd(), 'temp', 'verification-codes.json')

// 디렉토리가 없으면 생성
const ensureStorageDir = () => {
  const dir = path.dirname(STORAGE_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 인증 코드 저장소 로드
const loadVerificationCodes = (): Map<string, { code: string, expires: number }> => {
  try {
    ensureStorageDir()
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      const entries = JSON.parse(data)
      return new Map(entries)
    }
  } catch (error) {
    console.error('인증 코드 로드 실패:', error)
  }
  return new Map()
}

// 인증 코드 저장소 저장
const saveVerificationCodes = (codes: Map<string, { code: string, expires: number }>) => {
  try {
    ensureStorageDir()
    const entries = Array.from(codes.entries())
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(entries, null, 2))
  } catch (error) {
    console.error('인증 코드 저장 실패:', error)
  }
}

// 인증 코드 저장소 (Hot Reload 대응)
export let verificationCodes = loadVerificationCodes()

// 6자리 랜덤 인증 코드 생성
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 인증 코드 설정
export function setVerificationCode(email: string, code: string, expirationMinutes: number = 10): void {
  // 최신 상태 로드
  verificationCodes = loadVerificationCodes()
  
  const expires = Date.now() + expirationMinutes * 60 * 1000
  verificationCodes.set(email, { code, expires })
  
  // 파일에 저장
  saveVerificationCodes(verificationCodes)
  
  console.log(`💾 코드 저장됨: ${email} -> ${code} (만료: ${new Date(expires).toISOString()})`)
  console.log(`💾 현재 저장된 코드 수: ${verificationCodes.size}`)
}

// 인증 코드 검증
export function verifyCode(email: string, code: string): { success: boolean; message: string } {
  // 최신 상태 로드
  verificationCodes = loadVerificationCodes()
  
  console.log(`🔍 코드 검증 시도: ${email} -> ${code}`)
  console.log(`🔍 현재 저장된 코드 수: ${verificationCodes.size}`)
  console.log(`🔍 저장된 모든 코드:`, Array.from(verificationCodes.entries()))
  
  const stored = verificationCodes.get(email)
  
  if (!stored) {
    console.log(`❌ 코드 없음: ${email}`)
    return { success: false, message: '인증 코드가 존재하지 않습니다. 다시 요청해주세요.' }
  }
  
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email)
    saveVerificationCodes(verificationCodes) // 파일에 저장
    return { success: false, message: '인증 코드가 만료되었습니다. 다시 요청해주세요.' }
  }
  
  if (stored.code !== code) {
    return { success: false, message: '인증 코드가 올바르지 않습니다.' }
  }
  
  // 인증 성공 시 코드 삭제
  verificationCodes.delete(email)
  saveVerificationCodes(verificationCodes) // 파일에 저장
  return { success: true, message: '인증이 완료되었습니다.' }
}

// 코드 존재 확인
export function hasVerificationCode(email: string): boolean {
  // 최신 상태 로드
  verificationCodes = loadVerificationCodes()
  
  const stored = verificationCodes.get(email)
  if (!stored) return false
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email)
    saveVerificationCodes(verificationCodes) // 파일에 저장
    return false
  }
  return true
}