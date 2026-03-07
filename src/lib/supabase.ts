import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          encrypted_master_key: string
          salt: string
          two_factor_enabled: boolean
          two_factor_secret: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          encrypted_master_key: string
          salt: string
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          encrypted_master_key?: string
          salt?: string
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vault_items: {
        Row: {
          id: string
          user_id: string
          type: 'login' | 'secure_note' | 'card' | 'identity'
          name: string
          encrypted_data: string
          folder_id: string | null
          favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'login' | 'secure_note' | 'card' | 'identity'
          name: string
          encrypted_data: string
          folder_id?: string | null
          favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'login' | 'secure_note' | 'card' | 'identity'
          name?: string
          encrypted_data?: string
          folder_id?: string | null
          favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
    }
  }
}
