import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          student_id?: string
          department?: string
          major?: string
          building_number?: string
          room_number?: string
          phone?: string
          avatar_url?: string
          risk_level: 'low' | 'medium' | 'high'
          cancelled_orders: number
          complaint_count: number
          trust_score: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      resources: {
        Row: {
          id: string
          seller_id: string
          type: 'item' | 'skill'
          title: string
          description: string
          price: number
          image_url: string
          category: string
          contact: string
          location: string
          campus_zone?: string
          building_name?: string
          views: number
          is_featured: boolean
          rating?: number
          rating_count?: number
          tags?: string[]
          available_for_exchange: boolean
          delivery_type: 'delivery' | 'pickup' | 'both'
          delivery_speed: 'fast' | 'normal' | 'slow'
          is_free_gift: boolean
          allow_bundle: boolean
          created_at: string
          expires_at?: string
        }
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'id' | 'created_at' | 'views' | 'rating_count'>
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          resource_type: 'item' | 'skill'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>
      }
      exchange_requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          offer_item_id: string
          request_item_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['exchange_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['exchange_requests']['Insert']>
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          resource_id: string
          type: 'purchase' | 'exchange'
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          delivery_type: 'delivery' | 'pickup' | 'both'
          meet_location?: string
          qr_code?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type Profiles = Tables['profiles']['Row']
export type Resources = Tables['resources']['Row']
export type Favorites = Tables['favorites']['Row']
export type ExchangeRequests = Tables['exchange_requests']['Row']
export type Orders = Tables['orders']['Row']
