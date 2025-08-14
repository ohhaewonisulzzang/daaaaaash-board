# Supabase 프로젝트 설정 가이드

## 개요
PersonalDash 프로젝트의 Supabase 백엔드를 설정하는 단계별 가이드입니다.

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성 및 로그인
1. [Supabase 웹사이트](https://supabase.com)에 접속
2. 계정 생성 또는 기존 계정으로 로그인
3. GitHub, Google, 또는 이메일로 인증

### 1.2 새 프로젝트 생성
1. 대시보드에서 "New Project" 클릭
2. 프로젝트 설정:
   - **프로젝트 이름**: `PersonalDash`
   - **데이터베이스 비밀번호**: 강력한 비밀번호 설정 (기록해두기)
   - **리전**: 가장 가까운 리전 선택 (예: Seoul, Tokyo)
3. "Create new project" 클릭하여 생성 (약 2-3분 소요)

## 2. 환경변수 설정

### 2.1 Supabase 키 복사
프로젝트 생성 완료 후:
1. Supabase 대시보드 → Settings → API 이동
2. 다음 값들을 복사:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Public anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ 민감 정보)

### 2.2 .env.local 파일 업데이트
프로젝트 루트의 `.env.local` 파일을 다음과 같이 업데이트:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 기타 설정 (선택사항)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **주의사항**: 
- `NEXT_PUBLIC_`로 시작하는 변수만 클라이언트에서 접근 가능
- `SERVICE_ROLE_KEY`는 절대 클라이언트에서 사용하지 말 것

## 3. 데이터베이스 스키마 설정

### 3.1 SQL 스크립트 실행
1. Supabase 대시보드 → SQL Editor 이동
2. "New query" 클릭
3. `lib/supabase/database.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행

### 3.2 스키마 확인
SQL 실행 후 다음 테이블들이 생성되었는지 확인:
- `public.users` - 사용자 정보
- `public.dashboards` - 대시보드 설정
- `public.widgets` - 위젯 데이터

### 3.3 RLS 정책 확인
Table Editor에서 각 테이블의 RLS가 활성화되었는지 확인:
```sql
-- 보안 설정 확인
SELECT * FROM check_security_settings();
```

## 4. 인증 설정

### 4.1 OAuth 프로바이더 설정 (Google)
1. Supabase 대시보드 → Authentication → Providers 이동
2. Google 프로바이더 활성화:
   - **Client ID**: Google Cloud Console에서 생성한 OAuth 클라이언트 ID
   - **Client Secret**: Google Cloud Console에서 생성한 클라이언트 시크릿
   - **Redirect URL**: `https://your-project-id.supabase.co/auth/v1/callback`

### 4.2 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Credentials 이동
4. "Create Credentials" → "OAuth 2.0 Client IDs" 선택
5. 애플리케이션 유형: "Web application"
6. 승인된 리디렉션 URI 추가:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (개발용)

### 4.3 이메일 설정
1. Supabase 대시보드 → Authentication → Settings 이동
2. Site URL 설정: `http://localhost:3000` (개발용)
3. Redirect URLs 추가:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

## 5. 실시간 기능 설정

### 5.1 Realtime 활성화
1. Supabase 대시보드 → Database → Replication 이동
2. 다음 테이블에 대해 Realtime 활성화:
   - `public.dashboards`
   - `public.widgets`

## 6. 설정 검증

### 6.1 연결 테스트
프로젝트에서 다음 명령어로 연결 테스트:
```bash
npm run dev
```

### 6.2 인증 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. 회원가입/로그인 기능 테스트
3. 대시보드 접근 권한 확인

### 6.3 보안 검증
- RLS 정책이 올바르게 작동하는지 확인
- 다른 사용자의 데이터에 접근할 수 없는지 테스트
- Service role key가 클라이언트에 노출되지 않는지 확인

## 7. 배포 시 추가 설정

### 7.1 프로덕션 환경변수
Vercel/Netlify 등 배포 플랫폼에서 환경변수 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 7.2 도메인 설정
1. Supabase 대시보드에서 Site URL을 프로덕션 도메인으로 변경
2. Redirect URLs에 프로덕션 도메인 추가
3. Google OAuth 설정에도 프로덕션 도메인 추가

## 문제 해결

### 연결 오류
- 환경변수 값이 정확한지 확인
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 서버 재시작 (`npm run dev` 중단 후 재실행)

### 인증 오류
- OAuth 리디렉션 URL이 정확한지 확인
- Google Cloud Console 설정 재확인
- 브라우저 캐시 및 쿠키 삭제

### RLS 정책 오류
- 정책이 올바르게 생성되었는지 SQL Editor에서 확인
- 사용자 ID가 올바르게 전달되고 있는지 확인

## 다음 단계
1. 인증 시스템 구현 (`S1-1` 완료 후 `S1-2`로 이동)
2. 대시보드 레이아웃 구현
3. 위젯 시스템 구현