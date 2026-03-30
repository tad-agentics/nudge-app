/** Types aligned with supabase/migrations — expand when running `supabase gen types`. */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          timezone: string | null;
          auth_provider: string;
          calendar_provider: string;
          calendar_scheduling_enabled: boolean;
          subscription_status: string;
          subscription_phase: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          grace_period_ends_at: string | null;
          read_only_downgrade: boolean;
          lifetime_completions_count: number;
          nudge_calendar_id: string | null;
          last_calendar_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          timezone?: string | null;
          auth_provider?: string;
          calendar_provider?: string;
          calendar_scheduling_enabled?: boolean;
          subscription_status?: string;
          subscription_phase?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          grace_period_ends_at?: string | null;
          read_only_downgrade?: boolean;
          lifetime_completions_count?: number;
          nudge_calendar_id?: string | null;
          last_calendar_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          raw_input: string;
          title: string;
          action_type: string;
          action_target: string | null;
          action_target_confidence: number | null;
          category: string | null;
          effort_estimate_minutes: number | null;
          deadline: string | null;
          deadline_confidence: number | null;
          depends_on: string[] | null;
          parent_task_id: string | null;
          recurrence_rule: string | null;
          priority_score: number | null;
          rationale_text: string;
          rationale_tier: string;
          rationale_model: string | null;
          status: string;
          skip_count: number;
          created_at: string;
          completed_at: string | null;
          last_surfaced_at: string | null;
          is_save_moment: boolean;
          scheduled_at: string | null;
          calendar_event_id: string | null;
          calendar_provider: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          raw_input: string;
          title: string;
          action_type: string;
          action_target?: string | null;
          action_target_confidence?: number | null;
          category?: string | null;
          effort_estimate_minutes?: number | null;
          deadline?: string | null;
          deadline_confidence?: number | null;
          depends_on?: string[] | null;
          parent_task_id?: string | null;
          recurrence_rule?: string | null;
          priority_score?: number | null;
          rationale_text: string;
          rationale_tier: string;
          rationale_model?: string | null;
          status?: string;
          skip_count?: number;
          created_at?: string;
          completed_at?: string | null;
          last_surfaced_at?: string | null;
          is_save_moment?: boolean;
          scheduled_at?: string | null;
          calendar_event_id?: string | null;
          calendar_provider?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      behavioral_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          task_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          task_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["behavioral_events"]["Insert"]
        >;
        Relationships: [];
      };
      morning_plan_drafts: {
        Row: {
          user_id: string;
          plan_date: string;
          slots: unknown;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan_date: string;
          slots?: unknown;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["morning_plan_drafts"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
