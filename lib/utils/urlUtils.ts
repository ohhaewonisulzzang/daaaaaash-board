/**
 * URL 처리 및 유효성 검증 유틸리티
 */

// URL 형태별 패턴 정의
const URL_PATTERNS = {
  // HTTP/HTTPS URL
  http: /^https?:\/\/.+/i,
  // 도메인만 있는 경우 (www.example.com, example.com)
  domain: /^(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|xn--[a-zA-Z0-9]+)(?:\/.*)?$/,
  // IP 주소 (192.168.1.1, 127.0.0.1:3000)
  ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?(?:\/.*)?$/,
  // localhost (localhost, localhost:3000, localhost/path)
  localhost: /^localhost(?::\d+)?(?:\/.*)?$/i,
  // 파일 경로 (file://, C:\, /home/)
  file: /^(?:file:\/\/|[a-zA-Z]:\\|\/[^\/])/,
  // 특수 프로토콜 (ftp://, mailto:, tel:)
  protocol: /^[a-zA-Z][a-zA-Z0-9+.-]*:/,
  // 포트번호가 있는 주소 (:3000, :8080)
  port: /^:\d+(?:\/.*)?$/
}

/**
 * URL을 정규화하여 올바른 형태로 변환
 * @param url 입력된 URL
 * @returns 정규화된 URL
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return 'https://example.com'
  }

  // 공백 제거
  const trimmedUrl = url.trim()
  
  if (!trimmedUrl) {
    return 'https://example.com'
  }

  // 이미 완전한 URL인 경우
  if (URL_PATTERNS.http.test(trimmedUrl)) {
    return trimmedUrl
  }

  // 특수 프로토콜이 있는 경우 (mailto:, tel:, ftp: 등)
  if (URL_PATTERNS.protocol.test(trimmedUrl)) {
    return trimmedUrl
  }

  // 파일 경로인 경우
  if (URL_PATTERNS.file.test(trimmedUrl)) {
    return trimmedUrl.startsWith('file://') ? trimmedUrl : `file://${trimmedUrl}`
  }

  // 포트번호만 있는 경우 (예: :3000)
  if (URL_PATTERNS.port.test(trimmedUrl)) {
    return `http://localhost${trimmedUrl}`
  }

  // localhost 처리
  if (URL_PATTERNS.localhost.test(trimmedUrl)) {
    return `http://${trimmedUrl}`
  }

  // IP 주소 처리
  if (URL_PATTERNS.ip.test(trimmedUrl)) {
    return `http://${trimmedUrl}`
  }

  // 도메인 처리
  if (URL_PATTERNS.domain.test(trimmedUrl)) {
    return `https://${trimmedUrl}`
  }

  // 슬래시로 시작하는 경우 (상대 경로)
  if (trimmedUrl.startsWith('/')) {
    return `${window.location.origin}${trimmedUrl}`
  }

  // 그 외의 경우 검색어로 처리
  if (trimmedUrl.includes(' ') || !trimmedUrl.includes('.')) {
    return `https://www.google.com/search?q=${encodeURIComponent(trimmedUrl)}`
  }

  // 기본적으로 HTTPS 추가
  return `https://${trimmedUrl}`
}

/**
 * URL이 유효한지 검증
 * @param url 검증할 URL
 * @returns 유효성 여부
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmedUrl = url.trim()
  
  try {
    // URL 생성자로 기본 검증
    new URL(normalizeUrl(trimmedUrl))
    return true
  } catch {
    return false
  }
}

/**
 * URL에서 도메인 추출
 * @param url URL 문자열
 * @returns 도메인 또는 원본 URL
 */
export function extractDomain(url: string): string {
  if (!url || typeof url !== 'string') {
    return url
  }

  try {
    const normalizedUrl = normalizeUrl(url)
    const urlObj = new URL(normalizedUrl)
    
    // 특수 프로토콜 처리
    if (['mailto:', 'tel:', 'sms:'].includes(urlObj.protocol)) {
      return urlObj.pathname || url
    }
    
    // 파일 프로토콜 처리
    if (urlObj.protocol === 'file:') {
      return '로컬 파일'
    }
    
    // localhost 처리
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return `${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`
    }
    
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * URL 타입 감지
 * @param url URL 문자열
 * @returns URL 타입
 */
export function detectUrlType(url: string): 'web' | 'email' | 'phone' | 'file' | 'local' | 'search' | 'unknown' {
  if (!url || typeof url !== 'string') {
    return 'unknown'
  }

  const trimmedUrl = url.trim()
  
  if (trimmedUrl.startsWith('mailto:')) return 'email'
  if (trimmedUrl.startsWith('tel:') || trimmedUrl.startsWith('sms:')) return 'phone'
  if (URL_PATTERNS.file.test(trimmedUrl)) return 'file'
  if (URL_PATTERNS.localhost.test(trimmedUrl) || URL_PATTERNS.ip.test(trimmedUrl)) return 'local'
  if (trimmedUrl.includes(' ') || (!trimmedUrl.includes('.') && !trimmedUrl.includes(':'))) return 'search'
  if (URL_PATTERNS.domain.test(trimmedUrl) || URL_PATTERNS.http.test(trimmedUrl)) return 'web'
  
  return 'unknown'
}

/**
 * URL에 적합한 아이콘 추천
 * @param url URL 문자열
 * @returns 추천 아이콘
 */
export function getRecommendedIcon(url: string): string {
  const type = detectUrlType(url)
  const normalizedUrl = normalizeUrl(url).toLowerCase()
  
  // 특정 사이트별 아이콘
  if (normalizedUrl.includes('github.com')) return '🐙'
  if (normalizedUrl.includes('google.com')) return '🔍'
  if (normalizedUrl.includes('youtube.com')) return '📺'
  if (normalizedUrl.includes('facebook.com')) return '📘'
  if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) return '🐦'
  if (normalizedUrl.includes('instagram.com')) return '📷'
  if (normalizedUrl.includes('linkedin.com')) return '💼'
  if (normalizedUrl.includes('discord.com')) return '💬'
  if (normalizedUrl.includes('slack.com')) return '💬'
  if (normalizedUrl.includes('notion.so')) return '📝'
  if (normalizedUrl.includes('figma.com')) return '🎨'
  if (normalizedUrl.includes('stackoverflow.com')) return '❓'
  if (normalizedUrl.includes('reddit.com')) return '🤖'
  if (normalizedUrl.includes('netflix.com')) return '🎬'
  if (normalizedUrl.includes('spotify.com')) return '🎵'
  
  // 타입별 기본 아이콘
  switch (type) {
    case 'email': return '📧'
    case 'phone': return '📞'
    case 'file': return '📁'
    case 'local': return '🏠'
    case 'search': return '🔍'
    case 'web': return '🌐'
    default: return '🔗'
  }
}

/**
 * URL 미리보기 정보 생성
 * @param url URL 문자열
 * @returns 미리보기 정보
 */
export function getUrlPreview(url: string): {
  normalizedUrl: string
  displayUrl: string
  icon: string
  type: string
  isValid: boolean
} {
  const normalizedUrl = normalizeUrl(url)
  const displayUrl = extractDomain(url)
  const icon = getRecommendedIcon(url)
  const type = detectUrlType(url)
  const isValid = isValidUrl(url)
  
  return {
    normalizedUrl,
    displayUrl,
    icon,
    type,
    isValid
  }
}