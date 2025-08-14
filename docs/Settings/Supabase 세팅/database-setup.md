# 데이터베이스 스키마 설정 가이드

## 개요
PersonalDash 프로젝트의 PostgreSQL 데이터베이스 스키마 구조와 설정 방법을 설명합니다.

## 데이터베이스 구조

### 핵심 테이블
1. **users** - 사용자 정보 (Supabase Auth 연동)
2. **dashboards** - 대시보드 설정
3. **widgets** - 위젯 데이터

### ER 다이어그램
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────▶│ dashboards  │────▶│   widgets   │
│             │ 1:N │             │ 1:N │             │
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ email       │     │ user_id(FK) │     │dashboard_id │
│ full_name   │     │ name        │     │ type        │
│ avatar_url  │     │ background  │     │ position    │
│ ...         │     │ ...         │     │ ...         │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 테이블 상세 구조

### 1. users 테이블
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**필드 설명:**
- `id`: Supabase Auth의 사용자 ID와 연동 (외래키)
- `email`: 사용자 이메일 (고유값)
- `full_name`: 사용자 실명 (선택사항)
- `avatar_url`: 프로필 이미지 URL (선택사항)

### 2. dashboards 테이블
```sql
CREATE TABLE public.dashboards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT '내 대시보드',
  background_type background_type DEFAULT 'color' NOT NULL,
  background_value TEXT DEFAULT '#f3f4f6' NOT NULL,
  layout_settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**필드 설명:**
- `background_type`: 배경 유형 ('color', 'gradient', 'image')
- `background_value`: 배경 값 (색상 코드, 그라데이션 CSS, 이미지 URL)
- `layout_settings`: 레이아웃 설정 (JSON 형태)

### 3. widgets 테이블
```sql
CREATE TABLE public.widgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE NOT NULL,
  type widget_type NOT NULL,
  position_x INTEGER DEFAULT 0 NOT NULL,
  position_y INTEGER DEFAULT 0 NOT NULL,
  width INTEGER DEFAULT 1 NOT NULL,
  height INTEGER DEFAULT 1 NOT NULL,
  settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**필드 설명:**
- `type`: 위젯 유형 ('link', 'checklist', 'clock', 'weather', 'calendar')
- `position_x/y`: 그리드상의 위치 좌표
- `width/height`: 위젯 크기 (그리드 단위)
- `settings`: 위젯별 설정 정보 (JSON 형태)

## ENUM 타입 정의

### background_type
```sql
CREATE TYPE background_type AS ENUM ('color', 'gradient', 'image');
```

### widget_type
```sql
CREATE TYPE widget_type AS ENUM ('link', 'checklist', 'clock', 'weather', 'calendar');
```

## 인덱스 설정

### 성능 최적화를 위한 인덱스
```sql
-- 대시보드 조회 최적화
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);

-- 위젯 조회 최적화
CREATE INDEX idx_widgets_dashboard_id ON public.widgets(dashboard_id);
CREATE INDEX idx_widgets_type ON public.widgets(type);
```

## 트리거 설정

### 자동 updated_at 갱신
```sql
-- 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 기본 대시보드 자동 생성
```sql
-- 새 사용자 등록 시 기본 대시보드 생성
CREATE OR REPLACE FUNCTION create_default_dashboard_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.dashboards (user_id, name, background_type, background_value)
  VALUES (NEW.id, '내 대시보드', 'gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_default_dashboard_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_dashboard_for_user();
```

## 마이그레이션 실행

### 1. Supabase SQL Editor 사용
1. Supabase 대시보드 → SQL Editor
2. `lib/supabase/database.sql` 내용 복사
3. "Run" 버튼으로 실행

### 2. CLI 사용 (선택사항)
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# 마이그레이션 실행
supabase db push
```

## 데이터 검증

### 테이블 생성 확인
```sql
-- 테이블 목록 조회
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 컬럼 정보 조회
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```

### 인덱스 확인
```sql
-- 인덱스 목록 조회
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 트리거 확인
```sql
-- 트리거 목록 조회
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

## 샘플 데이터

### 테스트용 데이터 삽입
```sql
-- 사용자 생성 (실제로는 Supabase Auth를 통해 생성됨)
INSERT INTO public.users (id, email, full_name) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', '테스트 사용자');

-- 대시보드 생성 (트리거에 의해 자동 생성되지만 수동으로도 가능)
INSERT INTO public.dashboards (user_id, name, background_type, background_value)
VALUES ('123e4567-e89b-12d3-a456-426614174000', '테스트 대시보드', 'color', '#3b82f6');

-- 위젯 생성 예시
INSERT INTO public.widgets (dashboard_id, type, position_x, position_y, settings)
VALUES (
  (SELECT id FROM dashboards WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' LIMIT 1),
  'link',
  0, 0,
  '{"title": "Google", "url": "https://google.com", "icon": "🔍"}'::jsonb
);
```

## 주의사항

### 데이터 타입
- `JSONB` 사용으로 성능 최적화
- `UUID` 사용으로 분산 환경 대응
- `TIMESTAMP WITH TIME ZONE` 사용으로 시간대 처리

### 외래키 제약조건
- `CASCADE DELETE` 설정으로 데이터 일관성 보장
- 사용자 삭제 시 관련 대시보드와 위젯 자동 삭제

### 성능 고려사항
- 적절한 인덱스 설정으로 조회 성능 최적화
- JSONB 필드의 GIN 인덱스 고려 (대용량 데이터 시)
- 파티셔닝 고려 (대용량 사용자 데이터 시)