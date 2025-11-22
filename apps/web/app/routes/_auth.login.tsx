import { GalleryVerticalEnd } from "lucide-react"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"

import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/context/auth-context"

/**
 * Login page component.
 * Redirects authenticated users to their intended destination or dashboard.
 */
export default function LoginPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (session) {
      // Get the redirect URL from search params or default to dashboard
      const redirectTo = searchParams.get("redirectTo") || "/dashboard"
      navigate(redirectTo, { replace: true })
    }
  }, [session, navigate, searchParams])

  // Don't render login form if user is already authenticated
  if (session) {
    return null
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          My Library App
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
