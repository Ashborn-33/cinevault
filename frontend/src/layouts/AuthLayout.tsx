import { Outlet } from "react-router-dom"
import { Card } from "@/components/ui/card"

export function AuthLayout() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-medium shadow-level-2">
        <Outlet />
      </Card>
    </div>
  )
}
