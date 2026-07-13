import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { Button } from "@/components/ui/button"

export function Home() {
  const { session } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true })
    }
  }, [session, navigate])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center bg-background text-foreground transition-colors duration-300">
      <div className="max-w-2xl space-y-6">
        <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text font-heading text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-2 duration-medium">
          CineVault
        </h1>
        <p className="mx-auto max-w-xl font-sans text-lg font-medium tracking-normal text-muted-foreground sm:text-xl lg:text-2xl animate-in fade-in slide-in-from-bottom-3 duration-medium">
          Premium Entertainment Tracking Platform
        </p>
        <div className="pt-4 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-medium">
          <Button asChild>
            <Link to="/dev/showcase">Explore Design System</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
export default Home
