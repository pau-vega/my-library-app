import type { Session, User } from "@supabase/supabase-js"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

import { authService } from "../services/auth-service"

/**
 * Hook for authentication operations
 *
 * Provides session, user, and auth actions in one hook
 *
 * @example
 * ```tsx
 * const { session, user, isLoading, login, logout } = useAuth()
 *
 * if (isLoading) return <Spinner />
 *
 * if (!session) {
 *   return <button onClick={() => login({ provider: "github" })}>Login</button>
 * }
 *
 * return (
 *   <div>
 *     <p>Welcome {user?.email}</p>
 *     <button onClick={() => logout()}>Logout</button>
 *   </div>
 * )
 * ```
 */
export const useAuth = () => {
  const queryClient = useQueryClient()

  const AUTH_SESSION_KEY = ["auth", "session"] as const
  const AUTH_USER_KEY = ["auth", "user"] as const

  // Subscribe to auth state changes to keep cache in sync
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((_event, session) => {
      // Update cache when auth state changes (e.g., login/logout in another tab, token expiration)
      queryClient.setQueryData(AUTH_SESSION_KEY, session)
      queryClient.setQueryData(AUTH_USER_KEY, session?.user ?? null)
    })

    return unsubscribe
  }, [queryClient])

  // Get session
  const { data: session, isLoading: isSessionLoading } = useQuery<Session | null, Error>({
    queryKey: AUTH_SESSION_KEY,
    queryFn: async () => {
      const result = await authService.getSession()
      if (!result.ok) throw result.error
      return result.value
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // Get user
  const { data: user, isLoading: isUserLoading } = useQuery<User | null, Error>({
    queryKey: AUTH_USER_KEY,
    queryFn: async () => {
      const result = await authService.getUser()
      if (!result.ok) throw result.error
      return result.value
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // Sign in mutation
  const { mutate: signInMutation, isPending: isSigningIn } = useMutation({
    mutationFn: authService.signInWithOAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY })
      queryClient.invalidateQueries({ queryKey: AUTH_USER_KEY })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Sign out mutation
  const { mutate: signOutMutation, isPending: isSigningOut } = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_KEY, null)
      queryClient.setQueryData(AUTH_USER_KEY, null)
      window.location.href = "/"
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    session,
    user,
    isLoading: isSessionLoading || isUserLoading,
    isAuthenticated: !!session,
    isSigningIn,
    isSigningOut,
    login: signInMutation,
    logout: signOutMutation,
  }
}
