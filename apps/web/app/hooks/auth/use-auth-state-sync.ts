import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { onAuthStateChange } from "../../services/auth-service"
import { authQueryKeys } from "./auth-query-keys"

/**
 * Subscribes to auth state changes and syncs with React Query cache
 *
 * This hook ensures that auth state changes (e.g., login/logout in another tab,
 * token expiration) are automatically reflected in the query cache
 *
 * @example
 * ```tsx
 * const MyApp = () => {
 *   useAuthStateSync()
 *   return <div>App content</div>
 * }
 * ```
 */
export const useAuthStateSync = (): void => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((_event, session) => {
      // Update cache when auth state changes
      queryClient.setQueryData(authQueryKeys.session(), session)
      queryClient.setQueryData(authQueryKeys.user(), session?.user ?? null)
    })

    return unsubscribe
  }, [queryClient])
}



