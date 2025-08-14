export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      dashboards: {
        Row: {
          id: string
          user_id: string
          name: string
          background_type: 'color' | 'gradient' | 'image'
          background_value: string
          layout_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          background_type: 'color' | 'gradient' | 'image'
          background_value: string
          layout_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          background_type?: 'color' | 'gradient' | 'image'
          background_value?: string
          layout_settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      widgets: {
        Row: {
          id: string
          dashboard_id: string
          type: 'link' | 'checklist' | 'clock' | 'weather' | 'calendar'
          position_x: number
          position_y: number
          width: number
          height: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dashboard_id: string
          type: 'link' | 'checklist' | 'clock' | 'weather' | 'calendar'
          position_x: number
          position_y: number
          width: number
          height: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dashboard_id?: string
          type?: 'link' | 'checklist' | 'clock' | 'weather' | 'calendar'
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}