# PersonalDash 기술 명세서

## 개요
PersonalDash는 사용자 맞춤형 대시보드 플랫폼으로 Next.js 14와 Supabase를 활용한 모던 웹 애플리케이션입니다.

## 시스템 아키텍처

### 전체 시스템 구조
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  External APIs  │
│   (Next.js)     │    │   (Supabase)    │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 18      │◄──►│ • PostgreSQL    │    │ • OpenWeather   │
│ • TypeScript    │    │ • Auth          │    │ • Google APIs   │
│ • Tailwind CSS  │    │ • Storage       │    │ • Cloudinary    │
│ • Framer Motion │    │ • Realtime      │    │ • Vercel        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 프로젝트 폴더 구조
```
app/
├── (auth)/              # 인증 관련 라우트
├── dashboard/           # 대시보드 페이지
├── settings/            # 설정 페이지
├── api/                 # API 엔드포인트
├── components/          # 공통 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── widgets/        # 위젯 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── lib/                # 라이브러리 및 유틸리티
├── hooks/              # 커스텀 훅
├── store/              # 상태 관리
└── types/              # 타입 정의
```

## 기술 스택 상세

### Frontend 기술 스택

#### Next.js 14 (App Router)
- **버전**: 14.x (최신 안정 버전)
- **라우터**: App Router 사용
- **렌더링**: SSR + CSR 하이브리드
- **최적화**: 이미지 최적화, 번들 최적화

**핵심 설정:**
```typescript
// next.config.mjs
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}
```

#### TypeScript
- **버전**: 5.x
- **설정**: Strict 모드 활성화
- **타입 관리**: 중앙 집중식 타입 관리

**tsconfig.json 핵심 설정:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Tailwind CSS
- **버전**: 3.x
- **설정**: 커스텀 테마 설계
- **최적화**: PurgeCSS 자동 적용

**커스텀 테마 설정:**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
      }
    }
  }
}
```

#### Framer Motion
- **버전**: 10.x
- **용도**: 페이지 전환, 위젯 애니메이션
- **최적화**: 레이아웃 애니메이션, 성능 최적화

### Backend 기술 스택

#### Supabase
- **인증**: Built-in Auth with JWT
- **데이터베이스**: PostgreSQL 15+
- **스토리지**: 파일 업로드 및 CDN
- **실시간**: WebSocket 기반 실시간 데이터

**핵심 설정:**
```typescript
// lib/supabase/config.ts
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
}
```

#### PostgreSQL 스키마
```sql
-- 사용자 기본 테이블
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대시보드
CREATE TABLE dashboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '나의 대시보드',
  background_type dashboard_background_type DEFAULT 'color',
  background_value TEXT DEFAULT '#f3f4f6',
  layout_settings JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 위젯
CREATE TABLE widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  type widget_type NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENUM 타입
CREATE TYPE dashboard_background_type AS ENUM ('color', 'gradient', 'image');
CREATE TYPE widget_type AS ENUM ('link', 'checklist', 'clock', 'weather', 'calendar', 'memo', 'image');
```

## 상태 관리

### Zustand 스토어 구조
```typescript
// store/dashboard.ts
interface DashboardStore {
  // 대시보드 상태
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  isEditMode: boolean;
  
  // 위젯 상태
  widgets: Widget[];
  selectedWidget: string | null;
  draggedWidget: string | null;
  
  // UI 상태
  sidebarOpen: boolean;
  loading: boolean;
  
  // 액션
  setEditMode: (enabled: boolean) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  updateDashboard: (updates: Partial<Dashboard>) => void;
}
```

### 데이터 동기화
- **Supabase Realtime**: 실시간 데이터 동기화
- **Optimistic Updates**: 즉각적인 UI 반응
- **Error Handling**: 오류 시 롤백 처리

## 컴포넌트 설계

### 위젯 시스템
```typescript
// types/widget.ts
interface BaseWidget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, any>;
}

interface LinkWidget extends BaseWidget {
  type: 'link';
  settings: {
    url: string;
    title: string;
    icon?: string;
    description?: string;
  };
}

interface ChecklistWidget extends BaseWidget {
  type: 'checklist';
  settings: {
    title: string;
    items: ChecklistItem[];
  };
}
```

### 위젯 팩토리 패턴
```typescript
// components/widgets/WidgetFactory.tsx
const WidgetFactory: React.FC<{ widget: Widget }> = ({ widget }) => {
  switch (widget.type) {
    case 'link':
      return <LinkWidget {...widget} />;
    case 'checklist':
      return <ChecklistWidget {...widget} />;
    case 'clock':
      return <ClockWidget {...widget} />;
    default:
      return <div>Unknown widget type</div>;
  }
};
```

### 드래그 앤 드롭 시스템
```typescript
// hooks/useDragAndDrop.ts
export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };
  
  const handleDrop = (position: Position) => {
    if (draggedItem) {
      updateWidgetPosition(draggedItem, position);
      setDraggedItem(null);
    }
  };
  
  return { draggedItem, handleDragStart, handleDrop };
};
```

## 성능 최적화

### 번들 최적화
```typescript
// next.config.mjs
const nextConfig = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        widgets: {
          test: /[\\/]components[\\/]widgets[\\/]/,
          name: 'widgets',
          chunks: 'async',
        },
      },
    };
    return config;
  },
};
```

### 이미지 최적화
- **Next.js Image**: 자동 WebP 변환, 지연 로딩
- **Cloudinary**: CDN 및 실시간 변환
- **용량**: 업로드 시 최대 용량 (max 5MB)

### 페이징 최적화
```typescript
// hooks/useVirtualization.ts
export const useVirtualization = (items: Widget[], containerHeight: number) => {
  const [visibleItems, setVisibleItems] = useState<Widget[]>([]);
  
  useEffect(() => {
    // 화면 내 위젯만 렌더링
    const visible = items.filter(item => 
      isInViewport(item.position, containerHeight)
    );
    setVisibleItems(visible);
  }, [items, containerHeight]);
  
  return visibleItems;
};
```

## 보안 구현

### 인증 및 권한
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request });
  const { data: { session } } = await supabase.auth.getSession();
  
  // 보호된 경로 확인
  const protectedPaths = ['/dashboard', '/settings'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}
```

