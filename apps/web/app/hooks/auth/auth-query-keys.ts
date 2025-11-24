/**
 * Centralized query key factory for auth-related queries
 *
 * This pattern provides:
 * - Type safety for query keys
 * - Easy invalidation of related queries
 * - Single source of truth for auth query keys
 */
export const authQueryKeys = {
  all: ["auth"] as const,
  sessions: () => [...authQueryKeys.all, "session"] as const,
  session: () => [...authQueryKeys.sessions()] as const,
  users: () => [...authQueryKeys.all, "user"] as const,
  user: () => [...authQueryKeys.users()] as const,
}



