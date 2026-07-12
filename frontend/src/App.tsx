import { RouterProvider } from "react-router-dom"
import { ErrorBoundary } from "react-error-boundary"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/features/auth"
import { ProfileProvider } from "@/features/onboarding"
import { GlobalErrorFallback } from "@/components/GlobalErrorFallback"
import { router } from "@/routes"

function App() {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <QueryProvider>
        <ThemeProvider defaultTheme="dark" storageKey="cinevault-theme">
          <AuthProvider>
            <ProfileProvider>
              <RouterProvider router={router} />
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
