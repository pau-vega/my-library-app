import { createClient, SupabaseClient, type Session, type User, type Provider } from "@supabase/supabase-js"

type Result<TData, TError extends Error> =
  | { readonly ok: true; readonly value: TData }
  | { readonly ok: false; readonly error: TError }

type SignInWithOAuthOptions = {
  readonly provider: Provider
  readonly redirectTo?: string
}

type AuthStateChangeCallback = (event: string, session: Session | null) => void

/**
 * Creates a Supabase client instance
 */
const getSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  console.log(supabaseUrl, supabaseKey)

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Builds the redirect URL for OAuth authentication
 */
const buildRedirectUrl = (redirectTo?: string): string => {
  return redirectTo || `${window.location.origin}/`
}

/**
 * Auth service for managing authentication with Supabase
 */
export const authService = {
  /**
   * Gets the current session from Supabase
   */
  async getSession(): Promise<Result<Session | null, Error>> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        return {
          ok: false,
          error: new Error(`Failed to get session: ${error.message}`),
        }
      }

      return {
        ok: true,
        value: data.session,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error("Unknown error occurred while getting session"),
      }
    }
  },

  /**
   * Gets the current user from Supabase
   */
  async getUser(): Promise<Result<User | null, Error>> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        return {
          ok: false,
          error: new Error(`Failed to get user: ${error.message}`),
        }
      }

      return {
        ok: true,
        value: data.user,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error("Unknown error occurred while getting user"),
      }
    }
  },

  /**
   * Signs in with OAuth provider
   */
  async signInWithOAuth(options: SignInWithOAuthOptions): Promise<Result<{ url: string } | null, Error>> {
    try {
      const supabase = getSupabaseClient()
      const redirectUrl = buildRedirectUrl(options.redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: options.provider,
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        return {
          ok: false,
          error: new Error(`Failed to sign in with OAuth: ${error.message}`),
        }
      }

      return {
        ok: true,
        value: data,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error("Unknown error occurred while signing in with OAuth"),
      }
    }
  },

  /**
   * Signs out the current user
   */
  async signOut(): Promise<Result<void, Error>> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          ok: false,
          error: new Error(`Failed to sign out: ${error.message}`),
        }
      }

      return {
        ok: true,
        value: undefined,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error("Unknown error occurred while signing out"),
      }
    }
  },

  /**
   * Subscribes to auth state changes
   * Returns a function to unsubscribe
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    const supabase = getSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })

    return () => {
      subscription.unsubscribe()
    }
  },

  /**
   * Gets the Supabase client instance
   * Useful for direct access to Supabase features not covered by this service
   */
  getSupabaseClientInstance(): SupabaseClient {
    return getSupabaseClient()
  },
}
