/** Minimal typing until `supabase gen types` is wired. Expand per table as needed. */
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
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          status: string;
        };
      };
    };
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
