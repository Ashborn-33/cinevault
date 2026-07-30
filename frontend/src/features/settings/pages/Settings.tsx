import { useState, useEffect } from "react"
import { useAuth } from "@/features/auth"
import { usePreferences, useUpdatePreferences, useResetPreferences } from "../hooks/useSettings"
import { ThemeSelector } from "../components/ThemeSelector"
import { AccentColorPicker } from "../components/AccentColorPicker"
import { SettingsToggle } from "../components/SettingsToggle"
import { SettingsSelect } from "../components/SettingsSelect"
import { SettingsSkeleton } from "../components/SettingsSkeleton"
import { DeleteAccountModal } from "../components/DeleteAccountModal"
import { useTheme } from "@/providers/ThemeProvider"
import {
  Settings,
  Laptop,
  Bell,
  Play,
  Sparkles,
  Lock,
  User,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const STREAMING_SERVICES = ["Netflix", "Prime Video", "Disney+", "Apple TV+", "Crunchyroll", "Max"]
const LANGUAGES = ["English", "Japanese", "Spanish", "French", "Korean", "German"]

export function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: pref, isLoading, isError, error } = usePreferences()
  const updatePref = useUpdatePreferences()
  const resetPref = useResetPreferences()
  const { setTheme: setAppTheme } = useTheme()

  const [activeTab, setActiveTab] = useState<
    "appearance" | "notifications" | "playback" | "recommendations" | "privacy" | "account"
  >("appearance")
  const [expandedMobile, setExpandedMobile] = useState<Record<string, boolean>>({
    appearance: true,
    notifications: false,
    playback: false,
    recommendations: false,
    privacy: false,
    account: false,
  })
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Synchronize Accent color in the DOM
  useEffect(() => {
    if (pref?.accent_color) {
      document.documentElement.style.setProperty("--primary", pref.accent_color)
      document.documentElement.style.setProperty("--primary-hover", pref.accent_color)
    }
  }, [pref?.accent_color])

  // Synchronize Theme in the app theme context
  const handleThemeChange = (newTheme: string) => {
    updatePref.mutate({ theme: newTheme })
    setAppTheme(newTheme as "light" | "dark" | "system")
  }

  const handleToggleMobile = (section: string) => {
    setExpandedMobile((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleMultiToggle = (
    field: "preferred_streaming_services" | "preferred_languages",
    value: string,
    current: string[]
  ) => {
    const updated = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value]
    updatePref.mutate({ [field]: updated })
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  if (isError || !pref) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 flex items-center justify-center bg-background text-foreground text-center">
        <div className="p-8 border border-error/20 bg-error/5 rounded-card max-w-md font-sans">
          <p className="text-sm font-bold text-error">Failed to load settings preferences.</p>
          <p className="text-xs text-muted-foreground mt-2">{error?.message}</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Laptop },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "playback", label: "Playback & Library", icon: Play },
    { id: "recommendations", label: "Recommendations", icon: Sparkles },
    { id: "privacy", label: "Privacy & Data", icon: Lock },
    { id: "account", label: "Account Info", icon: User },
  ] as const

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background font-sans">
      {/* Header and Reset buttons */}
      <div className="flex justify-between items-start border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 select-none">
            <Settings className="h-8 w-8 text-primary" />
            Preferences
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure CineVault tracking features, notifications, styling, and streaming profiles.
          </p>
        </div>
        <Button
          onClick={() => resetPref.mutate()}
          variant="outline"
          size="sm"
          disabled={resetPref.isPending}
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Defaults
        </Button>
      </div>

      {/* Main Settings Navigation Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar tabs */}
        <div className="hidden lg:flex flex-col gap-1 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-button text-xs font-extrabold text-left cursor-pointer transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface/20"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Box panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1. APPEARANCE */}
          <section
            className={`border border-border bg-surface/35 rounded-card p-6 shadow-sm ${activeTab !== "appearance" ? "lg:hidden" : ""}`}
          >
            <button
              onClick={() => handleToggleMobile("appearance")}
              className="w-full flex justify-between items-center lg:hidden font-heading text-sm font-extrabold pb-3 border-b border-border/40 select-none text-left"
            >
              <span className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" /> Appearance Settings
              </span>
              {expandedMobile.appearance ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <h3 className="hidden lg:block font-heading text-sm font-black pb-3 border-b border-border/40 select-none">
              Appearance Settings
            </h3>

            {(expandedMobile.appearance || activeTab === "appearance") && (
              <div className="space-y-4 mt-4 animate-in fade-in duration-medium">
                <ThemeSelector value={pref.theme} onChange={handleThemeChange} />
                <AccentColorPicker
                  value={pref.accent_color}
                  onChange={(c) => updatePref.mutate({ accent_color: c })}
                />
                <SettingsSelect
                  label="Display Language"
                  description="Choose system UI localized language."
                  value={pref.language}
                  options={[
                    { value: "en", label: "English (US)" },
                    { value: "es", label: "Spanish (ES)" },
                    { value: "fr", label: "French (FR)" },
                    { value: "ja", label: "Japanese (JA)" },
                  ]}
                  onChange={(v) => updatePref.mutate({ language: v })}
                />
                <SettingsSelect
                  label="Default Landing Page"
                  description="Initial screen loaded after authenticating."
                  value={pref.default_home}
                  options={[
                    { value: "dashboard", label: "Dashboard" },
                    { value: "discover", label: "Discover" },
                    { value: "library", label: "Personal Library" },
                  ]}
                  onChange={(v) => updatePref.mutate({ default_home: v })}
                />
              </div>
            )}
          </section>

          {/* 2. NOTIFICATIONS */}
          <section
            className={`border border-border bg-surface/35 rounded-card p-6 shadow-sm ${activeTab !== "notifications" ? "lg:hidden" : ""}`}
          >
            <button
              onClick={() => handleToggleMobile("notifications")}
              className="w-full flex justify-between items-center lg:hidden font-heading text-sm font-extrabold pb-3 border-b border-border/40 select-none text-left"
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notification Settings
              </span>
              {expandedMobile.notifications ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <h3 className="hidden lg:block font-heading text-sm font-black pb-3 border-b border-border/40 select-none">
              Notification Settings
            </h3>

            {(expandedMobile.notifications || activeTab === "notifications") && (
              <div className="space-y-4 mt-4 animate-in fade-in duration-medium">
                <SettingsToggle
                  label="Upcoming Episodes"
                  description="Send reminders when library TV shows air new episodes."
                  checked={pref.release_notifications}
                  onChange={(v) => updatePref.mutate({ release_notifications: v })}
                />
                <SettingsToggle
                  label="Achievements alerts"
                  description="Notify immediately on unlocking viewer profile badges."
                  checked={pref.achievement_notifications}
                  onChange={(v) => updatePref.mutate({ achievement_notifications: v })}
                />
                <SettingsToggle
                  label="Email Digests"
                  description="Send weekly summaries of watch progression."
                  checked={pref.email_notifications}
                  onChange={(v) => updatePref.mutate({ email_notifications: v })}
                />
                <SettingsToggle
                  label="Push Reminders"
                  description="Push system notifications for watch streaks."
                  checked={pref.push_notifications}
                  onChange={(v) => updatePref.mutate({ push_notifications: v })}
                />
              </div>
            )}
          </section>

          {/* 3. PLAYBACK */}
          <section
            className={`border border-border bg-surface/35 rounded-card p-6 shadow-sm ${activeTab !== "playback" ? "lg:hidden" : ""}`}
          >
            <button
              onClick={() => handleToggleMobile("playback")}
              className="w-full flex justify-between items-center lg:hidden font-heading text-sm font-extrabold pb-3 border-b border-border/40 select-none text-left"
            >
              <span className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" /> Playback & Library
              </span>
              {expandedMobile.playback ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <h3 className="hidden lg:block font-heading text-sm font-black pb-3 border-b border-border/40 select-none">
              Playback & Library Settings
            </h3>

            {(expandedMobile.playback || activeTab === "playback") && (
              <div className="space-y-4 mt-4 animate-in fade-in duration-medium">
                <SettingsToggle
                  label="Auto Continue Tracking"
                  description="Automatically update watch progress on click updates."
                  checked={pref.auto_continue_tracking}
                  onChange={(v) => updatePref.mutate({ auto_continue_tracking: v })}
                />
                <SettingsToggle
                  label="Auto Mark Next Episode"
                  description="Mark next episodic TV item active after watch completions."
                  checked={pref.auto_mark_next_episode}
                  onChange={(v) => updatePref.mutate({ auto_mark_next_episode: v })}
                />
                <SettingsSelect
                  label="Default Status"
                  description="Default catalog bucket when adding content."
                  value={pref.default_media_status}
                  options={[
                    { value: "plan_to_watch", label: "Plan to Watch" },
                    { value: "watching", label: "Watching" },
                    { value: "completed", label: "Completed" },
                  ]}
                  onChange={(v) => updatePref.mutate({ default_media_status: v })}
                />
                <SettingsToggle
                  label="Hide Completed Titles"
                  description="Filter library dashboards to exclude fully completed titles."
                  checked={pref.hide_completed}
                  onChange={(v) => updatePref.mutate({ hide_completed: v })}
                />
              </div>
            )}
          </section>

          {/* 4. RECOMMENDATIONS */}
          <section
            className={`border border-border bg-surface/35 rounded-card p-6 shadow-sm ${activeTab !== "recommendations" ? "lg:hidden" : ""}`}
          >
            <button
              onClick={() => handleToggleMobile("recommendations")}
              className="w-full flex justify-between items-center lg:hidden font-heading text-sm font-extrabold pb-3 border-b border-border/40 select-none text-left"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Recommendations
              </span>
              {expandedMobile.recommendations ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <h3 className="hidden lg:block font-heading text-sm font-black pb-3 border-b border-border/40 select-none">
              Recommendations & Filters
            </h3>

            {(expandedMobile.recommendations || activeTab === "recommendations") && (
              <div className="space-y-5 mt-4 animate-in fade-in duration-medium select-none text-xs font-semibold">
                <SettingsToggle
                  label="Hide Adult Content"
                  description="Filter discover lists to remove 18+ titles."
                  checked={pref.hide_adult_content}
                  onChange={(v) => updatePref.mutate({ hide_adult_content: v })}
                />

                {/* Streaming services checklist */}
                <div className="space-y-2 border border-border/40 bg-zinc-950/20 rounded-card p-3">
                  <label className="text-muted-foreground block text-[10px] font-black uppercase tracking-wider">
                    Streaming Subscriptions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STREAMING_SERVICES.map((s) => {
                      const isSelected = pref.preferred_streaming_services.includes(s)
                      return (
                        <label
                          key={s}
                          className={`flex items-center gap-2 p-2 border rounded-button cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-surface border-border/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleMultiToggle(
                                "preferred_streaming_services",
                                s,
                                pref.preferred_streaming_services
                              )
                            }
                            className="h-3.5 w-3.5 border-border rounded accent-primary cursor-pointer"
                          />
                          {s}
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Preferred languages checklist */}
                <div className="space-y-2 border border-border/40 bg-zinc-950/20 rounded-card p-3">
                  <label className="text-muted-foreground block text-[10px] font-black uppercase tracking-wider">
                    Preferred Media Languages
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((l) => {
                      const isSelected = pref.preferred_languages.includes(l)
                      return (
                        <label
                          key={l}
                          className={`flex items-center gap-2 p-2 border rounded-button cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-surface border-border/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleMultiToggle("preferred_languages", l, pref.preferred_languages)
                            }
                            className="h-3.5 w-3.5 border-border rounded accent-primary cursor-pointer"
                          />
                          {l}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 5. PRIVACY */}
          <section
            className={`border border-border bg-surface/35 rounded-card p-6 shadow-sm ${activeTab !== "privacy" ? "lg:hidden" : ""}`}
          >
            <button
              onClick={() => handleToggleMobile("privacy")}
              className="w-full flex justify-between items-center lg:hidden font-heading text-sm font-extrabold pb-3 border-b border-border/40 select-none text-left"
            >
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Privacy & Data
              </span>
              {expandedMobile.privacy ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <h3 className="hidden lg:block font-heading text-sm font-black pb-3 border-b border-border/40 select-none">
              Privacy & Data Options
            </h3>

            {(expandedMobile.privacy || activeTab === "privacy") && (
              <div className="space-y-4 mt-4 animate-in fade-in duration-medium text-xs font-semibold">
                <SettingsToggle
                  label="Spoiler Alerts"
                  description="Overlay review summaries and ratings with spoiler warnings."
                  checked={pref.show_spoilers}
                  onChange={(v) => updatePref.mutate({ show_spoilers: v })}
                />

                <div className="border border-border/40 bg-zinc-950/20 rounded-card p-4 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">Data Operations</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                      Export library backup rows or delete auth accounts.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/import-export")}>
                      Export & Import Data
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 6. ACCOUNT */}
          <section
            className={`border border-border bg-surface/35 rounded-card p-6 shadow-sm ${activeTab !== "account" ? "lg:hidden" : ""}`}
          >
            <button
              onClick={() => handleToggleMobile("account")}
              className="w-full flex justify-between items-center lg:hidden font-heading text-sm font-extrabold pb-3 border-b border-border/40 select-none text-left"
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Account details
              </span>
              {expandedMobile.account ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <h3 className="hidden lg:block font-heading text-sm font-black pb-3 border-b border-border/40 select-none">
              Account details
            </h3>

            {(expandedMobile.account || activeTab === "account") && (
              <div className="space-y-4 mt-4 animate-in fade-in duration-medium select-none text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 border border-border/40 bg-surface/20 rounded-button space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      Email Address
                    </span>
                    <p className="text-foreground font-extrabold truncate">{user?.email}</p>
                  </div>

                  <div className="p-3 border border-border/40 bg-surface/20 rounded-button space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      Current Plan
                    </span>
                    <p className="text-foreground font-extrabold">CineVault Pro Tier</p>
                  </div>

                  <div className="p-3 border border-border/40 bg-surface/20 rounded-button space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      CineVault Version
                    </span>
                    <p className="text-foreground font-extrabold">v2.4.0-production</p>
                  </div>

                  <div className="p-3 border border-border/40 bg-surface/20 rounded-button space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      Server Connection
                    </span>
                    <p className="text-emerald-400 font-extrabold">Connected & Encrypted</p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-error/25 bg-error/5 rounded-card p-4 space-y-4 mt-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-error">Danger Zone</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                      Permanently delete your CineVault account. This deletes all of your imported
                      data, watch history, collections, settings, and profile. This action cannot be
                      undone.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <DeleteAccountModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </div>
  )
}
export default SettingsPage
