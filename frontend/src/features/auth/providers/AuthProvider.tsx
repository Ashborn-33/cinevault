import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthService } from "../services/auth.service"
import type {
  AuthUser,
  AuthSession,
  AuthLoadingState,
  LoginCredentials,
  SignupCredentials,
} from "../types/auth"

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: AuthLoadingState
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: SignupCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [session, setSession] = React.useState<AuthSession | null>(null)
  const [loading, setLoading] = React.useState<AuthLoadingState>({
    initializing: true,
    signingIn: false,
    signingUp: false,
    signingOut: false,
    resettingPassword: false,
  })

  // Future analytics event callback placeholders
  const onLoginSuccess = React.useCallback((u: AuthUser) => {
    console.log("[Auth Event] Login Success", u)
  }, [])

  const onLoginFailure = React.useCallback((err: Error) => {
    console.error("[Auth Event] Login Failure", err)
  }, [])

  const onLogout = React.useCallback(() => {
    console.log("[Auth Event] Logout Success")
  }, [])

  const onSignupSuccess = React.useCallback((u: AuthUser) => {
    console.log("[Auth Event] Signup Success", u)
  }, [])

  const onPasswordResetRequested = React.useCallback((e: string) => {
    console.log("[Auth Event] Password Reset Requested", e)
  }, [])

  // Auto Session Restore & listener binding
  React.useEffect(() => {
    let active = true

    async function initSession() {
      try {
        const currentSession = await AuthService.getCurrentSession()
        if (active) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
        }
      } catch (err) {
        console.error("Failed to restore session on mount", err)
      } finally {
        if (active) {
          setLoading((prev) => ({ ...prev, initializing: false }))
        }
      }
    }

    initSession()

    // Bind auth listener
    const unsubscribe = AuthService.onSessionChange((newSession) => {
      if (active) {
        setSession(newSession)
        setUser(newSession?.user ?? null)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = async (credentials: LoginCredentials) => {
    setLoading((prev) => ({ ...prev, signingIn: true }))
    try {
      const activeSession = await AuthService.signInWithEmailAndPassword(credentials)
      setSession(activeSession)
      setUser(activeSession.user)
      onLoginSuccess(activeSession.user)
    } catch (err) {
      onLoginFailure(err instanceof Error ? err : new Error(String(err)))
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, signingIn: false }))
    }
  }

  const signUp = async (credentials: SignupCredentials) => {
    setLoading((prev) => ({ ...prev, signingUp: true }))
    try {
      const activeUser = await AuthService.signUpWithEmailAndPassword(credentials)
      onSignupSuccess(activeUser)
    } finally {
      setLoading((prev) => ({ ...prev, signingUp: false }))
    }
  }

  const signOut = async () => {
    setLoading((prev) => ({ ...prev, signingOut: true }))
    try {
      await AuthService.signOut()
      setSession(null)
      setUser(null)
      onLogout()

      // Cache Management on Logout: Clear authenticated query caches
      queryClient.removeQueries({ queryKey: ["auth"] })
      queryClient.removeQueries({ queryKey: ["library"] })
      queryClient.removeQueries({ queryKey: ["collections"] })
      queryClient.removeQueries({ queryKey: ["statistics"] })
    } finally {
      setLoading((prev) => ({ ...prev, signingOut: false }))
    }
  }

  const resetPassword = async (email: string) => {
    setLoading((prev) => ({ ...prev, resettingPassword: true }))
    try {
      await AuthService.resetPassword(email)
      onPasswordResetRequested(email)
    } finally {
      setLoading((prev) => ({ ...prev, resettingPassword: false }))
    }
  }

  const updatePassword = async (password: string) => {
    setLoading((prev) => ({ ...prev, resettingPassword: true }))
    try {
      await AuthService.updatePassword(password)
    } finally {
      setLoading((prev) => ({ ...prev, resettingPassword: false }))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
