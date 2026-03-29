export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  credits: (userId: string) => ["credits", userId] as const,
} as const;
