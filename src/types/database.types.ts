export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      batch_generations: {
        Row: {
          batch_type: Database["public"]["Enums"]["batch_type"];
          completed_scripts: number;
          created_at: string | null;
          current_step: string | null;
          error_message: string | null;
          generation_type: string;
          id: string;
          status: string;
          total_scripts: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          batch_type: Database["public"]["Enums"]["batch_type"];
          completed_scripts?: number;
          created_at?: string | null;
          current_step?: string | null;
          error_message?: string | null;
          generation_type?: string;
          id?: string;
          status?: string;
          total_scripts?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          batch_type?: Database["public"]["Enums"]["batch_type"];
          completed_scripts?: number;
          created_at?: string | null;
          current_step?: string | null;
          error_message?: string | null;
          generation_type?: string;
          id?: string;
          status?: string;
          total_scripts?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      generated_scripts: {
        Row: {
          batch_id: string | null;
          created_at: string | null;
          day_of_week: string | null;
          effort_level: string | null;
          error_message: string | null;
          id: string;
          optimal_hour: number | null;
          posting_status: Database["public"]["Enums"]["posting_status"] | null;
          predicted_growth_multiplier: number | null;
          previous_scripts: Json[] | null;
          processing_started_at: string | null;
          retry_count: number | null;
          script_content: Json | null;
          spoken_or_visual: string | null;
          status: string | null;
          target_date: string | null;
          updated_at: string | null;
          user_id: string;
          user_rating: number | null;
          video_idea: Json | null;
          viral_video_id: string | null;
        };
        Insert: {
          batch_id?: string | null;
          created_at?: string | null;
          day_of_week?: string | null;
          effort_level?: string | null;
          error_message?: string | null;
          id?: string;
          optimal_hour?: number | null;
          posting_status?: Database["public"]["Enums"]["posting_status"] | null;
          predicted_growth_multiplier?: number | null;
          previous_scripts?: Json[] | null;
          processing_started_at?: string | null;
          retry_count?: number | null;
          script_content?: Json | null;
          spoken_or_visual?: string | null;
          status?: string | null;
          target_date?: string | null;
          updated_at?: string | null;
          user_id: string;
          user_rating?: number | null;
          video_idea?: Json | null;
          viral_video_id?: string | null;
        };
        Update: {
          batch_id?: string | null;
          created_at?: string | null;
          day_of_week?: string | null;
          effort_level?: string | null;
          error_message?: string | null;
          id?: string;
          optimal_hour?: number | null;
          posting_status?: Database["public"]["Enums"]["posting_status"] | null;
          predicted_growth_multiplier?: number | null;
          previous_scripts?: Json[] | null;
          processing_started_at?: string | null;
          retry_count?: number | null;
          script_content?: Json | null;
          spoken_or_visual?: string | null;
          status?: string | null;
          target_date?: string | null;
          updated_at?: string | null;
          user_id?: string;
          user_rating?: number | null;
          video_idea?: Json | null;
          viral_video_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generated_scripts_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "batch_generations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_scripts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      instagram_videos: {
        Row: {
          ai_summary: string | null;
          caption: string | null;
          created_at: string | null;
          id: string;
          last_fetched_at: string | null;
          media_url: string;
          permalink: string | null;
          thumbnail_url: string | null;
          timestamp: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          ai_summary?: string | null;
          caption?: string | null;
          created_at?: string | null;
          id: string;
          last_fetched_at?: string | null;
          media_url: string;
          permalink?: string | null;
          thumbnail_url?: string | null;
          timestamp?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          ai_summary?: string | null;
          caption?: string | null;
          created_at?: string | null;
          id?: string;
          last_fetched_at?: string | null;
          media_url?: string;
          permalink?: string | null;
          thumbnail_url?: string | null;
          timestamp?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "instagram_videos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      niches: {
        Row: {
          created_at: string | null;
          id: number;
          last_updated: string | null;
          name: string;
          niche_embeddings: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          last_updated?: string | null;
          name: string;
          niche_embeddings?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          last_updated?: string | null;
          name?: string;
          niche_embeddings?: string | null;
        };
        Relationships: [];
      };
      optimal_posting_times: {
        Row: {
          created_at: string | null;
          id: string;
          niche_id: number | null;
          optimal_time: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          niche_id?: number | null;
          optimal_time: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          niche_id?: number | null;
          optimal_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "optimal_posting_times_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: true;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          ai_brand_summary: string | null;
          anything_else: string | null;
          asana_access_token: string | null;
          asana_connected: boolean | null;
          asana_refresh_token: string | null;
          asana_token_expiry: string | null;
          asana_user_id: string | null;
          asana_workspace_id: string | null;
          brand_summary_updated: boolean | null;
          brand_summary_updated_server: boolean | null;
          brand_voice: Json | null;
          completed_onboarding: boolean | null;
          content_type: Database["public"]["Enums"]["content_type_enum"] | null;
          core_interests: string | null;
          created_at: string | null;
          creator_type: string | null;
          daily_post_commitment: string | null;
          editing_styles: Json | null;
          email: string | null;
          filming_device: string | null;
          focus_songs: Json | null;
          full_name: string | null;
          gender: string | null;
          gmail_access_token: string | null;
          gmail_connected: boolean | null;
          gmail_email: string | null;
          gmail_refresh_token: string | null;
          gmail_token_expiry: string | null;
          has_instagram_videos: boolean | null;
          has_tiktok_videos: boolean | null;
          id: string;
          instagram_connected: boolean | null;
          instagram_processing_completed: boolean | null;
          last_brand_summary_generated: string | null;
          lyrics_1: string | null;
          lyrics_2: string | null;
          mission_statement: string | null;
          most_you: Json | null;
          music_feeling: Json | null;
          music_genre: string | null;
          product_name: string | null;
          seller: string | null;
          slideshow_completed: boolean | null;
          speaking_or_visual: string | null;
          tiktok_connected: boolean | null;
          updated_at: string | null;
          video_processing_completed: boolean | null;
          whatsapp_number: string | null;
        };
        Insert: {
          ai_brand_summary?: string | null;
          anything_else?: string | null;
          asana_access_token?: string | null;
          asana_connected?: boolean | null;
          asana_refresh_token?: string | null;
          asana_token_expiry?: string | null;
          asana_user_id?: string | null;
          asana_workspace_id?: string | null;
          brand_summary_updated?: boolean | null;
          brand_summary_updated_server?: boolean | null;
          brand_voice?: Json | null;
          completed_onboarding?: boolean | null;
          content_type?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null;
          core_interests?: string | null;
          created_at?: string | null;
          creator_type?: string | null;
          daily_post_commitment?: string | null;
          editing_styles?: Json | null;
          email?: string | null;
          filming_device?: string | null;
          focus_songs?: Json | null;
          full_name?: string | null;
          gender?: string | null;
          gmail_access_token?: string | null;
          gmail_connected?: boolean | null;
          gmail_email?: string | null;
          gmail_refresh_token?: string | null;
          gmail_token_expiry?: string | null;
          has_instagram_videos?: boolean | null;
          has_tiktok_videos?: boolean | null;
          id: string;
          instagram_connected?: boolean | null;
          instagram_processing_completed?: boolean | null;
          last_brand_summary_generated?: string | null;
          lyrics_1?: string | null;
          lyrics_2?: string | null;
          mission_statement?: string | null;
          most_you?: Json | null;
          music_feeling?: Json | null;
          music_genre?: string | null;
          product_name?: string | null;
          seller?: string | null;
          slideshow_completed?: boolean | null;
          speaking_or_visual?: string | null;
          tiktok_connected?: boolean | null;
          updated_at?: string | null;
          video_processing_completed?: boolean | null;
          whatsapp_number?: string | null;
        };
        Update: {
          ai_brand_summary?: string | null;
          anything_else?: string | null;
          asana_access_token?: string | null;
          asana_connected?: boolean | null;
          asana_refresh_token?: string | null;
          asana_token_expiry?: string | null;
          asana_user_id?: string | null;
          asana_workspace_id?: string | null;
          brand_summary_updated?: boolean | null;
          brand_summary_updated_server?: boolean | null;
          brand_voice?: Json | null;
          completed_onboarding?: boolean | null;
          content_type?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null;
          core_interests?: string | null;
          created_at?: string | null;
          creator_type?: string | null;
          daily_post_commitment?: string | null;
          editing_styles?: Json | null;
          email?: string | null;
          filming_device?: string | null;
          focus_songs?: Json | null;
          full_name?: string | null;
          gender?: string | null;
          gmail_access_token?: string | null;
          gmail_connected?: boolean | null;
          gmail_email?: string | null;
          gmail_refresh_token?: string | null;
          gmail_token_expiry?: string | null;
          has_instagram_videos?: boolean | null;
          has_tiktok_videos?: boolean | null;
          id?: string;
          instagram_connected?: boolean | null;
          instagram_processing_completed?: boolean | null;
          last_brand_summary_generated?: string | null;
          lyrics_1?: string | null;
          lyrics_2?: string | null;
          mission_statement?: string | null;
          most_you?: Json | null;
          music_feeling?: Json | null;
          music_genre?: string | null;
          product_name?: string | null;
          seller?: string | null;
          slideshow_completed?: boolean | null;
          speaking_or_visual?: string | null;
          tiktok_connected?: boolean | null;
          updated_at?: string | null;
          video_processing_completed?: boolean | null;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      social_tokens: {
        Row: {
          access_token: string;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          platform: string;
          platform_avatar_url: string | null;
          platform_display_name: string | null;
          platform_user_id: string | null;
          refresh_token: string | null;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          platform: string;
          platform_avatar_url?: string | null;
          platform_display_name?: string | null;
          platform_user_id?: string | null;
          refresh_token?: string | null;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          platform?: string;
          platform_avatar_url?: string | null;
          platform_display_name?: string | null;
          platform_user_id?: string | null;
          refresh_token?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          created_at: string | null;
          customer_email: string | null;
          has_access: boolean | null;
          id: string;
          past_due: boolean | null;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_email?: string | null;
          has_access?: boolean | null;
          id?: string;
          past_due?: boolean | null;
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_email?: string | null;
          has_access?: boolean | null;
          id?: string;
          past_due?: boolean | null;
          stripe_customer_id?: string;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      tiktok_videos: {
        Row: {
          ai_summary: string | null;
          comment_count: number | null;
          cover_image_url: string | null;
          create_time: string | null;
          created_at: string | null;
          description: string | null;
          duration: number | null;
          embed_html: string | null;
          embed_link: string | null;
          fetched_at: string | null;
          height: number | null;
          id: string;
          like_count: number | null;
          share_count: number | null;
          share_url: string | null;
          title: string | null;
          user_id: string;
          video_id: string | null;
          view_count: number | null;
          width: number | null;
        };
        Insert: {
          ai_summary?: string | null;
          comment_count?: number | null;
          cover_image_url?: string | null;
          create_time?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          embed_html?: string | null;
          embed_link?: string | null;
          fetched_at?: string | null;
          height?: number | null;
          id?: string;
          like_count?: number | null;
          share_count?: number | null;
          share_url?: string | null;
          title?: string | null;
          user_id: string;
          video_id?: string | null;
          view_count?: number | null;
          width?: number | null;
        };
        Update: {
          ai_summary?: string | null;
          comment_count?: number | null;
          cover_image_url?: string | null;
          create_time?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          embed_html?: string | null;
          embed_link?: string | null;
          fetched_at?: string | null;
          height?: number | null;
          id?: string;
          like_count?: number | null;
          share_count?: number | null;
          share_url?: string | null;
          title?: string | null;
          user_id?: string;
          video_id?: string | null;
          view_count?: number | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tiktok_videos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      top_videos: {
        Row: {
          ai_response: string | null;
          comments: number | null;
          created_at: string | null;
          duration_seconds: number | null;
          hashtags: string[] | null;
          id: string;
          likes: number | null;
          niche_id: number | null;
          rank: number;
          social_upload_date: string | null;
          source: string;
          thumbnail_url: string | null;
          title: string | null;
          transcript: string | null;
          username: string | null;
          vector_embedding: string | null;
          video_summary: Json | null;
          video_url: string | null;
          views: number | null;
        };
        Insert: {
          ai_response?: string | null;
          comments?: number | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          hashtags?: string[] | null;
          id?: string;
          likes?: number | null;
          niche_id?: number | null;
          rank: number;
          social_upload_date?: string | null;
          source?: string;
          thumbnail_url?: string | null;
          title?: string | null;
          transcript?: string | null;
          username?: string | null;
          vector_embedding?: string | null;
          video_summary?: Json | null;
          video_url?: string | null;
          views?: number | null;
        };
        Update: {
          ai_response?: string | null;
          comments?: number | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          hashtags?: string[] | null;
          id?: string;
          likes?: number | null;
          niche_id?: number | null;
          rank?: number;
          social_upload_date?: string | null;
          source?: string;
          thumbnail_url?: string | null;
          title?: string | null;
          transcript?: string | null;
          username?: string | null;
          vector_embedding?: string | null;
          video_summary?: Json | null;
          video_url?: string | null;
          views?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "top_videos_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: false;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          }
        ];
      };
      trending_hashtags: {
        Row: {
          created_at: string | null;
          hashtag_name: string | null;
          id: string;
          niche_id: number | null;
          source: string;
          usage_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          hashtag_name?: string | null;
          id?: string;
          niche_id?: number | null;
          source?: string;
          usage_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          hashtag_name?: string | null;
          id?: string;
          niche_id?: number | null;
          source?: string;
          usage_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "trending_hashtags_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: false;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          }
        ];
      };
      trending_sounds: {
        Row: {
          artist: string | null;
          audio_url: string | null;
          created_at: string | null;
          external_song_info: Json | null;
          id: string;
          matched_song_title: string | null;
          niche_id: number | null;
          rank: number;
          sound_name: string | null;
          source: string;
          usage_count: number | null;
        };
        Insert: {
          artist?: string | null;
          audio_url?: string | null;
          created_at?: string | null;
          external_song_info?: Json | null;
          id?: string;
          matched_song_title?: string | null;
          niche_id?: number | null;
          rank: number;
          sound_name?: string | null;
          source?: string;
          usage_count?: number | null;
        };
        Update: {
          artist?: string | null;
          audio_url?: string | null;
          created_at?: string | null;
          external_song_info?: Json | null;
          id?: string;
          matched_song_title?: string | null;
          niche_id?: number | null;
          rank?: number;
          sound_name?: string | null;
          source?: string;
          usage_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "trending_sounds_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: false;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          }
        ];
      };
      "videos-virality": {
        Row: {
          audience_relevance: number | null;
          comments: Json[] | null;
          created_at: string;
          engagement: number | null;
          hook: number | null;
          id: string;
          job_id: string | null;
          metadata: Json | null;
          status: Database["public"]["Enums"]["video_virality_status"];
          storage_key: string | null;
          user_id: string;
        };
        Insert: {
          audience_relevance?: number | null;
          comments?: Json[] | null;
          created_at?: string;
          engagement?: number | null;
          hook?: number | null;
          id?: string;
          job_id?: string | null;
          metadata?: Json | null;
          status?: Database["public"]["Enums"]["video_virality_status"];
          storage_key?: string | null;
          user_id?: string;
        };
        Update: {
          audience_relevance?: number | null;
          comments?: Json[] | null;
          created_at?: string;
          engagement?: number | null;
          hook?: number | null;
          id?: string;
          job_id?: string | null;
          metadata?: Json | null;
          status?: Database["public"]["Enums"]["video_virality_status"];
          storage_key?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "videos-virality_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      viral_musical_videos: {
        Row: {
          content_type: string | null;
          id: string;
          summary: string | null;
          vector_embedding: string | null;
          video_link: string;
        };
        Insert: {
          content_type?: string | null;
          id?: string;
          summary?: string | null;
          vector_embedding?: string | null;
          video_link: string;
        };
        Update: {
          content_type?: string | null;
          id?: string;
          summary?: string | null;
          vector_embedding?: string | null;
          video_link?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_optimal_posting_times: {
        Args: { niche_id_param: number };
        Returns: string;
      };
      match_documents: {
        Args: {
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          content: string;
          id: number;
          similarity: number;
        }[];
      };
      match_musical_videos: {
        Args: {
          content_type?: string;
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          similarity: number;
          summary: string;
        }[];
      };
      match_top_videos: {
        Args: {
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          similarity: number;
          video_summary: string;
        }[];
      };
      match_videos: {
        Args: {
          content_type?: string;
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          similarity: number;
          video_summary: Json;
        }[];
      };
    };
    Enums: {
      batch_type: "content-plan" | "scriptify";
      content_type_enum: "music" | "spoken" | "visual" | "spoken_and_visual";
      posting_status: "incomplete" | "recorded" | "edited" | "posted";
      video_virality_status: "IDLE" | "FAILED" | "COMPLETED" | "IN_PROGRESS";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      batch_type: ["content-plan", "scriptify"],
      content_type_enum: ["music", "spoken", "visual", "spoken_and_visual"],
      posting_status: ["incomplete", "recorded", "edited", "posted"],
      video_virality_status: ["IDLE", "FAILED", "COMPLETED", "IN_PROGRESS"],
    },
  },
} as const;
