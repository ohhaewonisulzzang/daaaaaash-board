# PersonalDash 프로젝트 종합 Todo List

## 프로젝트 현황 분석

### ✅ 완료된 작업
- ✅ Next.js 14 프로젝트 초기 설정 완료
- ✅ TypeScript 설정 완료  
- ✅ Tailwind CSS 설정 완료
- ✅ Supabase 인프라 설정 완료 (클라이언트, 서버, 미들웨어)
- ✅ 기본 UI 컴포넌트 라이브러리 구현 완료
- ✅ 프로젝트 폴더 구조 설정 완료
- ✅ 기본 홈페이지 및 라우팅 구조 완료

### 🚧 현재 상태
- 기본 인프라는 완성되었으나 핵심 기능 구현 단계
- PRD 기반 MVP 기능 구현 필요
- Frontend 우선 개발 방식으로 진행

---

## 🎯 Phase 1: Core Frontend MVP (Week 1-2)

### 1.1 인증 시스템 Frontend 구현 (3일)

#### 📋 Todo: 인증 페이지 UI 구현
- [ ] `app/(auth)/login/page.tsx` - 로그인 페이지 구현
  - [ ] 이메일/비밀번호 입력 폼
  - [ ] Google OAuth 로그인 버튼
  - [ ] "회원가입" 링크
  - [ ] 게스트 체험 버튼
- [ ] `app/(auth)/signup/page.tsx` - 회원가입 페이지 구현
  - [ ] 이메일/비밀번호/이름 입력 폼
  - [ ] Google OAuth 회원가입
  - [ ] 이용약관 체크박스
- [ ] `app/(auth)/layout.tsx` - 인증 전용 레이아웃
  - [ ] 중앙 정렬 카드 형태
  - [ ] 로고 및 브랜딩
  - [ ] 반응형 디자인

#### 📋 Todo: 인증 훅 및 컨텍스트 구현
- [ ] `lib/hooks/useAuth.ts` - 인증 상태 관리 훅
  - [ ] 로그인/로그아웃 함수
  - [ ] 사용자 정보 상태
  - [ ] 로딩 상태 관리
- [ ] `lib/context/AuthContext.tsx` - 전역 인증 컨텍스트
  - [ ] Provider 컴포넌트
  - [ ] 인증 상태 전역 관리
- [ ] `lib/components/auth/` - 인증 관련 컴포넌트
  - [ ] `AuthForm.tsx` - 공통 폼 컴포넌트
  - [ ] `SocialLoginButton.tsx` - 소셜 로그인 버튼
  - [ ] `GuestModeButton.tsx` - 게스트 모드 버튼

#### 📋 Todo: 인증 플로우 구현
- [ ] Supabase Auth 연동 완료
- [ ] 리다이렉트 로직 구현 (middleware.ts 업데이트)
- [ ] 에러 핸들링 (잘못된 로그인 등)
- [ ] 로딩 상태 UI
- [ ] 성공/실패 메시지 토스트

### 1.2 대시보드 메인 페이지 Frontend 구현 (4일)

#### 📋 Todo: 대시보드 레이아웃 구현
- [ ] `app/dashboard/layout.tsx` - 대시보드 전용 레이아웃
  - [ ] 상단 네비게이션 바
  - [ ] 사이드바 (접이식)
  - [ ] 메인 콘텐츠 영역
  - [ ] 반응형 레이아웃 (모바일 하단 네비게이션)
- [ ] `lib/components/layout/` - 레이아웃 컴포넌트
  - [ ] `Header.tsx` - 상단 헤더 (편집 모드 토글, 프로필)
  - [ ] `Sidebar.tsx` - 좌측 사이드바 (위젯 추가)
  - [ ] `MobileNav.tsx` - 모바일 하단 네비게이션

#### 📋 Todo: 대시보드 그리드 시스템 구현
- [ ] `lib/components/dashboard/` - 대시보드 핵심 컴포넌트
  - [ ] `DashboardGrid.tsx` - 그리드 컨테이너
  - [ ] `GridItem.tsx` - 그리드 아이템 래퍼
  - [ ] `DragDropProvider.tsx` - 드래그 앤 드롭 컨텍스트
