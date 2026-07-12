import { supabase } from "@/lib/supabase"
import type { LoginCredentials, SignupCredentials, AuthSession, AuthUser } from "../types/auth"
import type { Session as SupabaseSession, User as SupabaseUser } from "@supabase/supabase-js"

function mapUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email || "",
    username: user.user_metadata?.username,
  }
}

function mapSession(session: SupabaseSession): AuthSession {
  return {
    accessToken: session.access_token,
    expiresAt: session.expires_at,
    user: mapUser(session.user),
  }
}

export const AuthService = {
  async signInWithEmailAndPassword({ email, password }: LoginCredentials): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.session) throw new Error("No session returned from login.")
    return mapSession(data.session)
  },

  async signUpWithEmailAndPassword({
    email,
    password,
    username,
  }: SignupCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    if (error) throw error
    if (!data.user) throw new Error("No user returned from signup.")
    return mapUser(data.user)
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session ? mapSession(data.session) : null
  },

  onSessionChange(callback: (session: AuthSession | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session ? mapSession(session) : null)
    })
    return () => {
      subscription.unsubscribe()
    }
  },
}
