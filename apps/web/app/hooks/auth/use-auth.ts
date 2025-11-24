import type { Session, User } from "@supabase/supabase-js"

import { useSession } from "./use-session"
import { useSignIn } from "./use-sign-in"
import { useSignOut } from "./use-sign-out"
import { useUser } from "./use-user"

interface UseAuthReturn {
  readonly session: Session | null | undefined
  readonly user: User | null | undefined
  readonly isLoading: boolean
  readonly isAuthenticated: boolean
  readonly isSigningIn: boolean
  readonly isSigningOut: boolean
  readonly login: ReturnType<typeof useSignIn>["signIn"]
  readonly logout: ReturnType<typeof useSignOut>["signOut"]
}

/**
 * Composed hook that provides all authentication functionality
 *
 * This is a convenience hook that combines all auth hooks.
 * For more granular control, use the individual hooks directly:
 * - {@link useSession}
 * - {@link useUser}
 * - {@link useSignIn}
 * - {@link useSignOut}
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
export const useAuth = (): UseAuthReturn => {
  const { session, isLoading: isSessionLoading, isAuthenticated } = useSession()
  const { user, isLoading: isUserLoading } = useUser()
  const { signIn, isSigningIn } = useSignIn()
  const { signOut, isSigningOut } = useSignOut()

  return {
    session,
    user,
    isLoading: isSessionLoading || isUserLoading,
    isAuthenticated,
    isSigningIn,
    isSigningOut,
    login: signIn,
    logout: signOut,
  }
}



