import { AuthError } from "@supabase/supabase-js"

export function getReadableAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred."

  let message: string

  if (error instanceof AuthError) {
    message = error.message
  } else if (error instanceof Error) {
    message = error.message
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    message = (error as Record<string, string>).message
  } else if (typeof error === "string") {
    message = error
  } else {
    return "An unexpected authentication error occurred. Please try again."
  }

  // Normalize message casing / content
  const normalized = message.toLowerCase()

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again."
  }
  if (normalized.includes("user already registered") || normalized.includes("already exists")) {
    return "An account with this email already exists."
  }
  if (normalized.includes("email not confirmed") || normalized.includes("confirm your email")) {
    return "Please confirm your email address by checking your inbox before logging in."
  }
  if (normalized.includes("password should be")) {
    return "Password must be at least 8 characters long."
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Too many requests. Please wait a moment before trying again."
  }
  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "Network error. Please check your internet connection and try again."
  }

  // Fallback to message if it is user-readable, otherwise generic
  if (
    message.length > 0 &&
    message.length < 120 &&
    !normalized.includes("database") &&
    !normalized.includes("sql")
  ) {
    return message
  }

  return "An unexpected authentication error occurred. Please try again."
}
