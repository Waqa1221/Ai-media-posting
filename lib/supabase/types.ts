export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          bio: string | null
          website: string | null
          phone: string | null
          timezone: string
          language: string
          account_status: 'trial' | 'premium' | 'canceled' | 'suspended'
          subscription_tier: 'trial' | 'premium' | 'canceled'
          subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'suspended'
          stripe_customer_id: string | null
          trial_started_at: string | null
          trial_ends_at: string | null
          subscription_ends_at: string | null
          credits_remaining: number
          suspension_reason: string | null
          suspension_ends_at: string | null
          has_agency_setup: boolean
          last_login_at: string | null
          email_verified: boolean
          notification_preferences: Record<string, any>
          privacy_settings: Record<string, any>
          signup_source: string
          referral_code: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          bio?: string | null
          website?: string | null
          phone?: string | null
          timezone?: string
          language?: string
          account_status?: 'trial' | 'premium' | 'canceled' | 'suspended'
          subscription_tier?: 'trial' | 'premium' | 'canceled'
          subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'suspended'
          stripe_customer_id?: string | null
          trial_started_at?: string | null
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          credits_remaining?: number
          suspension_reason?: string | null
          suspension_ends_at?: string | null
          has_agency_setup?: boolean
          last_login_at?: string | null
          email_verified?: boolean
          notification_preferences?: Record<string, any>
          privacy_settings?: Record<string, any>
          signup_source?: string
          referral_code?: string | null
          onboarding_completed?: boolean
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          bio?: string | null
          website?: string | null
          phone?: string | null
          timezone?: string
          language?: string
          account_status?: 'trial' | 'premium' | 'canceled' | 'suspended'
          subscription_tier?: 'trial' | 'premium' | 'canceled'
          subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'suspended'
          stripe_customer_id?: string | null
          trial_started_at?: string | null
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          credits_remaining?: number
          suspension_reason?: string | null
          suspension_ends_at?: string | null
          has_agency_setup?: boolean
          last_login_at?: string | null
          email_verified?: boolean
          notification_preferences?: Record<string, any>
          privacy_settings?: Record<string, any>
          signup_source?: string
          referral_code?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'suspended'
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          cancellation_reason: string | null
          amount_cents: number
          currency: string
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'suspended'
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          cancellation_reason?: string | null
          amount_cents: number
          currency?: string
          metadata?: Record<string, any>
        }
        Update: {
          stripe_price_id?: string
          status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'suspended'
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          cancellation_reason?: string | null
          amount_cents?: number
          currency?: string
          metadata?: Record<string, any>
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest'
          platform_user_id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          access_token: string
          refresh_token: string | null
          token_type: string
          expires_at: string | null
          is_active: boolean
          is_verified: boolean
          connection_status: string
          last_sync_at: string
          platform_data: Record<string, any>
          account_type: string | null
          follower_count: number
          following_count: number
          posts_count: number
          error_message: string | null
          error_count: number
          last_error_at: string | null
          permissions: Record<string, any>
          capabilities: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest'
          platform_user_id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          access_token: string
          refresh_token?: string | null
          token_type?: string
          expires_at?: string | null
          is_active?: boolean
          is_verified?: boolean
          connection_status?: string
          last_sync_at?: string
          platform_data?: Record<string, any>
          account_type?: string | null
          follower_count?: number
          following_count?: number
          posts_count?: number
          error_message?: string | null
          error_count?: number
          last_error_at?: string | null
          permissions?: Record<string, any>
          capabilities?: Record<string, any>
        }
        Update: {
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          access_token?: string
          refresh_token?: string | null
          token_type?: string
          expires_at?: string | null
          is_active?: boolean
          is_verified?: boolean
          connection_status?: string
          last_sync_at?: string
          platform_data?: Record<string, any>
          account_type?: string | null
          follower_count?: number
          following_count?: number
          posts_count?: number
          error_message?: string | null
          error_count?: number
          last_error_at?: string | null
          permissions?: Record<string, any>
          capabilities?: Record<string, any>
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string | null
          content: string
          content_type: string
          platforms: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest')[]
          status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
          scheduled_for: string | null
          published_at: string | null
          ai_generated: boolean
          ai_prompt: string | null
          ai_model_used: string | null
          ai_generation_id: string | null
          media_urls: string[]
          media_metadata: Record<string, any>
          hashtags: string[]
          mentions: string[]
          location: string | null
          engagement_data: Record<string, any>
          performance_score: number
          error_message: string | null
          retry_count: number
          last_retry_at: string | null
          metadata: Record<string, any>
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          project_id?: string | null
          title?: string | null
          content: string
          content_type?: string
          platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest')[]
          status?: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
          scheduled_for?: string | null
          published_at?: string | null
          ai_generated?: boolean
          ai_prompt?: string | null
          ai_model_used?: string | null
          ai_generation_id?: string | null
          media_urls?: string[]
          media_metadata?: Record<string, any>
          hashtags?: string[]
          mentions?: string[]
          location?: string | null
          engagement_data?: Record<string, any>
          performance_score?: number
          error_message?: string | null
          retry_count?: number
          last_retry_at?: string | null
          metadata?: Record<string, any>
          tags?: string[]
        }
        Update: {
          project_id?: string | null
          title?: string | null
          content?: string
          content_type?: string
          platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest')[]
          status?: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
          scheduled_for?: string | null
          published_at?: string | null
          ai_generated?: boolean
          ai_prompt?: string | null
          ai_model_used?: string | null
          ai_generation_id?: string | null
          media_urls?: string[]
          media_metadata?: Record<string, any>
          hashtags?: string[]
          mentions?: string[]
          location?: string | null
          engagement_data?: Record<string, any>
          performance_score?: number
          error_message?: string | null
          retry_count?: number
          last_retry_at?: string | null
          metadata?: Record<string, any>
          tags?: string[]
          updated_at?: string
        }
      }
      ai_generations: {
        Row: {
          id: string
          user_id: string
          type: 'text' | 'image' | 'video' | 'caption' | 'hashtags' | 'thread'
          prompt: string
          result: string | null
          tokens_used: number
          cost_cents: number
          model_used: string | null
          quality_score: number | null
          user_rating: number | null
          error_message: string | null
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          user_id: string
          type: 'text' | 'image' | 'video' | 'caption' | 'hashtags' | 'thread'
          prompt: string
          result?: string | null
          tokens_used?: number
          cost_cents?: number
          model_used?: string | null
          quality_score?: number | null
          user_rating?: number | null
          error_message?: string | null
          metadata?: Record<string, any>
        }
        Update: {
          result?: string | null
          tokens_used?: number
          cost_cents?: number
          model_used?: string | null
          quality_score?: number | null
          user_rating?: number | null
          error_message?: string | null
          metadata?: Record<string, any>
        }
      }
      scheduling_queue: {
        Row: {
          id: string
          post_id: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest'
          scheduled_for: string
          priority: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          attempts: number
          max_attempts: number
          last_attempt_at: string | null
          next_retry_at: string | null
          error_message: string | null
          error_details: Record<string, any>
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          post_id: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest'
          scheduled_for: string
          priority?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          attempts?: number
          max_attempts?: number
          last_attempt_at?: string | null
          next_retry_at?: string | null
          error_message?: string | null
          error_details?: Record<string, any>
          metadata?: Record<string, any>
        }
        Update: {
          scheduled_for?: string
          priority?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          attempts?: number
          max_attempts?: number
          last_attempt_at?: string | null
          next_retry_at?: string | null
          error_message?: string | null
          error_details?: Record<string, any>
          metadata?: Record<string, any>
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          account_id: string | null
          platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | null
          metric_name: string
          metric_value: number
          metric_type: string
          recorded_at: string
          metric_date: string
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          user_id: string
          post_id?: string | null
          account_id?: string | null
          platform?: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | null
          metric_name: string
          metric_value: number
          metric_type?: string
          recorded_at?: string
          metric_date?: string
          metadata?: Record<string, any>
        }
        Update: {
          post_id?: string | null
          account_id?: string | null
          platform?: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | null
          metric_name?: string
          metric_value?: number
          metric_type?: string
          recorded_at?: string
          metric_date?: string
          metadata?: Record<string, any>
        }
      }
      usage_limits: {
        Row: {
          id: string
          user_id: string
          limit_type: string
          current_usage: number
          limit_value: number
          reset_date: string
          reset_frequency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          limit_type: string
          current_usage?: number
          limit_value: number
          reset_date: string
          reset_frequency?: string
        }
        Update: {
          current_usage?: number
          limit_value?: number
          reset_date?: string
          reset_frequency?: string
          updated_at?: string
        }
      }
      client_projects: {
        Row: {
          id: string
          user_id: string
          business_name: string
          industry: string
          description: string | null
          target_audience: string
          brand_voice: string
          content_pillars: string[]
          content_themes: string[]
          posting_frequency: string
          platforms: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest')[]
          optimal_times: Record<string, any>
          use_media_library: boolean
          use_ai_images: boolean
          automation_level: string
          is_active: boolean
          total_posts_generated: number
          total_engagement: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          business_name: string
          industry: string
          description?: string | null
          target_audience: string
          brand_voice: string
          content_pillars?: string[]
          content_themes?: string[]
          posting_frequency: string
          platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest')[]
          optimal_times?: Record<string, any>
          use_media_library?: boolean
          use_ai_images?: boolean
          automation_level?: string
          is_active?: boolean
          total_posts_generated?: number
          total_engagement?: number
        }
        Update: {
          business_name?: string
          industry?: string
          description?: string | null
          target_audience?: string
          brand_voice?: string
          content_pillars?: string[]
          content_themes?: string[]
          posting_frequency?: string
          platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest')[]
          optimal_times?: Record<string, any>
          use_media_library?: boolean
          use_ai_images?: boolean
          automation_level?: string
          is_active?: boolean
          total_posts_generated?: number
          total_engagement?: number
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: 'super_admin' | 'admin' | 'moderator'
          permissions: Record<string, any>
          is_active: boolean
          last_login_at: string | null
          login_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role: 'super_admin' | 'admin' | 'moderator'
          permissions?: Record<string, any>
          is_active?: boolean
          last_login_at?: string | null
          login_count?: number
          created_by?: string | null
        }
        Update: {
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: Record<string, any>
          is_active?: boolean
          last_login_at?: string | null
          login_count?: number
          updated_at?: string
        }
      }
      user_reports: {
        Row: {
          id: string
          reporter_id: string | null
          reported_user_id: string | null
          reported_post_id: string | null
          report_type: 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'fake_account' | 'other'
          description: string
          status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated'
          priority: 'low' | 'medium' | 'high' | 'critical'
          assigned_to: string | null
          resolution_notes: string | null
          resolved_at: string | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          reporter_id?: string | null
          reported_user_id?: string | null
          reported_post_id?: string | null
          report_type: 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'fake_account' | 'other'
          description: string
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          metadata?: Record<string, any>
        }
        Update: {
          report_type?: 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'fake_account' | 'other'
          description?: string
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          metadata?: Record<string, any>
          updated_at?: string
        }
      }
      automation_rules: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          name: string
          description: string | null
          trigger_type: 'schedule' | 'engagement_threshold' | 'hashtag_trending' | 'auto_response' | 'content_performance'
          trigger_conditions: Record<string, any>
          actions: Record<string, any>[]
          schedule_expression: string | null
          timezone: string
          is_active: boolean
          execution_count: number
          success_count: number
          last_executed_at: string | null
          next_execution_at: string | null
          error_count: number
          last_error_message: string | null
          last_error_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          project_id?: string | null
          name: string
          description?: string | null
          trigger_type: 'schedule' | 'engagement_threshold' | 'hashtag_trending' | 'auto_response' | 'content_performance'
          trigger_conditions?: Record<string, any>
          actions?: Record<string, any>[]
          schedule_expression?: string | null
          timezone?: string
          is_active?: boolean
          execution_count?: number
          success_count?: number
          last_executed_at?: string | null
          next_execution_at?: string | null
          error_count?: number
          last_error_message?: string | null
          last_error_at?: string | null
        }
        Update: {
          project_id?: string | null
          name?: string
          description?: string | null
          trigger_type?: 'schedule' | 'engagement_threshold' | 'hashtag_trending' | 'auto_response' | 'content_performance'
          trigger_conditions?: Record<string, any>
          actions?: Record<string, any>[]
          schedule_expression?: string | null
          timezone?: string
          is_active?: boolean
          execution_count?: number
          success_count?: number
          last_executed_at?: string | null
          next_execution_at?: string | null
          error_count?: number
          last_error_message?: string | null
          last_error_at?: string | null
          updated_at?: string
        }
      }
      media_library: {
        Row: {
          id: string
          user_id: string
          name: string
          original_name: string
          type: 'image' | 'video' | 'audio' | 'document'
          mime_type: string
          size_bytes: number
          url: string
          thumbnail_url: string | null
          storage_path: string | null
          folder_path: string
          tags: string[]
          alt_text: string | null
          description: string | null
          usage_count: number
          last_used_at: string | null
          metadata: Record<string, any>
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          original_name: string
          type: 'image' | 'video' | 'audio' | 'document'
          mime_type: string
          size_bytes: number
          url: string
          thumbnail_url?: string | null
          storage_path?: string | null
          folder_path?: string
          tags?: string[]
          alt_text?: string | null
          description?: string | null
          usage_count?: number
          last_used_at?: string | null
          metadata?: Record<string, any>
          uploaded_at?: string
        }
        Update: {
          name?: string
          original_name?: string
          type?: 'image' | 'video' | 'audio' | 'document'
          mime_type?: string
          size_bytes?: number
          url?: string
          thumbnail_url?: string | null
          storage_path?: string | null
          folder_path?: string
          tags?: string[]
          alt_text?: string | null
          description?: string | null
          usage_count?: number
          last_used_at?: string | null
          metadata?: Record<string, any>
          uploaded_at?: string
          updated_at?: string
        }
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          type: 'system' | 'engagement' | 'billing' | 'security' | 'feature' | 'admin'
          title: string
          message: string
          is_read: boolean
          is_archived: boolean
          action_url: string | null
          action_label: string | null
          metadata: Record<string, any>
          created_at: string
          read_at: string | null
        }
        Insert: {
          user_id: string
          type: 'system' | 'engagement' | 'billing' | 'security' | 'feature' | 'admin'
          title: string
          message: string
          is_read?: boolean
          is_archived?: boolean
          action_url?: string | null
          action_label?: string | null
          metadata?: Record<string, any>
        }
        Update: {
          type?: 'system' | 'engagement' | 'billing' | 'security' | 'feature' | 'admin'
          title?: string
          message?: string
          is_read?: boolean
          is_archived?: boolean
          action_url?: string | null
          action_label?: string | null
          metadata?: Record<string, any>
          read_at?: string | null
        }
      }
    }
    Functions: {
      increment_usage: {
        Args: {
          p_user_id: string
          p_limit_type: string
        }
        Returns: undefined
      }
      check_usage_limit: {
        Args: {
          p_user_id: string
          p_limit_type: string
        }
        Returns: boolean
      }
      get_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, any>
      }
      create_user_profile: {
        Args: {
          p_user_id: string
          p_email: string
          p_full_name?: string
          p_company_name?: string
        }
        Returns: string
      }
      connect_social_account: {
        Args: {
          p_user_id: string
          p_platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest'
          p_platform_user_id: string
          p_username: string
          p_display_name: string
          p_access_token: string
          p_refresh_token?: string
          p_expires_at?: string
          p_avatar_url?: string
          p_platform_data?: Record<string, any>
        }
        Returns: string
      }
      get_user_dashboard_data: {
        Args: {
          p_user_id: string
        }
        Returns: Record<string, any>
      }
      suspend_user: {
        Args: {
          p_user_id: string
          p_reason: string
          p_duration_days?: number
        }
        Returns: undefined
      }
      unsuspend_user: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      verify_user_email: {
        Args: {
          token: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_old_values?: Record<string, any>
          p_new_values?: Record<string, any>
        }
        Returns: undefined
      }
    }
  }
}