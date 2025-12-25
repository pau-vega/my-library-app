import type { Session } from "@supabase/supabase-js"

import { useQuery } from "@tanstack/react-query"

import { authService } from "../../services/auth-service"
import { authQueryKeys } from "./auth-query-keys"

interface UseSessionReturn {
  readonly session: Session | null | undefined
  readonly isLoading: boolean
  readonly isError: boolean
  readonly error: Error | null
  readonly isAuthenticated: boolean
}

/**
 * Fetches and caches the current authentication session
 *
 * @example
 * ```tsx
 * const { session, isLoading, isAuthenticated } = useSession()
 *
 * if (isLoading) return <Spinner />
 * if (!isAuthenticated) return <LoginPrompt />
 *
 * return <div>Session: {session.user.email}</div>
 * ```
 */
export const useSession = (): UseSessionReturn => {
  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery<Session | null, Error>({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      const result = await authService.getSession()
      if (!result.ok) throw result.error
      return result.value
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    session,
    isLoading,
    isError,
    error: error ?? null,
    isAuthenticated: !!session,
  }
}



