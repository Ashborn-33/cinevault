import * as React from "react"
import { createPortal } from "react-dom"
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Compass,
  Library,
  BarChart3,
  Layers,
  History,
  Search,
  Sun,
  Moon,
  Gift,
  User,
  Settings as SettingsIcon,
  AlertTriangle,
  LogOut,
  Bell,
  X,
} from "lucide-react"

import { useTheme } from "@/providers/ThemeProvider"
import { useAuth } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePWA, InstallAppButton } from "@/features/pwa"
import { DeleteAccountModal } from "@/features/settings/components/DeleteAccountModal"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { isInstallable, install } = usePWA()
  const location = useLocation()
  const navigate = useNavigate()

  const [isScrolled, setIsScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  // Mock notifications state (visible only if count > 0)
  const [unreadNotifications] = React.useState(0)

  const menuRef = React.useRef<HTMLDivElement>(null)
  const desktopHeaderRef = React.useRef<HTMLElement>(null)
  const mobileNavRef = React.useRef<HTMLElement>(null)

  // Track desktop header height dynamically
  React.useEffect(() => {
    const header = desktopHeaderRef.current
    if (!header) return

    const updateHeight = () => {
      const height = header.offsetHeight
      document.documentElement.style.setProperty("--navbar-height", `${height}px`)
    }

    updateHeight()

    const observer = new ResizeObserver(() => {
      updateHeight()
    })
    observer.observe(header)

    return () => {
      observer.disconnect()
      document.documentElement.style.setProperty("--navbar-height", "0px")
    }
  }, [isScrolled])

  // Track mobile bottom navigation height dynamically
  React.useEffect(() => {
    const nav = mobileNavRef.current
    if (!nav) return

    const updateHeight = () => {
      const height = nav.offsetHeight
      document.documentElement.style.setProperty("--mobile-nav-height", `${height}px`)
    }

    updateHeight()

    const observer = new ResizeObserver(() => {
      updateHeight()
    })
    observer.observe(nav)

    return () => {
      observer.disconnect()
      document.documentElement.style.setProperty("--mobile-nav-height", "0px")
    }
  }, [user])

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

  const mobileDrawerRef = React.useRef<HTMLDivElement>(null)

  // Disable body scroll when drawer is open
  React.useEffect(() => {
    if (!mobileMenuOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileMenuOpen])

  // Handle focus trap and escape key
  React.useEffect(() => {
    if (!mobileMenuOpen) return

    const previousActiveElement = document.activeElement as HTMLElement
    if (mobileDrawerRef.current) {
      mobileDrawerRef.current.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
        return
      }

      if (e.key === "Tab") {
        if (!mobileDrawerRef.current) return
        const focusableElements = mobileDrawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (previousActiveElement) {
        previousActiveElement.focus()
      }
    }
  }, [mobileMenuOpen])

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

  // Primary top-level navigation items
  const primaryNavItems = [
    { path: user ? "/home" : "/", label: "Home", icon: Home },
    { path: "/discover", label: "Discover", icon: Compass },
    { path: "/library", label: "Library", icon: Library },
    { path: "/wrapped", label: "Wrapped", icon: Gift },
  ]

  const handleMobileProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileMenuOpen(true)
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    setMobileMenuOpen(false)
    await signOut()
    navigate("/login")
  }

  return (
    <>
      {/* 1. Desktop Top Navigation Bar */}
      <header
        ref={desktopHeaderRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300 ease-out-decelerate hidden md:block",
          isScrolled
            ? "bg-background/90 border-border shadow-lg py-3"
            : "bg-background/80 border-transparent py-5"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Wordmark */}
          <NavLink
            to={user ? "/home" : "/"}
            className="font-heading text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            CineVault
          </NavLink>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1.5" aria-label="Desktop Navigation">
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.path
              const isWrapped = item.label === "Wrapped"
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-3 py-2 text-sm font-semibold tracking-wide transition-colors duration-standard rounded-button outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-1.5",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isWrapped && (
                    <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full select-none ml-0.5 animate-in fade-in zoom-in-50 duration-standard">
                      2026
                    </span>
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  )}
                </NavLink>
              )
            })}

            {/* Optional Notifications Bell (Only when unread > 0) */}
            {unreadNotifications > 0 && (
              <button
                type="button"
                className="relative px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-button transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-1.5"
                aria-label="Notifications"
                onClick={() => alert("Notifications panel coming soon.")}
              >
                <Bell className="h-4 w-4 text-amber-500 animate-bounce" />
                <span>Notifications</span>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
              </button>
            )}
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
              <div className="flex items-center gap-3">
                <InstallAppButton isInstallable={isInstallable} onInstall={install} />
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

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-52 rounded-card border border-border bg-surface p-2 shadow-level-2 z-profile-dropdown font-sans text-xs"
                      >
                        <div className="px-2 py-1.5 text-[10px] text-muted-foreground truncate font-semibold">
                          {user.email}
                        </div>
                        <div className="my-1 border-t border-border/60"></div>

                        {/* Group 1: User & Settings */}
                        <NavLink
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-0.5"
                        >
                          <User className="h-3.5 w-3.5" />
                          My Profile
                        </NavLink>
                        <NavLink
                          to="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-1"
                        >
                          <SettingsIcon className="h-3.5 w-3.5" />
                          Settings
                        </NavLink>

                        <div className="my-1 border-t border-border/60"></div>

                        {/* Group 2: User lists & tracking data */}
                        <NavLink
                          to="/collections"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-0.5"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          Collections
                        </NavLink>
                        <NavLink
                          to="/statistics"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-0.5"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          Statistics
                        </NavLink>
                        <NavLink
                          to="/activity"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-1"
                        >
                          <History className="h-3.5 w-3.5" />
                          Activity Timeline
                        </NavLink>

                        <div className="my-1 border-t border-border/60"></div>

                        {/* Group 3: Operations */}
                        <NavLink
                          to="/import-export"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground rounded-button transition-colors outline-none font-bold mb-1"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          Import & Export
                        </NavLink>

                        <div className="my-1 border-t border-border/60"></div>

                        {/* Group 4: Account Actions */}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false)
                            setIsDeleteOpen(true)
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-error/5 hover:text-error rounded-button transition-colors outline-none font-bold mb-0.5 text-left"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-error" />
                          Delete Account
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-error hover:bg-error/5 rounded-button cursor-pointer transition-colors outline-none focus-visible:bg-error/10 font-bold text-left"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
        ref={mobileNavRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden block shadow-level-2"
        aria-label="Mobile Navigation"
      >
        <div className="flex justify-around items-center h-14 select-none">
          {primaryNavItems.map((item) => {
            const isActive = location.pathname === item.path
            const isWrapped = item.label === "Wrapped"
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                {isWrapped && (
                  <span className="absolute top-1 right-2 text-[7px] font-black bg-primary text-white px-1 rounded-full">
                    2026
                  </span>
                )}
              </NavLink>
            )
          })}

          {/* User profile item triggers bottom drawer */}
          {user ? (
            <button
              onClick={handleMobileProfileClick}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
                mobileMenuOpen ? "text-primary" : "text-muted-foreground"
              )}
            >
              <User className="h-5 w-5" />
              <span className="text-[9px] font-bold tracking-wide">Profile</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex flex-col items-center justify-center w-full h-full gap-0.5 outline-none text-muted-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-[9px] font-bold tracking-wide">Login</span>
            </NavLink>
          )}
        </div>
      </nav>

      {/* 3. Mobile Navigation Bottom Sheet Drawer */}
      {createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop md:hidden block"
              />

              <motion.div
                ref={mobileDrawerRef}
                tabIndex={-1}
                key="mobile-drawer-content"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 260 }}
                className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border rounded-t-3xl p-6 z-modal-content md:hidden block shadow-level-3 font-sans text-xs focus:outline-none max-h-[90dvh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4 shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-foreground">Account Options</h3>
                    <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-button hover:bg-surface-hover text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto flex-grow pr-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] scrollbar-thin">
                  {/* Group 1: Profile & Settings */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block">
                      Identity & Styling
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <NavLink
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 border border-border bg-surface-hover/20 hover:bg-surface-hover text-foreground font-bold rounded-button"
                      >
                        <User className="h-4 w-4 text-primary" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 border border-border bg-surface-hover/20 hover:bg-surface-hover text-foreground font-bold rounded-button"
                      >
                        <SettingsIcon className="h-4 w-4 text-primary" />
                        Settings
                      </NavLink>
                    </div>
                  </div>

                  {/* Group 2: Lists & Statistics */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block">
                      Logs & Tracking
                    </span>
                    <div className="space-y-1.5">
                      <NavLink
                        to="/collections"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-surface-hover text-foreground font-bold rounded-button border border-border/40"
                      >
                        <Layers className="h-4 w-4 text-accent" />
                        Collections List
                      </NavLink>
                      <NavLink
                        to="/statistics"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-surface-hover text-foreground font-bold rounded-button border border-border/40"
                      >
                        <BarChart3 className="h-4 w-4 text-accent" />
                        Statistics & Streak
                      </NavLink>
                      <NavLink
                        to="/activity"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-surface-hover text-foreground font-bold rounded-button border border-border/40"
                      >
                        <History className="h-4 w-4 text-accent" />
                        Activity Timeline
                      </NavLink>
                    </div>
                  </div>

                  {/* Group 3: Tools */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block">
                      Tools
                    </span>
                    <NavLink
                      to="/import-export"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-surface-hover text-foreground font-bold rounded-button border border-border/40"
                    >
                      <Compass className="h-4 w-4 text-emerald-400" />
                      Import & Export Hub
                    </NavLink>
                  </div>

                  {/* Group 4: Dangerous area */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setIsDeleteOpen(true)
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-error border border-error/25 hover:bg-error/5 rounded-button flex-1"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Delete Account
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-error hover:bg-error-hover rounded-button flex-1"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Account Modal (Accessible from both desktop and mobile layouts) */}
      <DeleteAccountModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </>
  )
}
export default Navbar
