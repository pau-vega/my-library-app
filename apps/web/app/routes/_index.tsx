import { Button } from "@my-library-app/ui"
import { useNavigate } from "react-router"

import { useAuth } from "@/context/auth-context"

import type { Route } from "./+types/_index"

export function meta({}: Route.MetaArgs) {
  return [{ title: "My Library App" }, { name: "description", content: "Welcome to My Library App!" }]
}

export default function Home() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleNavigateToDashboard = () => {
    navigate("/dashboard")
  }

  const handleNavigateToLogin = () => {
    navigate("/login")
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to My Library App</h1>
        <p className="text-muted-foreground text-lg">
          Discover and search for books from the Google Books API. Create your personal library and explore millions of
          titles.
        </p>

        {session ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-muted-foreground text-sm">
              Logged in as <span className="font-medium">{session.user?.email}</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleNavigateToDashboard} size="lg">
                Go to Dashboard
              </Button>
              <Button onClick={logout} variant="outline" size="lg">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleNavigateToLogin} size="lg">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
