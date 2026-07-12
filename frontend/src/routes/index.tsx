import { createBrowserRouter } from "react-router-dom"
import { RootLayout } from "@/layouts/RootLayout"
import { Home } from "@/pages/Home"
import { DevShowcase } from "@/pages/DevShowcase"

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
    ],
  },
])
