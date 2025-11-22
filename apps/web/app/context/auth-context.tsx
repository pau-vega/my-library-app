import { createClient, type Session } from "@supabase/supabase-js"
import { createContext, use, useEffect, useState } from "react"
import { toast } from "sonner"

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

type AuthContextProviderProps = { children: React.ReactNode }

type AuthContext = {
  session: Session | null
  logout: () => void
  login: (redirectTo?: string) => void
}

export const AuthContext = createContext<AuthContext | null>(null)

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    // Redirect to home page after logout
    window.location.href = "/"
  }

  const handleLogin = async (redirectTo?: string) => {
    const redirectUrl = redirectTo || "/dashboard"
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}${redirectUrl}`,
      },
    })
    if (error) {
      toast.error(error.message)
    }
  }

  return <AuthContext value={{ session, logout: handleLogout, login: handleLogin }}>{children}</AuthContext>
}

export function useAuth() {
  const context = use(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider")
  }
  return context
}
