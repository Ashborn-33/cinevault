import { Outlet } from "react-router-dom"

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-50 antialiased">
      {/* Header Placeholder */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            CineVault
          </div>
          <nav className="text-sm text-zinc-400">Header Navigation Placeholder</nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer className="border-t border-zinc-800 bg-zinc-900/20 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4">
          <p>© {new Date().getFullYear()} CineVault. All rights reserved. (Footer Placeholder)</p>
        </div>
      </footer>
    </div>
  )
}
