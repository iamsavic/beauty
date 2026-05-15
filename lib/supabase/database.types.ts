export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'super_admin' | 'org_admin' | 'manager' | 'receptionist' | 'worker' | 'client'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'late_cancel'
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'partial_refund'
export type ReviewStatus = 'pending' | 'published' | 'rejected'
export type WaitlistStatus = 'waiting' | 'notified' | 'booked' | 'expired'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          plan: 'solo' | 'team' | 'multi'
          is_multi_location: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      organization_settings: {
        Row: {
          id: string
          organization_id: string
          primary_color: string
          accent_color: string
          background_color: string
          text_color: string
          font_family: string
          button_style: 'rounded' | 'sharp' | 'pill'
          cover_image_url: string | null
          logo_url: string | null
          instagram_url: string | null
          google_business_url: string | null
          payment_enabled: boolean
          payment_mode: 'deposit' | 'full' | 'both'
          deposit_percentage: number
          cancellation_hours: number
          deposit_on_noshow: boolean
          repeat_reminder_enabled: boolean
          review_request_enabled: boolean
          onboarding_completed: boolean
          onboarding_steps: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organization_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organization_settings']['Insert']>
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string | null
          city: string | null
          phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      staff_roles: {
        Row: {
          id: string
          organization_id: string
          name: string
          role: UserRole
          permissions: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['staff_roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['staff_roles']['Insert']>
      }
      workers: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          user_id: string
          name: string
          email: string
          phone: string | null
          avatar_url: string | null
          bio: string | null
          role: UserRole
          working_hours: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['workers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['workers']['Insert']>
      }
      services: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          category: string
          duration_minutes: number
          price: number
          repeat_cycle_days: number | null
          image_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      packages: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          service_ids: string[]
          original_price: number
          discounted_price: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['packages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['packages']['Insert']>
      }
      promotions: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          applies_to: 'all' | 'service' | 'package'
          applies_to_ids: string[]
          promo_code: string | null
          starts_at: string
          ends_at: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['promotions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['promotions']['Insert']>
      }
      clients: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string
          name: string
          email: string
          phone: string | null
          is_guest: boolean
          no_show_count: number
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      client_profiles: {
        Row: {
          id: string
          client_id: string
          organization_id: string
          notes: string | null
          allergies: string | null
          preferences: string | null
          photo_urls: string[]
          favourite_service_id: string | null
          favourite_worker_id: string | null
          last_visit_date: string | null
          estimated_next_visit: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['client_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['client_profiles']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          worker_id: string
          client_id: string
          service_id: string | null
          package_id: string | null
          starts_at: string
          ends_at: string
          status: AppointmentStatus
          payment_status: PaymentStatus
          notes: string | null
          deposit_amount: number | null
          total_price: number
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      waitlist: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          service_id: string
          worker_id: string | null
          preferred_date_from: string | null
          preferred_date_to: string | null
          status: WaitlistStatus
          notified_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          organization_id: string
          appointment_id: string
          client_id: string
          worker_id: string | null
          rating: number
          comment: string | null
          status: ReviewStatus
          admin_reply: string | null
          review_token: string
          token_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      gallery_items: {
        Row: {
          id: string
          organization_id: string
          worker_id: string | null
          service_id: string | null
          image_url: string
          caption: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery_items']['Insert']>
      }
      loyalty_accounts: {
        Row: {
          id: string
          client_id: string
          organization_id: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_accounts']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['loyalty_accounts']['Insert']>
      }
      payments: {
        Row: {
          id: string
          appointment_id: string
          organization_id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: PaymentStatus
          type: 'deposit' | 'full' | 'refund'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      appointment_status: AppointmentStatus
      payment_status: PaymentStatus
      review_status: ReviewStatus
      waitlist_status: WaitlistStatus
    }
  }
}