### 입력 검증
```typescript
// lib/validation.ts
import { z } from 'zod';

export const widgetSchema = z.object({
  type: z.enum(['link', 'checklist', 'clock']),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0)
  }),
  settings: z.record(z.any())
});

export const dashboardSchema = z.object({
  name: z.string().min(1).max(100),
  background_type: z.enum(['color', 'gradient', 'image']),
  background_value: z.string().max(255)
});
```

### XSS 방지
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHTML = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
};
```

## API 설계

### REST API 엔드포인트
```typescript
// app/api/dashboards/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  try {
    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('dashboards')
      .select('*, widgets(*)')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}
```

### GraphQL 스키마 (Future)
```graphql
type Dashboard {
  id: ID!
  name: String!
  backgroundType: BackgroundType!
  backgroundValue: String!
  widgets: [Widget!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Widget {
  id: ID!
  type: WidgetType!
  position: Position!
  size: Size!
  settings: JSON!
}

enum WidgetType {
  LINK
  CHECKLIST
  CLOCK
  WEATHER
  CALENDAR
}
```

## 테스트 전략

### 단위 테스트
```typescript
// __tests__/widgets/LinkWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { LinkWidget } from '@/components/widgets/LinkWidget';

describe('LinkWidget', () => {
  const mockWidget = {
    id: '1',
    type: 'link' as const,
    settings: {
      url: 'https://example.com',
      title: 'Example',
    }
  };

  it('renders link with correct URL and title', () => {
    render(<LinkWidget widget={mockWidget} />);
    
    const link = screen.getByRole('link', { name: 'Example' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
```

### E2E 테스트
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('user can add and configure a link widget', async ({ page }) => {
  await page.goto('/dashboard');
  
  // 위젯 추가
  await page.click('[data-testid="add-widget-button"]');
  await page.click('[data-testid="link-widget-option"]');
  
  // 위젯 설정
  await page.fill('[data-testid="widget-url-input"]', 'https://google.com');
  await page.fill('[data-testid="widget-title-input"]', 'Google');
  await page.click('[data-testid="save-widget-button"]');
  
  // 결과 검증
  await expect(page.locator('[data-testid="link-widget"]')).toBeVisible();
  await expect(page.locator('text=Google')).toBeVisible();
});
```

## 배포 및 운영

### Vercel 배포 설정
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 환경변수 관리
```bash
# .env.local (로컬)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENWEATHER_API_KEY=your_weather_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Vercel (프로덕션)
# 동일한 변수들을 Vercel 대시보드에서 설정
```

## 모니터링 및 분석

### 성능 모니터링
```typescript
// lib/analytics.ts
export const trackPerformance = () => {
  // Core Web Vitals 측정
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
};

// 사용자 이벤트 측정
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Analytics provider (Google Analytics, Mixpanel 등)
    gtag('event', eventName, properties);
  }
};
```

### 오류 추적
```typescript
// lib/errorTracking.ts
export const captureError = (error: Error, context?: Record<string, any>) => {
  console.error('Application Error:', error, context);
  
  // 프로덕션에서는 Sentry 등의 서비스
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }
};
```

## 향후 확장성

### 플러그인 시스템 고려사항
```typescript
// 외부 위젯을 지원하는 확장 구조
// widget-store/ (향후 계획)
// ├── link-widget/
// ├── calendar-widget/
// └── weather-widget/

// 동적 위젯 로딩
const DynamicWidget = dynamic(() => 
  import(`@widget-store/${widget.type}`), {
    loading: () => <WidgetSkeleton />,
    ssr: false
  }
);
```

### API 버전 관리
```typescript
// app/api/v1/dashboards/route.ts
// app/api/v2/dashboards/route.ts

// 버전별 라우팅
const API_VERSION = process.env.API_VERSION || 'v1';
```

## 국제화 (i18n) 고려사항
```typescript
// lib/i18n.ts
export const messages = {
  ko: {
    'dashboard.title': '대시보드',
    'widget.add': '위젯 추가',
  },
  en: {
    'dashboard.title': 'Dashboard',
    'widget.add': 'Add Widget',
  }
};
```