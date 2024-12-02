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
      automations: {
        Row: {
          id: string
          name: string
          description: string
          business_problem: string
          tools_integrated: string[]
          estimated_time_saved_hours: number
          featured_image: string
          category: string
          subcategory: string
          setup_time_minutes: number
          price_monthly: number
          price_yearly: number
          complexity_level: string
          rating: number
          review_count: number
          author_id: string
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          business_problem: string
          tools_integrated: string[]
          estimated_time_saved_hours: number
          featured_image: string
          category: string
          subcategory: string
          setup_time_minutes: number
          price_monthly: number
          price_yearly: number
          complexity_level: string
          rating?: number
          review_count?: number
          author_id: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          business_problem?: string
          tools_integrated?: string[]
          estimated_time_saved_hours?: number
          featured_image?: string
          category?: string
          subcategory?: string
          setup_time_minutes?: number
          price_monthly?: number
          price_yearly?: number
          complexity_level?: string
          rating?: number
          review_count?: number
          author_id?: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          avatar: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          avatar: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string
          created_at?: string
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
  }
}
