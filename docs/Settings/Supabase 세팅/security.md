# 보안 설정 가이드

## 개요
PersonalDash 프로젝트의 Supabase 보안 설정 및 Row Level Security (RLS) 정책을 설명합니다.

## Row Level Security (RLS) 정책

### 1. RLS 개념

#### 1.1 RLS란?
- 테이블 수준에서 행(row) 단위 접근 제어
- 사용자별로 접근 가능한 데이터 제한
- SQL 레벨에서 자동 적용되는 보안 규칙

#### 1.2 PersonalDash에서의 RLS 적용
- 사용자는 자신의 데이터만 조회/수정/삭제 가능
- 대시보드와 위젯에 대한 소유권 기반 접근 제어
- Supabase Auth와 연동된 자동 사용자 식별

### 2. 테이블별 RLS 정책

#### 2.1 users 테이블 정책
```sql
-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 생성 가능
CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

**설명:**
- `auth.uid()`: 현재 인증된 사용자의 ID 반환
- `USING`: 조회/수정 시 적용되는 조건
- `WITH CHECK`: 삽입 시 적용되는 조건

#### 2.2 dashboards 테이블 정책
```sql
-- 사용자는 자신의 대시보드만 조회 가능
CREATE POLICY "Users can view own dashboards" 
  ON public.dashboards FOR SELECT 
  USING (auth.uid() = user_id);

-- 사용자는 자신의 대시보드만 생성 가능
CREATE POLICY "Users can insert own dashboards" 
  ON public.dashboards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 대시보드만 수정 가능
CREATE POLICY "Users can update own dashboards" 
  ON public.dashboards FOR UPDATE 
  USING (auth.uid() = user_id);

-- 사용자는 자신의 대시보드만 삭제 가능
CREATE POLICY "Users can delete own dashboards" 
  ON public.dashboards FOR DELETE 
  USING (auth.uid() = user_id);
```

#### 2.3 widgets 테이블 정책
```sql
-- 사용자는 자신의 대시보드에 속한 위젯만 조회 가능
CREATE POLICY "Users can view own widgets" 
  ON public.widgets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- 사용자는 자신의 대시보드에만 위젯 생성 가능
CREATE POLICY "Users can insert widgets to own dashboards" 
  ON public.widgets FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- 사용자는 자신의 위젯만 수정 가능
CREATE POLICY "Users can update own widgets" 
  ON public.widgets FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- 사용자는 자신의 위젯만 삭제 가능
CREATE POLICY "Users can delete own widgets" 
  ON public.widgets FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );
```

**설명:**
- `EXISTS`: 서브쿼리 결과가 존재하는지 확인
- 위젯은 대시보드를 통한 간접적 소유권 확인
- 조인 조건을 통한 관계형 보안 검증

### 3. RLS 정책 테스트

#### 3.1 정책 동작 확인
```sql
-- 현재 사용자의 대시보드만 조회되는지 확인
SELECT * FROM dashboards;

-- 다른 사용자의 대시보드 강제 조회 시도 (실패해야 함)
SELECT * FROM dashboards WHERE user_id = '다른사용자ID';

-- 위젯 조회 시 소유권 확인
SELECT w.*, d.user_id 
FROM widgets w 
JOIN dashboards d ON w.dashboard_id = d.id;
```

#### 3.2 보안 검증 함수
```sql
-- RLS 정책 상태 확인
CREATE OR REPLACE FUNCTION check_security_settings()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policies_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    t.row_security::BOOLEAN as rls_enabled,
    COUNT(p.policyname) as policies_count
  FROM information_schema.tables t
  LEFT JOIN pg_policies p ON p.tablename = t.table_name
  WHERE t.table_schema = 'public' 
    AND t.table_name IN ('users', 'dashboards', 'widgets')
  GROUP BY t.table_name, t.row_security
  ORDER BY t.table_name;
END;
$$ language 'plpgsql';

-- 실행: SELECT * FROM check_security_settings();
```

## API 보안

### 1. 서버 사이드 보안

#### 1.1 Service Role 사용 주의사항
```typescript
// ❌ 잘못된 사용 - 클라이언트에서 Service Role 사용
// 절대로 클라이언트 코드에서 SERVICE_ROLE_KEY를 사용하지 말 것!

// ✅ 올바른 사용 - 서버에서만 Service Role 사용
// pages/api/admin/users.ts (서버 API)
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient() // Service Role 클라이언트
  // 관리자 권한이 필요한 작업만 수행
}
```

#### 1.2 사용자 인증 확인
```typescript
// Server Action에서 인증 확인
import { supabaseServer } from '@/lib/supabase/server'

export async function updateDashboard(dashboardId: string, updates: any) {
  // 1. 사용자 인증 확인
  const user = await supabaseServer.requireAuth()
  
  // 2. 소유권 확인
  const supabase = await createClient()
  const { data: dashboard } = await supabase
    .from('dashboards')
    .select('user_id')
    .eq('id', dashboardId)
    .single()
  
  if (dashboard?.user_id !== user.id) {
    throw new Error('권한이 없습니다.')
  }
  
  // 3. 업데이트 실행
  return await supabase
    .from('dashboards')
    .update(updates)
    .eq('id', dashboardId)
}
```

### 2. 클라이언트 사이드 보안

#### 2.1 환경변수 보안
```typescript
// ✅ 안전한 환경변수 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ❌ 위험한 환경변수 노출 (절대 금지!)
// const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // 클라이언트에서 사용 금지
```

#### 2.2 입력 데이터 검증
```typescript
// 클라이언트 측 입력 검증
function validateDashboardData(data: any) {
  if (!data.name || data.name.length > 100) {
    throw new Error('유효하지 않은 대시보드 이름입니다.')
  }
  
  if (!['color', 'gradient', 'image'].includes(data.background_type)) {
    throw new Error('유효하지 않은 배경 타입입니다.')
  }
  
  // XSS 방지를 위한 HTML 태그 제거
  data.name = data.name.replace(/<[^>]*>/g, '')
  
  return data
}
```

## 네트워크 보안

### 1. HTTPS 설정

#### 1.1 프로덕션 환경
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

#### 1.2 CORS 설정
```typescript
// Supabase에서 자동 처리되지만, 커스텀 API의 경우:
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 2. Rate Limiting