- [ ] CSS Grid 기반 레이아웃 구현
- [ ] 반응형 그리드 (12열 → 6열 → 2열)
- [ ] 그리드 스냅 기능

#### 📋 Todo: 편집 모드 UI 구현
- [ ] 편집 모드 토글 버튼 (Header)
- [ ] 편집 모드 시 위젯 테두리 및 핸들 표시
- [ ] 위젯 삭제 버튼 (편집 모드 시에만)
- [ ] 편집 모드 종료 시 자동 저장

### 1.3 기본 위젯 Frontend 구현 (5일)

#### 📋 Todo: 위젯 시스템 구조 구현
- [ ] `lib/components/widgets/` - 위젯 컴포넌트 폴더
  - [ ] `WidgetFactory.tsx` - 위젯 타입별 렌더링
  - [ ] `BaseWidget.tsx` - 공통 위젯 래퍼
  - [ ] `WidgetSettings.tsx` - 위젯 설정 모달
- [ ] `types/widget.ts` - 위젯 타입 정의
  - [ ] BaseWidget 인터페이스
  - [ ] 각 위젯별 세부 타입

#### 📋 Todo: 링크 위젯 구현
- [ ] `lib/components/widgets/LinkWidget.tsx`
  - [ ] URL, 제목, 아이콘 표시
  - [ ] 클릭 시 새창으로 이동
  - [ ] 파비콘 자동 가져오기 (선택사항)
- [ ] `lib/components/widgets/LinkWidgetSettings.tsx`
  - [ ] URL 입력 필드
  - [ ] 제목 입력 필드  
  - [ ] 아이콘 선택 (아이콘 라이브러리 통합)
  - [ ] 미리보기 기능

#### 📋 Todo: 체크리스트 위젯 구현
- [ ] `lib/components/widgets/ChecklistWidget.tsx`
  - [ ] 할 일 목록 표시
  - [ ] 체크박스 인터랙션
  - [ ] 완료 항목 스타일링 (취소선)
  - [ ] 진행률 표시 바
- [ ] `lib/components/widgets/ChecklistWidgetSettings.tsx`
  - [ ] 제목 설정
  - [ ] 할 일 항목 추가/삭제
  - [ ] 드래그 앤 드롭으로 순서 변경

#### 📋 Todo: 시계 위젯 구현
- [ ] `lib/components/widgets/ClockWidget.tsx`
  - [ ] 실시간 시간 표시
  - [ ] 12시간/24시간 형식 지원
  - [ ] 날짜 표시 옵션
  - [ ] 시간대 설정 지원
- [ ] `lib/components/widgets/ClockWidgetSettings.tsx`
  - [ ] 시간 형식 선택 (12h/24h)
  - [ ] 날짜 표시 여부
  - [ ] 시간대 선택 드롭다운

### 1.4 위젯 관리 UI 구현 (3일)

#### 📋 Todo: 위젯 추가 플로우 구현
- [ ] `lib/components/dashboard/AddWidgetPanel.tsx`
  - [ ] 위젯 타입 선택 그리드
  - [ ] 각 위젯 타입별 미리보기
  - [ ] 위젯 설명 및 아이콘
- [ ] `lib/components/dashboard/WidgetModal.tsx`
  - [ ] 위젯 설정 모달
  - [ ] 단계별 설정 플로우
  - [ ] 미리보기 및 저장

#### 📋 Todo: 드래그 앤 드롭 구현
- [ ] `lib/hooks/useDragAndDrop.ts` - 드래그 앤 드롭 훅
  - [ ] HTML5 Drag API 활용
  - [ ] 드래그 상태 관리
  - [ ] 충돌 감지 및 스냅
- [ ] 드래그 중 가이드라인 표시
- [ ] 위젯 크기 조절 핸들
- [ ] 모바일 터치 지원

---

## 🔧 Phase 2: Backend Integration & Data Management (Week 3-4)

### 2.1 Supabase Database 스키마 구현 (2일)

#### 📋 Todo: 데이터베이스 테이블 생성
- [ ] `lib/supabase/database.sql` 실행
  - [ ] users 테이블 생성
  - [ ] dashboards 테이블 생성  
  - [ ] widgets 테이블 생성
  - [ ] ENUM 타입 생성
