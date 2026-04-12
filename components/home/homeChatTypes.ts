export type HomeChatUsage = {
  limit: number;
  plan: "free" | "pro";
  remaining: number;
  resetAt: number;
};
