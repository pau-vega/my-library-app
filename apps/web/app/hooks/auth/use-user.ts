import type { User } from "@supabase/supabase-js"

import { useQuery } from "@tanstack/react-query"

import { getUser } from "../../services/auth-service"
import { authQueryKeys } from "./auth-query-keys"

interface UseUserReturn {
  readonly user: User | null | undefined
  readonly isLoading: boolean
  readonly isError: boolean
  readonly error: Error | null
}

/**
 * Fetches and caches the current user
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useUser()
 *
 * if (isLoading) return <Spinner />
 * if (!user) return <LoginPrompt />
 *
 * return <div>Welcome, {user.email}!</div>
 * ```
 */
export const useUser = (): UseUserReturn => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User | null, Error>({
    queryKey: authQueryKeys.user(),
    queryFn: async () => {
      const result = await getUser()
      if (!result.ok) throw result.error
      return result.value
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    user,
    isLoading,
    isError,
    error: error ?? null,
  }
}