#### 2.1 Supabase 내장 Rate Limiting
```typescript
// Supabase 대시보드에서 설정:
// Authentication → Rate Limits
// - Sign ups: 5 requests per minute
// - Sign ins: 30 requests per minute
// - Password resets: 5 requests per hour
```

#### 2.2 커스텀 Rate Limiting (선택사항)
```typescript
// lib/middleware/rate-limit.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(request: NextRequest, limit = 5, window = 60000) {
  const ip = request.ip || 'anonymous'
  const now = Date.now()
  const windowStart = now - window
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }
  
  const requests = rateLimitMap.get(ip)
  const validRequests = requests.filter((time: number) => time > windowStart)
  
  if (validRequests.length >= limit) {
    return false
  }
  
  validRequests.push(now)
  rateLimitMap.set(ip, validRequests)
  return true
}
```

## 데이터 보안

### 1. 민감 정보 처리

#### 1.1 사용자 데이터 암호화
```typescript
// 민감한 사용자 데이터는 암호화하여 저장 (필요한 경우)
import crypto from 'crypto'

const encryptSensitiveData = (data: string, key: string) => {
  const cipher = crypto.createCipher('aes-256-cbc', key)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

const decryptSensitiveData = (encryptedData: string, key: string) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

#### 1.2 로그에서 민감 정보 제거
```typescript
// 로깅 시 민감 정보 마스킹
const sanitizeLogData = (data: any) => {
  const sanitized = { ...data }
  
  if (sanitized.password) {
    sanitized.password = '[REDACTED]'
  }
  
  if (sanitized.email) {
    sanitized.email = sanitized.email.replace(/(.{2}).*(@.*)/, '$1***$2')
  }
  
  return sanitized
}
```

### 2. 파일 업로드 보안

#### 2.1 이미지 업로드 검증
```typescript
// 파일 타입 및 크기 검증
const validateImageUpload = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다.')
  }
  
  if (file.size > maxSize) {
    throw new Error('파일 크기가 너무 큽니다. (최대 5MB)')
  }
  
  return true
}
```

## 모니터링 및 감사

### 1. 보안 로그

#### 1.1 인증 이벤트 로그
```typescript
// 중요한 인증 이벤트 로그 기록
const logAuthEvent = (event: string, userId?: string, metadata?: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    userId,
    metadata: sanitizeLogData(metadata),
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
  }))
}

// 사용 예시
supabase.auth.onAuthStateChange((event, session) => {
  logAuthEvent(event, session?.user?.id, { provider: session?.user?.app_metadata?.provider })
})
```

### 2. 보안 체크리스트

#### 2.1 배포 전 체크리스트
- [ ] 모든 테이블에 RLS 활성화
- [ ] RLS 정책이 올바르게 작동하는지 테스트
- [ ] Service Role Key가 클라이언트에 노출되지 않음
- [ ] HTTPS 강제 적용 (프로덕션)
- [ ] 적절한 CORS 설정
- [ ] Rate Limiting 적용
- [ ] 민감한 정보 로그 제외
- [ ] 파일 업로드 검증
- [ ] 입력 데이터 검증 및 XSS 방지
- [ ] 환경변수 보안 설정

#### 2.2 정기 보안 점검
- [ ] 월별 보안 로그 검토
- [ ] 취약점 스캔 실행
- [ ] 의존성 업데이트 및 보안 패치 적용
- [ ] 액세스 권한 검토
- [ ] 백업 및 복구 절차 테스트

## 문제 해결

### 1. RLS 관련 문제

#### 1.1 "permission denied" 오류
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';

-- 현재 사용자 확인
SELECT auth.uid();

-- 정책 조건 직접 확인
SELECT 
  *,
  (auth.uid() = user_id) as policy_check
FROM dashboards;
```

#### 1.2 정책이 적용되지 않는 경우
```sql
-- RLS 활성화 확인
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- RLS 강제 활성화
ALTER TABLE your_table_name FORCE ROW LEVEL SECURITY;
```

### 2. 인증 관련 문제

#### 2.1 토큰 만료 처리
```typescript
// 자동 토큰 갱신
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('토큰이 갱신되었습니다.')
  }
  
  if (event === 'SIGNED_OUT') {
    // 로그아웃 시 정리 작업
    localStorage.clear()
    router.push('/auth/login')
  }
})
```

## 추가 보안 고려사항

### 1. 향후 개선 사항
- 2FA (Two-Factor Authentication) 구현
- 세션 관리 고도화
- 보안 감사 로그 시스템
- 실시간 보안 모니터링

### 2. 규정 준수
- GDPR 데이터 보호 규정 준수
- 개인정보보호법 준수
- 데이터 국외 이전 정책