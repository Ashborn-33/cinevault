import { Outlet } from "react-router-dom"

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased transition-colors duration-300">
      {/* Header Placeholder */}
      <header className="sticky top-0 z-sticky border-b border-border bg-surface/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold tracking-tight text-transparent">
            CineVault
          </div>
          <nav className="text-sm text-muted-foreground">Header Navigation Placeholder</nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer className="border-t border-border bg-surface/20 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <p>© {new Date().getFullYear()} CineVault. All rights reserved. (Footer Placeholder)</p>
        </div>
      </footer>
    </div>
  )
}