- [ ] RLS (Row Level Security) 정책 적용
- [ ] 트리거 함수 생성 (updated_at 자동 갱신)

#### 📋 Todo: 데이터베이스 시드 데이터
- [ ] 기본 대시보드 템플릿 데이터
- [ ] 샘플 위젯 데이터
- [ ] 게스트 모드용 임시 데이터

### 2.2 API Routes 구현 (3일)

#### 📋 Todo: 인증 API Routes
- [ ] `app/api/auth/signup/route.ts` - 회원가입 API
- [ ] `app/api/auth/login/route.ts` - 로그인 API  
- [ ] `app/api/auth/logout/route.ts` - 로그아웃 API
- [ ] `app/api/auth/callback/route.ts` - OAuth 콜백

#### 📋 Todo: 대시보드 API Routes
- [ ] `app/api/dashboards/route.ts` - 대시보드 CRUD
- [ ] `app/api/dashboards/[id]/route.ts` - 개별 대시보드
- [ ] `app/api/dashboards/[id]/widgets/route.ts` - 위젯 CRUD

#### 📋 Todo: 사용자 API Routes
- [ ] `app/api/users/profile/route.ts` - 프로필 관리
- [ ] `app/api/upload/avatar/route.ts` - 아바타 업로드
- [ ] `app/api/upload/background/route.ts` - 배경 이미지 업로드

### 2.3 데이터 동기화 및 상태 관리 (4일)

#### 📋 Todo: Zustand 스토어 구현
- [ ] `store/dashboardStore.ts` - 대시보드 상태 관리
  - [ ] 현재 대시보드 상태
  - [ ] 위젯 목록 관리
  - [ ] 편집 모드 상태
- [ ] `store/authStore.ts` - 인증 상태 관리
- [ ] `store/uiStore.ts` - UI 상태 관리 (사이드바, 로딩 등)

#### 📋 Todo: 데이터 Fetching 훅 구현
- [ ] `lib/hooks/useDashboards.ts` - 대시보드 데이터 훅
- [ ] `lib/hooks/useWidgets.ts` - 위젯 데이터 훅
- [ ] `lib/hooks/useUser.ts` - 사용자 데이터 훅
- [ ] Optimistic Updates 구현

#### 📋 Todo: 실시간 동기화 구현
- [ ] Supabase Realtime 연동
- [ ] 위젯 변경 실시간 반영
- [ ] 다중 기기 동기화 처리

### 2.4 에러 처리 및 로딩 상태 (2일)

#### 📋 Todo: 에러 핸들링 시스템
- [ ] `lib/utils/errorHandler.ts` - 에러 처리 유틸
- [ ] `lib/components/ui/ErrorBoundary.tsx` - 에러 바운더리
- [ ] `lib/components/ui/ErrorMessage.tsx` - 에러 메시지 컴포넌트
- [ ] API 에러 응답 표준화

#### 📋 Todo: 로딩 상태 관리
- [ ] 전역 로딩 상태 관리
- [ ] 스켈레톤 로딩 컴포넌트
- [ ] 지연 로딩 (페이지 단위)
- [ ] 위젯별 개별 로딩 상태

---

## 🎨 Phase 3: UI/UX Enhancement & Customization (Week 5-6)

### 3.1 대시보드 커스터마이징 UI (4일)

#### 📋 Todo: 배경 커스터마이징 구현
- [ ] `lib/components/dashboard/BackgroundSettings.tsx`
  - [ ] 단색 배경 컬러 피커
  - [ ] 그라데이션 프리셋 선택기
  - [ ] 이미지 업로드 인터페이스
  - [ ] 실시간 미리보기
- [ ] 배경 타입별 렌더링 로직
- [ ] 이미지 최적화 (WebP 변환)

#### 📋 Todo: 테마 시스템 구현
- [ ] `lib/hooks/useTheme.ts` - 테마 관리 훅
- [ ] 다크/라이트 모드 토글
- [ ] 시스템 설정 따라가기 옵션
- [ ] 테마별 CSS 변수 관리

#### 📋 Todo: 반응형 레이아웃 최적화
- [ ] 모바일 최적화 (터치 인터랙션)
- [ ] 태블릿 레이아웃 조정
- [ ] 데스크톱 대화면 지원
- [ ] 방향 전환 대응

