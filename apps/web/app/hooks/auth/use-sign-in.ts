import type { Provider } from "@supabase/supabase-js"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authService } from "../../services/auth-service"
import { authQueryKeys } from "./auth-query-keys"

interface SignInOptions {
  readonly provider: Provider
  readonly redirectTo?: string
}

interface UseSignInReturn {
  readonly signIn: (options: SignInOptions) => void
  readonly isSigningIn: boolean
  readonly isError: boolean
  readonly error: Error | null
}

/**
 * Provides sign-in functionality with OAuth providers
 *
 * Automatically invalidates auth queries on success and shows error toasts on failure
 *
 * @example
 * ```tsx
 * const { signIn, isSigningIn } = useSignIn()
 *
 * return (
 *   <button
 *     onClick={() => signIn({ provider: "github" })}
 *     disabled={isSigningIn}
 *   >
 *     {isSigningIn ? "Signing in..." : "Sign in with GitHub"}
 *   </button>
 * )
 * ```
 */
export const useSignIn = (): UseSignInReturn => {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: authService.signInWithOAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    signIn: mutate,
    isSigningIn: isPending,
    isError,
    error: error ?? null,
  }
}



