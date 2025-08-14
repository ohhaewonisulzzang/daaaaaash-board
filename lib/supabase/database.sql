-- PersonalDash 데이터베이스 스키마 및 RLS 정책 설정

-- 1. 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 사용자 테이블 생성 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. 대시보드 테이블 생성
CREATE TYPE background_type AS ENUM ('color', 'gradient', 'image');

CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT '내 대시보드',
  background_type background_type DEFAULT 'color' NOT NULL,
  background_value TEXT DEFAULT '#f3f4f6' NOT NULL,
  layout_settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. 위젯 테이블 생성
CREATE TYPE widget_type AS ENUM ('link', 'checklist', 'clock', 'weather', 'calendar');

CREATE TABLE IF NOT EXISTS public.widgets (
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

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard_id ON public.widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_widgets_type ON public.widgets(type);

-- 6. RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 생성

-- Users 테이블 정책
-- 사용자는 자신의 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Dashboards 테이블 정책
-- 사용자는 자신의 대시보드만 조회/수정/삭제 가능
CREATE POLICY "Users can view own dashboards" 
  ON public.dashboards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboards" 
  ON public.dashboards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboards" 
  ON public.dashboards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dashboards" 
  ON public.dashboards FOR DELETE 
  USING (auth.uid() = user_id);

-- Widgets 테이블 정책
-- 사용자는 자신의 대시보드에 속한 위젯만 조회/수정/삭제 가능
CREATE POLICY "Users can view own widgets" 
  ON public.widgets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert widgets to own dashboards" 
  ON public.widgets FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own widgets" 
  ON public.widgets FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own widgets" 
  ON public.widgets FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE dashboards.id = widgets.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- 8. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 트리거 적용
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at 
  BEFORE UPDATE ON public.dashboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widgets_updated_at 
  BEFORE UPDATE ON public.widgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 기본 대시보드 생성 함수
CREATE OR REPLACE FUNCTION create_default_dashboard_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.dashboards (user_id, name, background_type, background_value)
  VALUES (NEW.id, '내 대시보드', 'gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. 사용자 생성 시 기본 대시보드 자동 생성 트리거
CREATE TRIGGER create_default_dashboard_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_dashboard_for_user();

-- 12. 보안 설정 확인 함수
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