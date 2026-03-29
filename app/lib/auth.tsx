import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ProfileRow } from "~/lib/api-types";
import { supabase } from "~/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  profileLoading: boolean;
  authReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Nudge: profiles fetch failed", error.message);
      return null;
    }

    if (data) {
      return data as ProfileRow;
    }

    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const row = await fetchProfile(uid);
    setProfile(row);
    setProfileLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    void (async () => {
      const {
        data: { session: existing },
      } = await supabase.auth.getSession();

      if (existing) {
        setSession(existing);
        setAuthReady(true);
        return;
      }

      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Nudge: anonymous sign-in failed", error.message);
      }

      const {
        data: { session: next },
      } = await supabase.auth.getSession();
      setSession(next);
      setAuthReady(true);
    })();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    void refreshProfile();
  }, [authReady, session?.user?.id, refreshProfile]);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/app/auth/callback`;
    const isAnon = session?.user?.is_anonymous === true;

    if (isAnon) {
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }, [session?.user?.is_anonymous]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Nudge: post-sign-out anonymous failed", error.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      profileLoading,
      authReady,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [
      session,
      profile,
      profileLoading,
      authReady,
      signInWithGoogle,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
