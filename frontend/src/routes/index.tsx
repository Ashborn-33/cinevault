import { createBrowserRouter } from "react-router-dom"
import { RootLayout } from "@/layouts/RootLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { Home } from "@/pages/Home"
import { DevShowcase } from "@/pages/DevShowcase"

import { Login, SignUp, ForgotPassword, ResetPassword, ProtectedRoute } from "@/features/auth"
import { Onboarding } from "@/features/onboarding"
import { Dashboard } from "@/features/dashboard/pages/Dashboard"
import { Discover } from "@/features/discover"
import { Library } from "@/features/library/pages/Library"
import { Statistics } from "@/features/statistics/pages/Statistics"
import { Collections } from "@/features/collections/pages/Collections"

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
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "discover",
            element: <Discover />,
          },
          {
            path: "library",
            element: <Library />,
          },
          {
            path: "statistics",
            element: <Statistics />,
          },
          {
            path: "collections",
            element: <Collections />,
          },
        ],
      },
    ],
  },
])
