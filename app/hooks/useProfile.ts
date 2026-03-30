import { useAuth } from "~/lib/auth";

export function useProfile() {
  const { profile, profileLoading, refreshProfile } = useAuth();
  return { profile, isLoading: profileLoading, refreshProfile };
}
