import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { LoadingSpinner } from "@/components/ui/loading"

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading.initializing) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
