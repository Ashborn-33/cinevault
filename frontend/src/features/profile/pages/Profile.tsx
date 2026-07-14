import * as React from "react"
import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { supabase } from "@/lib/supabase"
import { StatisticsService } from "@/features/statistics/services/statistics.service"
import { useProfile, useUpdateProfile } from "../hooks/useProfile"
import type { UserProfile } from "../types/profile"
import { EditProfileModal } from "../components/EditProfileModal"
import { XPProgressBar } from "../components/XPProgressBar"
import { FavoriteGenres } from "../components/FavoriteGenres"
import { FavoriteActors } from "../components/FavoriteActors"
import { FavoriteDirectors } from "../components/FavoriteDirectors"
import { ProfileSkeleton } from "../components/ProfileSkeleton"
import { EmptyProfile } from "../components/EmptyProfile"
import { format, parseISO } from "date-fns"
import { Edit, Film, Tv, Trophy, Layers, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

// Lazy load widgets to satisfy route-based performance optimization targets
const PinnedCollections = React.lazy(() => import("../components/PinnedCollections"))
const RecentActivityPreview = React.lazy(() => import("../components/RecentActivityPreview"))
const AchievementShowcase = React.lazy(() => import("../components/AchievementShowcase"))

export function Profile() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const { profile, isLoading: isProfileLoading, viewerLevel, refetch } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const [isEditOpen, setIsEditOpen] = useState(false)

  // Query Overview Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["profile", "stats-overview", userId],
    queryFn: async () => {
      const [lib, ep, collectionsRes, watch] = await Promise.all([
        StatisticsService.getLibraryItems(userId),
        StatisticsService.getEpisodeProgress(userId),
        supabase.from("collections").select("id").eq("user_id", userId),
        StatisticsService.getWatchHistory(userId),
      ])

      const collectionsCount = collectionsRes.data?.length || 0

      // Completed movies
      const moviesCompleted = lib.filter(
        (i) => i.media_type === "movie" && i.status === "completed"
      ).length

      // Completed episodes
      const episodesCompleted = ep.length

      // TV shows with at least one completed episode
      const tvShowsCompleted = new Set(ep.map((item) => item.media_id)).size

      // Hours watched
      const movieWatchTime = lib
        .filter((i) => i.media_type === "movie" && i.status === "completed")
        .reduce((sum, item) => sum + (item.runtime_minutes || 0), 0)

      const tvWatchTime = ep.reduce((sum, item) => sum + (item.runtime_minutes || 0), 0)

      const hoursWatched = Math.round((movieWatchTime + tvWatchTime) / 60)

      const achievements = StatisticsService.calculateAchievements(lib, watch, ep)
      const achievementsCount = achievements.filter((a) => a.unlocked).length

      return {
        moviesCompleted,
        tvShowsCompleted,
        episodesCompleted,
        hoursWatched,
        collectionsCount,
        achievementsCount,
      }
    },
    enabled: !!userId,
  })

  // Format Join Date
  const profileCreatedAt = profile?.created_at
  const joinDate = useMemo(() => {
    if (!profileCreatedAt) return ""
    return format(parseISO(profileCreatedAt), "MMMM yyyy")
  }, [profileCreatedAt])

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    await updateProfileMutation.mutateAsync(updates)
    setIsEditOpen(false)
    refetch()
  }

  if (isProfileLoading || isStatsLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return <EmptyProfile />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 text-foreground bg-background font-sans">
      {/* 1. Header Banner Profile Block */}
      <div className="relative rounded-card overflow-hidden border border-border/60 bg-surface/35 shadow-sm">
        {/* Banner image or fallback gradient */}
        <div
          className="h-44 md:h-60 w-full relative bg-cover bg-center select-none"
          style={{
            backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : "none",
            backgroundColor: !profile.banner_url ? profile.favorite_color : "transparent",
            opacity: 0.85,
          }}
        >
          {!profile.banner_url && (
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          )}
        </div>

        {/* Profile Card and Badges */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start md:pl-8 pb-6 -mt-16 md:-mt-20 relative z-10">
          {/* Avatar Profile image */}
          <div className="h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-background overflow-hidden bg-zinc-900 shrink-0 shadow-lg flex items-center justify-center select-none">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-extrabold text-muted-foreground/60 uppercase">
                {profile.username.slice(0, 2)}
              </span>
            )}
          </div>

          {/* User Meta info details */}
          <div className="space-y-3 mt-2 md:mt-24 text-center md:text-left flex-grow">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{profile.username}</h2>
              {profile.bio && (
                <p className="text-xs text-muted-foreground max-w-md font-semibold leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start text-[10px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                Joined {joinDate}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-amber-400 shrink-0" />
                Lvl {viewerLevel.level} • {viewerLevel.title}
              </span>
            </div>
          </div>

          {/* Edit Actions Deck */}
          <div className="mt-4 md:mt-24 md:pr-8">
            <Button
              onClick={() => setIsEditOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Dynamic XP Progress panel wrapper */}
        <div className="border-t border-border/40 p-4 md:px-8 bg-zinc-950/20">
          <div className="max-w-md">
            <XPProgressBar viewerLevel={viewerLevel} />
          </div>
        </div>
      </div>

      {/* 2. Overview Stats Deck */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
          <div className="border border-border/50 bg-surface/30 rounded-card p-4 flex gap-3 items-center shadow-sm">
            <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">{stats.moviesCompleted}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                Movies Completed
              </p>
            </div>
          </div>

          <div className="border border-border/50 bg-surface/30 rounded-card p-4 flex gap-3 items-center shadow-sm">
            <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">{stats.episodesCompleted}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                Episodes Watched
              </p>
            </div>
          </div>

          <div className="border border-border/50 bg-surface/30 rounded-card p-4 flex gap-3 items-center shadow-sm">
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">{stats.hoursWatched}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                Hours Watched
              </p>
            </div>
          </div>

          <div className="border border-border/50 bg-surface/30 rounded-card p-4 flex gap-3 items-center shadow-sm">
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">{stats.collectionsCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                Collections Created
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Columns Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Favorites, Achievements, Pinned Collections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Favorite statistics grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FavoriteGenres />
            <FavoriteActors />
            <FavoriteDirectors />
          </div>

          {/* Lazy Loaded Pinned Collections */}
          <React.Suspense fallback={<div className="h-28 bg-skeleton/40 rounded animate-pulse" />}>
            <PinnedCollections />
          </React.Suspense>

          {/* Lazy Loaded Achievements */}
          <React.Suspense fallback={<div className="h-28 bg-skeleton/40 rounded animate-pulse" />}>
            <AchievementShowcase />
          </React.Suspense>
        </div>

        {/* Right Column: Recent Activity Timeline */}
        <div className="space-y-6">
          <React.Suspense
            fallback={
              <div className="h-72 w-full bg-skeleton/40 border border-border/40 rounded-card animate-pulse" />
            }
          >
            <RecentActivityPreview />
          </React.Suspense>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
        isPending={updateProfileMutation.isPending}
      />
    </div>
  )
}
export default Profile
