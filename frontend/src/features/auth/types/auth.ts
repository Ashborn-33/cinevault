export interface AuthUser {
  id: string
  email: string
  username?: string
}

export interface AuthSession {
  accessToken: string
  expiresAt?: number
  user: AuthUser
}

export interface AuthLoadingState {
  initializing: boolean
  signingIn: boolean
  signingUp: boolean
  signingOut: boolean
  resettingPassword: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  username: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
}
