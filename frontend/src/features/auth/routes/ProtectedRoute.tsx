import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useProfile } from "@/features/onboarding"
import { LoadingSpinner } from "@/components/ui/loading"

export function ProtectedRoute() {
  const { session, loading: authLoading } = useAuth()
  const { onboardingCompleted, loading: profileLoading } = useProfile()
  const location = useLocation()

  const isInitializing = authLoading.initializing || (session && profileLoading)

  if (isInitializing) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to onboarding if not completed yet
  if (!onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />
  }

  // Prevent onboarded users from accessing /onboarding
  if (onboardingCompleted && location.pathname === "/onboarding") {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
