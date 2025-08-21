// 공통 타입 정의
import { User } from '@supabase/supabase-js'

export interface IUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// 인증 관련 타입
export interface IAuthUser extends User {
  fullName?: string
  avatarUrl?: string
}

export interface ILoginCredentials {
  email: string
  password: string
}

export interface ILoginResponse {
  success: boolean
  user?: IAuthUser
  error?: string
}

export interface IPost {
  id: string
  title: string
  content: string
  authorId: string
  author?: IUser
  createdAt: string
  updatedAt: string
}

export interface IComment {
  id: string
  text: string
  postId: string
  authorId: string
  author?: IUser
  createdAt: string
  updatedAt: string
}

export interface IDashboardStats {
  totalPosts: number
  totalComments: number
  totalViews: number
  weeklyGrowth: number
}

export interface IApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// 대시보드 관련 타입
export interface IDashboard {
  id: string
  user_id: string
  name: string
  background_type: 'color' | 'gradient' | 'image'
  background_value: string
  layout_settings: ILayoutSettings
  created_at: string
  updated_at: string
}

export interface ILayoutSettings {
  gridCols: number
  gridRows: number | 'auto'
  gap: number
}

// 위젯 관련 타입
export interface IWidget {
  id: string
  dashboard_id: string
  type: 'link' | 'checklist' | 'clock' | 'weather' | 'memo' | 'search' | 'calendar'
  position_x: number
  position_y: number
  width: number
  height: number
  settings: IWidgetSettings
  created_at: string
  updated_at: string
}

export type IWidgetSettings = 
  | ILinkSettings 
  | IChecklistSettings 
  | IClockSettings 
  | IWeatherSettings 
  | IMemoSettings 
  | ISearchSettings
  | ICalendarSettings

export interface ILinkSettings {
  url: string
  title: string
  icon?: string
  description?: string
}

export interface IChecklistSettings {
  title: string
  items: IChecklistItem[]
}

export interface IChecklistItem {
  id: string
  text: string
  completed: boolean
  created_at?: string
}

export interface IClockSettings {
  timezone?: string
  format?: '12h' | '24h'
  showDate?: boolean
  showSeconds?: boolean
}

export interface IWeatherSettings {
  city: string
  country?: string
  unit: 'metric' | 'imperial' | 'kelvin'
  showForecast?: boolean
}

export interface IMemoSettings {
  title: string
  content: string
  color?: string
}

export interface ISearchSettings {
  engines: ISearchEngine[]
  defaultEngine: string
  placeholder?: string
}

export interface ISearchEngine {
  id: string
  name: string
  url: string
  icon?: string
}

export interface ICalendarSettings {
  view?: 'month' | 'week' | 'day'
  startDayOfWeek?: number // 0: Sunday, 1: Monday
  showWeekNumbers?: boolean
  showTodayButton?: boolean
}

// 배경 관련 타입
export interface IBackgroundOption {
  type: 'color' | 'gradient' | 'image'
  value: string
  preview?: string
  name?: string
}

// 테마 관련 타입
export interface ITheme {
  id: string
  name: string
  isDark: boolean
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    accent: string
  }
}