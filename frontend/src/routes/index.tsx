import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { RootLayout } from "@/layouts/RootLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "@/features/auth"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"
import { FullPageLoader } from "@/components/common/FullPageLoader"

// Reusable Suspense and ErrorBoundary wrapper
function withSuspense<P extends object>(Component: React.ComponentType<P>): React.ComponentType<P> {
  return function W(props: P) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// Lazy loaded page views
const Home = withSuspense(lazy(() => import("@/pages/Home")))
const DevShowcase = withSuspense(
  lazy(() => import("@/pages/DevShowcase").then((m) => ({ default: m.DevShowcase })))
)

// Auth
const Login = withSuspense(
  lazy(() => import("@/features/auth").then((m) => ({ default: m.Login })))
)
const SignUp = withSuspense(
  lazy(() => import("@/features/auth").then((m) => ({ default: m.SignUp })))
)
const ForgotPassword = withSuspense(
  lazy(() => import("@/features/auth").then((m) => ({ default: m.ForgotPassword })))
)
const ResetPassword = withSuspense(
  lazy(() => import("@/features/auth").then((m) => ({ default: m.ResetPassword })))
)

// Onboarding
const Onboarding = withSuspense(
  lazy(() => import("@/features/onboarding").then((m) => ({ default: m.Onboarding })))
)

// Features
const AuthenticatedHome = withSuspense(
  lazy(() => import("@/features/dashboard").then((m) => ({ default: m.Home })))
)
const Discover = withSuspense(
  lazy(() => import("@/features/discover").then((m) => ({ default: m.Discover })))
)
const MediaDetails = withSuspense(
  lazy(() => import("@/features/media").then((m) => ({ default: m.MediaDetails })))
)
const Library = withSuspense(
  lazy(() => import("@/features/library").then((m) => ({ default: m.Library })))
)
const WatchHistory = withSuspense(
  lazy(() => import("@/features/tracking").then((m) => ({ default: m.WatchHistory })))
)
const Statistics = withSuspense(
  lazy(() => import("@/features/statistics").then((m) => ({ default: m.Statistics })))
)
const Collections = withSuspense(
  lazy(() => import("@/features/collections").then((m) => ({ default: m.Collections })))
)
const CollectionDetails = withSuspense(
  lazy(() => import("@/features/collections").then((m) => ({ default: m.CollectionDetails })))
)
const Releases = withSuspense(
  lazy(() => import("@/features/releases").then((m) => ({ default: m.Releases })))
)
const Activity = withSuspense(
  lazy(() => import("@/features/activity").then((m) => ({ default: m.Activity })))
)
const Profile = withSuspense(
  lazy(() => import("@/features/profile").then((m) => ({ default: m.Profile })))
)
const SettingsPage = withSuspense(
  lazy(() => import("@/features/settings").then((m) => ({ default: m.SettingsPage })))
)
const Recommendations = withSuspense(
  lazy(() => import("@/features/recommendations").then((m) => ({ default: m.Recommendations })))
)
const OfflinePage = withSuspense(
  lazy(() =>
    import("@/features/pwa/components/OfflinePage").then((m) => ({ default: m.OfflinePage }))
  )
)
const Wrapped = withSuspense(
  lazy(() => import("@/features/wrapped/pages/Wrapped").then((m) => ({ default: m.Wrapped })))
)
const ImportExport = withSuspense(
  lazy(() =>
    import("@/features/import-export/pages/ImportExport").then((m) => ({ default: m.ImportExport }))
  )
)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dev/showcase",
        element: <DevShowcase />,
      },
      // Auth public guest routes
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "signup",
            element: <SignUp />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
        ],
      },
      // Protected private routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "onboarding",
            element: <Onboarding />,
          },
          {
            path: "home",
            element: <AuthenticatedHome />,
          },
          {
            path: "dashboard",
            element: <Navigate to="/home" replace />,
          },
          {
            path: "discover",
            element: <Discover />,
          },
          {
            path: "movie/:id",
            element: <MediaDetails type="movie" />,
          },
          {
            path: "tv/:id",
            element: <MediaDetails type="tv" />,
          },
          {
            path: "library",
            element: <Library />,
          },
          {
            path: "history",
            element: <WatchHistory />,
          },
          {
            path: "statistics",
            element: <Statistics />,
          },
          {
            path: "collections",
            element: <Collections />,
          },
          {
            path: "collections/:id",
            element: <CollectionDetails />,
          },
          {
            path: "releases",
            element: <Releases />,
          },
          {
            path: "activity",
            element: <Activity />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "recommendations",
            element: <Recommendations />,
          },
          {
            path: "wrapped",
            element: <Wrapped />,
          },
          {
            path: "import-export",
            element: <ImportExport />,
          },
          {
            path: "offline",
            element: <OfflinePage />,
          },
        ],
      },
    ],
  },
])
