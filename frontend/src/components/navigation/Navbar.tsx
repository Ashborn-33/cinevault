import * as React from "react"
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom"
import {
  Home,
  Compass,
  Library,
  BarChart3,
  Layers,
  Calendar,
  History,
  Search,
  Sun,
  Moon,
} from "lucide-react"

import { useTheme } from "@/providers/ThemeProvider"
import { useAuth } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [isScrolled, setIsScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Track window scroll for transparency transitions
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close profile menu clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getInitials = () => {
    if (!user) return ""
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    return user.email.slice(0, 2).toUpperCase()
  }

  const navItems: NavItem[] = [
    { path: user ? "/dashboard" : "/", label: "Home", icon: Home },
    { path: "/discover", label: "Discover", icon: Compass },
    { path: "/library", label: "Library", icon: Library },
    { path: "/statistics", label: "Statistics", icon: BarChart3 },
    { path: "/collections", label: "Collections", icon: Layers },
    { path: "/releases", label: "Releases", icon: Calendar },
    { path: "/activity", label: "Activity", icon: History },
  ]

  return (
    <>
      {/* 1. Desktop Top Navigation Bar */}
      <header
        className={cn(
          "sticky top-0 z-sticky w-full border-b transition-all duration-medium ease-out-decelerate hidden md:block",
          isScrolled
            ? "bg-surface/90 backdrop-blur-md border-border shadow-level-1 py-3"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Wordmark */}
          <NavLink
            to={user ? "/dashboard" : "/"}
            className="font-heading text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            CineVault
          </NavLink>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1.5" aria-label="Desktop Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-3 py-2 text-sm font-semibold tracking-wide transition-colors duration-standard rounded-button outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Search Trigger Placeholder */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-input border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-all duration-instant cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search"
              onClick={() => alert("Search trigger placeholder clicked (⌘K)")}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-surface px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative h-9 w-9 rounded-button border border-border bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground cursor-pointer select-none flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
              aria-label="Toggle theme"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span
                  className={cn(
                    "absolute transition-all duration-standard ease-out-decelerate",
                    theme === "dark"
                      ? "scale-0 rotate-90 opacity-0"
                      : "scale-100 rotate-0 opacity-100"
                  )}
                >
                  <Sun className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "absolute transition-all duration-standard ease-out-decelerate",
                    theme === "dark"
                      ? "scale-100 rotate-0 opacity-100"
                      : "scale-0 -rotate-90 opacity-0"
                  )}
                >
                  <Moon className="h-4 w-4" />
                </span>
              </span>
            </button>

            {/* Profile Dropdown or Auth buttons */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-8 w-8 rounded-full border border-border bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-heading hover:border-primary cursor-pointer select-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="User Profile"
                >
                  {getInitials()}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-card border border-border bg-surface p-2 shadow-level-2 animate-in fade-in slide-in-from-top-1 duration-instant z-popover">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate font-medium">
                      {user.email}
                    </div>
                    <div className="my-1 border-t border-border/60"></div>
                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full block text-left px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-1"
                    >
                      My Profile
                    </NavLink>
                    <NavLink
                      to="/history"
                      onClick={() => setMenuOpen(false)}
                      className="w-full block text-left px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-1"
                    >
                      Watch History
                    </NavLink>
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false)
                        await signOut()
                        navigate("/login")
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-error hover:bg-error/5 rounded-button cursor-pointer transition-colors outline-none focus-visible:bg-error/10 font-bold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-sticky bg-surface/90 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden block shadow-level-2"
        aria-label="Mobile Navigation"
      >
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
