export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  credits: (userId: string) => ["credits", userId] as const,
  tasks: (userId: string) => ["tasks", userId] as const,
  morningPreview: (userId: string, planDate: string) =>
    ["morningPreview", userId, planDate] as const,
  weeklyReview: (userId: string) => ["weeklyReview", userId] as const,
  weeklyInsight: (userId: string, weekKey: string) =>
    ["weeklyInsight", userId, weekKey] as const,
} as const;
