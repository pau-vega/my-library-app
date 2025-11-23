import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { signOut } from "../../services/auth-service"
import { authQueryKeys } from "./auth-query-keys"

interface UseSignOutReturn {
  readonly signOut: () => void
  readonly isSigningOut: boolean
  readonly isError: boolean
  readonly error: Error | null
}

/**
 * Provides sign-out functionality
 *
 * Automatically clears auth cache on success and redirects to home page
 *
 * @example
 * ```tsx
 * const { signOut, isSigningOut } = useSignOut()
 *
 * return (
 *   <button onClick={() => signOut()} disabled={isSigningOut}>
 *     {isSigningOut ? "Signing out..." : "Sign out"}
 *   </button>
 * )
 * ```
 */
export const useSignOut = (): UseSignOutReturn => {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.session(), null)
      queryClient.setQueryData(authQueryKeys.user(), null)
      window.location.href = "/"
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    signOut: mutate,
    isSigningOut: isPending,
    isError,
    error: error ?? null,
  }
}
