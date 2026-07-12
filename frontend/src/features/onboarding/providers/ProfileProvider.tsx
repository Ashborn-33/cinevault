import * as React from "react"
import { useAuth } from "@/features/auth"
import { ProfileService } from "../services/profile.service"
import type { Profile } from "../types/onboarding"

interface ProfileContextType {
  profile: Profile | null
  onboardingCompleted: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  completeOnboarding: (
    preferredContent: string[],
    favoriteGenres: string[],
    avatarUrl: string | null
  ) => Promise<void>
}

export const ProfileContext = React.createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const prevUserIdRef = React.useRef<string | undefined>(undefined)

  // Adjust state during render phase if user changes (React-recommended pattern)
  if (user?.id !== prevUserIdRef.current) {
    prevUserIdRef.current = user?.id
    setProfile(null)
    setLoading(!!user)
  }

  // Load profile asynchronously when user changes
  React.useEffect(() => {
    if (!user) return

    let active = true

    ProfileService.getProfile(user.id)
      .then(async (dbProfile) => {
        if (!active) return

        if (dbProfile) {
          setProfile(dbProfile)
          setLoading(false)
        } else {
          const defaultUsername =
            user.username || user.email.split("@")[0] || `user_${user.id.slice(0, 5)}`
          const created = await ProfileService.createProfile(user.id, defaultUsername)
          if (active) {
            setProfile(created)
            setLoading(false)
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load profile in effect", err)
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user])

  const refreshProfile = async () => {
    if (!user) return
    try {
      const dbProfile = await ProfileService.getProfile(user.id)
      setProfile(dbProfile)
    } catch (err) {
      console.error("Failed to refresh profile", err)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return
    try {
      const updated = await ProfileService.updateProfile(user.id, updates)
      setProfile(updated)
    } catch (err) {
      console.error("Failed to update profile", err)
      throw err
    }
  }

  const completeOnboarding = async (
    preferredContent: string[],
    favoriteGenres: string[],
    avatarUrl: string | null
  ) => {
    if (!user) return
    try {
      const updated = await ProfileService.completeOnboarding(
        user.id,
        preferredContent,
        favoriteGenres,
        avatarUrl
      )
      setProfile(updated)
    } catch (err) {
      console.error("Failed to complete onboarding", err)
      throw err
    }
  }

  const onboardingCompleted = profile?.onboarding_completed ?? false

  return (
    <ProfileContext.Provider
      value={{
        profile,
        onboardingCompleted,
        loading,
        refreshProfile,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
