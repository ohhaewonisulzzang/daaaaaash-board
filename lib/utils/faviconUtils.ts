/**
 * Favicon 관련 유틸리티 함수들
 */

export interface IFaviconResult {
  success: boolean
  faviconUrl?: string
  error?: string
}

/**
 * URL에서 도메인을 추출합니다
 */
export function extractDomainFromUrl(url: string): string | null {
  try {
    // URL이 프로토콜이 없으면 https://를 추가
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(fullUrl)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * 여러 favicon URL 후보들을 생성합니다
 */
export function generateFaviconUrls(domain: string): string[] {
  const urls = [
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,
    `https://${domain}/favicon.svg`,
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-180x180.png`,
    `https://${domain}/android-chrome-192x192.png`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    `https://icon.horse/icon/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=32`
  ]
  
  return urls
}

/**
 * 이미지 URL이 유효한지 확인합니다
 */
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors',
      timeout: 5000 
    })
    return true // no-cors 모드에서는 응답 상태를 확인할 수 없지만, 오류가 없으면 성공으로 간주
  } catch {
    return false
  }
}

/**
 * 이미지가 실제로 로드되는지 테스트합니다
 */
export function testImageLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timeout = setTimeout(() => {
      resolve(false)
    }, 3000) // 3초 타임아웃
    
    img.onload = () => {
      clearTimeout(timeout)
      resolve(true)
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }
    
    img.src = url
  })
}

/**
 * URL에서 favicon을 가져옵니다
 */
export async function fetchFavicon(url: string): Promise<IFaviconResult> {
  const domain = extractDomainFromUrl(url)
  
  if (!domain) {
    return {
      success: false,
      error: '유효하지 않은 URL입니다'
    }
  }
  
  const faviconUrls = generateFaviconUrls(domain)
  
  // 각 favicon URL을 순차적으로 테스트
  for (const faviconUrl of faviconUrls) {
    try {
      const isValid = await testImageLoad(faviconUrl)
      if (isValid) {
        return {
          success: true,
          faviconUrl
        }
      }
    } catch (error) {
      continue
    }
  }
  
  return {
    success: false,
    error: 'Favicon을 찾을 수 없습니다'
  }
}

/**
 * 캐시된 favicon을 가져옵니다 (localStorage 사용)
 */
export function getCachedFavicon(domain: string): string | null {
  try {
    const cacheKey = `favicon_${domain}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { faviconUrl, timestamp } = JSON.parse(cached)
      // 24시간 캐시
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return faviconUrl
      }
    }
  } catch {
    return null
  }
  return null
}

/**
 * favicon을 캐시에 저장합니다
 */
export function cacheFavicon(domain: string, faviconUrl: string): void {
  try {
    const cacheKey = `favicon_${domain}`
    const cacheData = {
      faviconUrl,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch {
    // 저장 실패 시 무시
  }
}

/**
 * URL에서 favicon을 가져오고 캐시합니다
 */
export async function getFaviconWithCache(url: string): Promise<IFaviconResult> {
  const domain = extractDomainFromUrl(url)
  
  if (!domain) {
    return {
      success: false,
      error: '유효하지 않은 URL입니다'
    }
  }
  
  // 캐시된 favicon 먼저 확인
  const cached = getCachedFavicon(domain)
  if (cached) {
    return {
      success: true,
      faviconUrl: cached
    }
  }
  
  // 캐시에 없으면 새로 가져오기
  const result = await fetchFavicon(url)
  
  if (result.success && result.faviconUrl) {
    cacheFavicon(domain, result.faviconUrl)
  }
  
  return result
}

/**
 * 기본 아이콘 이모지 리스트
 */
export const DEFAULT_ICONS = [
  '🌐', '🔗', '📚', '💼', '🎯', '⚡', '🔧', '📊', '🎨', '🎵', 
  '📺', '🎮', '💻', '📱', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '🎬',
  '🏠', '🏢', '🏪', '🏫', '🏥', '🏛️', '⛪', '🕌', '🏰', '🎪',
  '🚗', '✈️', '🚀', '🛸', '⛵', '🚂', '🏍️', '🚴', '🚶', '🏃'
]