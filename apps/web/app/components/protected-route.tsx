import { Navigate } from "react-router"

import { useAuth } from "@/context/auth-context"

type ProtectedRouteProps = {
  readonly children: React.ReactNode
}

/**
 * Wrapper component that protects routes requiring authentication.
 * Redirects to login page if user is not authenticated.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactNode => {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
