import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          phone: string | null
          default_location: string | null
          default_filters: any | null
          stripe_customer_id: string | null
          plan: 'monthly' | 'yearly' | 'lifetime' | null
          subscription_status: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          default_location?: string | null
          default_filters?: any | null
          stripe_customer_id?: string | null
          plan?: 'monthly' | 'yearly' | 'lifetime' | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          default_location?: string | null
          default_filters?: any | null
          stripe_customer_id?: string | null
          plan?: 'monthly' | 'yearly' | 'lifetime' | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan: 'monthly' | 'yearly' | 'lifetime' | null
          status: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan?: 'monthly' | 'yearly' | 'lifetime' | null
          status?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan?: 'monthly' | 'yearly' | 'lifetime' | null
          status?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      contacted_businesses: {
        Row: {
          id: string
          user_id: string
          place_id: string
          name: string
          notes: string | null
          called: boolean
          emailed: boolean
          contacted_at: string
          raw: any | null
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          name: string
          notes?: string | null
          called?: boolean
          emailed?: boolean
          contacted_at?: string
          raw?: any | null
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          name?: string
          notes?: string | null
          called?: boolean
          emailed?: boolean
          contacted_at?: string
          raw?: any | null
        }
      }
      lifetime_allowlist: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export const createClientSupabaseClient = () => 
  createClientComponentClient<Database>()

// Server component Supabase client  
export const createServerSupabaseClient = async () => {
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  return createServerComponentClient<Database>({ cookies })
}

// Route handler Supabase client
export const createRouteHandlerSupabaseClient = async () => {
  const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  return createRouteHandlerClient<Database>({ cookies })
}

// Service role client (for admin operations)
export const createServiceRoleClient = () =>
  createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