### 3.2 위젯 고도화 (3일)

#### 📋 Todo: 위젯 크기 조절 시스템
- [ ] 위젯 리사이징 핸들 구현
- [ ] 최소/최대 크기 제한
- [ ] 종횡비 유지 옵션
- [ ] 그리드 스냅 리사이징

#### 📋 Todo: 위젯 스타일링 옵션
- [ ] 위젯별 색상 테마 설정
- [ ] 테두리 스타일 옵션
- [ ] 투명도 조절
- [ ] 그림자 효과 설정

#### 📋 Todo: 위젯 애니메이션
- [ ] Framer Motion 통합
- [ ] 위젯 추가/삭제 애니메이션
- [ ] 드래그 앤 드롭 애니메이션
- [ ] 호버 효과

### 3.3 사용자 경험 개선 (4일)

#### 📋 Todo: 온보딩 플로우 구현
- [ ] `app/onboarding/` - 온보딩 페이지 구현
  - [ ] 환영 메시지
  - [ ] 기능 소개 (3-4 스텝)
  - [ ] 첫 위젯 추가 가이드
  - [ ] 대시보드 둘러보기
- [ ] 인터랙티브 튜토리얼 구현
- [ ] 진행률 표시

#### 📋 Todo: 키보드 단축키 구현
- [ ] `lib/hooks/useKeyboardShortcuts.ts`
  - [ ] 'E' - 편집 모드 토글
  - [ ] 'Esc' - 편집 모드 종료
  - [ ] 'Tab' - 사이드바 토글
  - [ ] 'N' - 새 위젯 추가
- [ ] 단축키 도움말 모달

#### 📋 Todo: 접근성 개선
- [ ] ARIA 라벨 및 역할 추가
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 호환성
- [ ] 색상 대비 개선 (WCAG AA)

---

## 🚀 Phase 4: Advanced Features & Performance (Week 7-8)

### 4.1 고급 위젯 구현 (5일)

#### 📋 Todo: 날씨 위젯 구현
- [ ] `lib/components/widgets/WeatherWidget.tsx`
  - [ ] OpenWeatherMap API 연동
  - [ ] 현재 날씨 정보 표시
  - [ ] 5일 예보 (선택사항)
  - [ ] 위치 기반 자동 감지
- [ ] 날씨 아이콘 및 애니메이션
- [ ] 오프라인 캐시 지원

#### 📋 Todo: 메모 위젯 구현
- [ ] `lib/components/widgets/MemoWidget.tsx`
  - [ ] 리치 텍스트 에디터 (간단한 마크다운)
  - [ ] 자동 저장 기능
  - [ ] 글자 수 제한 및 표시
  - [ ] 폰트 크기 조절

#### 📋 Todo: 이미지 갤러리 위젯 구현
- [ ] `lib/components/widgets/ImageWidget.tsx`
  - [ ] 개인 이미지 업로드
  - [ ] 이미지 슬라이더/그리드 뷰
  - [ ] 드래그 앤 드롭 업로드
  - [ ] 이미지 압축 및 최적화

### 4.2 데이터 관리 고급 기능 (3일)

#### 📋 Todo: 설정 백업/복구 시스템
- [ ] `app/settings/backup/page.tsx` - 백업 관리 페이지
- [ ] JSON 형태 설정 내보내기
- [ ] 설정 파일 가져오기 기능
- [ ] 백업 데이터 검증
- [ ] 충돌 해결 인터페이스

#### 📋 Todo: 게스트 모드 고도화
- [ ] 게스트 데이터 LocalStorage 저장
- [ ] 게스트 → 회원 마이그레이션 플로우
- [ ] 게스트 모드 제한 사항 안내
- [ ] 데이터 손실 방지 경고

### 4.3 성능 최적화 (3일)

#### 📋 Todo: 번들 최적화
- [ ] Next.js dynamic import 적용
- [ ] 위젯별 코드 스플리팅
- [ ] 이미지 최적화 (next/image)
- [ ] 폰트 최적화

#### 📋 Todo: 렌더링 최적화
- [ ] React.memo 적용
- [ ] useMemo, useCallback 최적화
- [ ] 가상화 (위젯 개수가 많은 경우)
- [ ] 지연 로딩 (Intersection Observer)

#### 📋 Todo: 캐싱 전략 구현
- [ ] API 응답 캐싱
- [ ] 이미지 CDN 연동 (Cloudinary)
- [ ] Service Worker 기본 설정
- [ ] 브라우저 캐시 활용

---

## 🧪 Phase 5: Testing & Quality Assurance (Week 9-10)

### 5.1 테스트 구현 (4일)

#### 📋 Todo: 단위 테스트 구현
- [ ] Jest + React Testing Library 설정
- [ ] 위젯 컴포넌트 테스트
  - [ ] LinkWidget 테스트
  - [ ] ChecklistWidget 테스트  
  - [ ] ClockWidget 테스트
- [ ] 유틸 함수 테스트
- [ ] 훅 테스트 (useAuth, useDragDrop 등)

#### 📋 Todo: 통합 테스트 구현
- [ ] API Routes 테스트
- [ ] 인증 플로우 테스트
- [ ] 대시보드 CRUD 테스트
- [ ] 파일 업로드 테스트

#### 📋 Todo: E2E 테스트 구현
- [ ] Playwright 설정 및 기본 테스트
- [ ] 사용자 회원가입/로그인 플로우
- [ ] 위젯 추가/편집/삭제 플로우
- [ ] 드래그 앤 드롭 테스트
- [ ] 반응형 테스트 (모바일/데스크톱)

### 5.2 성능 및 보안 테스트 (3일)

#### 📋 Todo: 성능 테스트
- [ ] Lighthouse CI 설정
- [ ] Core Web Vitals 측정
- [ ] 번들 사이즈 분석
- [ ] 메모리 누수 검사

#### 📋 Todo: 보안 테스트
- [ ] XSS 방지 테스트
- [ ] CSRF 방지 확인
- [ ] 파일 업로드 보안 테스트
- [ ] SQL Injection 방지 확인

### 5.3 사용자 테스트 및 피드백 (4일)

#### 📋 Todo: 베타 테스트 준비
- [ ] 베타 버전 배포 환경 설정
- [ ] 사용자 피드백 수집 시스템
- [ ] 버그 리포팅 인터페이스
- [ ] 사용량 분석 도구 연동

#### 📋 Todo: 문서화
- [ ] 사용자 가이드 작성
- [ ] API 문서 업데이트
- [ ] 개발자 가이드 작성
- [ ] 배포 가이드 작성

---

## 🚀 Phase 6: Deployment & Production (Week 11-12)

### 6.1 프로덕션 배포 준비 (3일)

#### 📋 Todo: 환경 설정 및 최적화
- [ ] 프로덕션 환경 변수 설정
- [ ] Vercel 배포 설정 최적화
- [ ] CDN 설정 (Cloudinary)
- [ ] 도메인 연결 및 SSL 설정

#### 📋 Todo: 모니터링 및 로깅
- [ ] 에러 추적 (Sentry 연동)
- [ ] 성능 모니터링 설정
- [ ] 사용자 행동 분석 (Google Analytics)
- [ ] 헬스체크 엔드포인트 구현

### 6.2 런칭 및 마케팅 준비 (2일)

#### 📋 Todo: 런칭 페이지 완성
- [ ] 랜딩 페이지 최적화
- [ ] 기능 소개 섹션
- [ ] 사용자 후기 섹션 (예정)
- [ ] FAQ 섹션

#### 📋 Todo: SEO 최적화
- [ ] 메타 태그 최적화
- [ ] 구조화된 데이터 추가
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정

### 6.3 포스트 런칭 개선 (6일)

#### 📋 Todo: 사용자 피드백 반영
- [ ] 버그 수정 및 성능 개선
- [ ] UI/UX 개선 사항 적용
- [ ] 새로운 기능 요청 검토
- [ ] 모바일 경험 개선

#### 📋 Todo: 추가 기능 개발 (2차 개발)
- [ ] 캘린더 위젯 구현
- [ ] 통합 검색 기능
- [ ] 위젯 템플릿 시스템
- [ ] 팀 대시보드 기능 (향후)

---

## 📊 우선순위 매트릭스

### 🔴 Critical (즉시 필요)
1. **인증 시스템** - 기본적인 사용자 관리
2. **대시보드 레이아웃** - 핵심 UI 구조
3. **기본 위젯 (링크, 체크리스트, 시계)** - MVP 핵심 기능
4. **위젯 관리 (추가/편집/삭제)** - 기본 CRUD

### 🟡 High (Week 1-4)
1. **드래그 앤 드롭** - 사용자 경험의 핵심
2. **배경 커스터마이징** - 개인화 기능
3. **반응형 디자인** - 다양한 기기 지원
4. **데이터 동기화** - 안정적인 백엔드 연동

### 🟢 Medium (Week 5-8)
1. **고급 위젯 (날씨, 메모)** - 부가 기능
2. **테마 시스템** - 사용자 경험 향상
3. **성능 최적화** - 확장성 대비
4. **접근성** - 포용적 디자인

### 🔵 Low (Week 9-12)
1. **테스트 구현** - 안정성 확보
2. **배포 및 모니터링** - 운영 준비
3. **SEO 및 마케팅** - 성장 기반 마련
4. **2차 개발 기능** - 차별화 요소

---

## 🎯 각 단계별 완료 기준

### Phase 1 완료 기준
- [ ] 사용자가 회원가입/로그인 가능
- [ ] 기본 대시보드 레이아웃 표시
- [ ] 링크, 체크리스트, 시계 위젯 추가 가능
- [ ] 위젯 편집 및 삭제 가능
- [ ] 모바일에서 기본 기능 동작

### Phase 2 완료 기준
- [ ] 데이터가 데이터베이스에 저장/로드
- [ ] 실시간 동기화 동작
- [ ] 에러 상황 적절히 처리
- [ ] 로딩 상태 UX 완성
- [ ] API 문서화 완료

### Phase 3 완료 기준
- [ ] 배경 커스터마이징 완전 동작
- [ ] 드래그 앤 드롭 완성도 높음
- [ ] 모든 기기에서 최적화된 경험
- [ ] 접근성 기준 충족
- [ ] 온보딩 플로우 완성

### Phase 4 완료 기준
- [ ] 모든 고급 위젯 구현 완료
- [ ] 성능 최적화 완료 (3초 이내 로딩)
- [ ] 데이터 백업/복구 시스템 동작
- [ ] 브라우저 호환성 확보

### Phase 5 완료 기준
- [ ] 테스트 커버리지 80% 이상
- [ ] E2E 테스트 모든 주요 플로우 커버
- [ ] 성능 기준 충족 (Core Web Vitals)
- [ ] 보안 취약점 검사 완료

### Phase 6 완료 기준
- [ ] 프로덕션 배포 완료
- [ ] 모니터링 시스템 동작
- [ ] SEO 최적화 완료
- [ ] 런칭 준비 완료

---

## 📈 성공 지표 (KPI)

### 기술적 지표
- **로딩 시간**: 3초 이내 (LCP)
- **상호작용 지연**: 100ms 이내 (FID)
- **누적 레이아웃 이동**: 0.1 이하 (CLS)
- **번들 크기**: 초기 JS 250KB 이하
- **테스트 커버리지**: 80% 이상

### 사용자 경험 지표
- **가입 완료율**: 60% 이상
- **첫 위젯 추가율**: 80% 이상
- **일간 활성 사용자**: 추후 측정
- **사용자 유지율**: 7일 기준 40% 이상
- **모바일 사용률**: 30% 이상

---

## 🛠 개발 체크리스트

### 각 기능 개발 시 확인사항
- [ ] TypeScript 타입 정의 완료
- [ ] 반응형 디자인 적용
- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 UI 구현
- [ ] 접근성 고려 (ARIA, 키보드 네비게이션)
- [ ] 테스트 코드 작성
- [ ] 성능 최적화 검토
- [ ] 보안 검토 (XSS, CSRF 등)
- [ ] 코드 리뷰 완료
- [ ] 문서화 업데이트

이 Todo List는 Frontend 우선 개발 방식으로 설계되어 있으며, 각 단계별로 사용자가 눈으로 확인할 수 있는 결과물을 우선적으로 구현한 후 백엔드 연동을 진행하는 방식입니다.