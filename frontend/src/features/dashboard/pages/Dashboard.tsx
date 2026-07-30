import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  RefreshCw,
  Film,
  Tv,
  Clock,
  Flame,
  Trophy,
  Play,
  Sparkles,
  History,
  Calendar as CalendarIcon,
  Compass,
} from "lucide-react"

import { useAuth } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { useContinueWatching } from "../hooks/useDashboard"
import { DashboardHeader } from "../components/DashboardHeader"
import { ContinueWatchingSection } from "../components/ContinueWatchingSection"
import { useRawStatistics, useAchievements } from "@/features/statistics/hooks/useStatistics"
import { StatisticsService } from "@/features/statistics/services/statistics.service"
import { ReleaseService } from "@/features/releases/services/release.service"
import { RecommendationService } from "@/features/recommendations/services/recommendation.service"
import { useTimeline } from "@/features/activity/hooks/useActivity"
import { tmdbClient } from "@/features/discover"
import ReleaseCard from "@/features/releases/components/ReleaseCard"
import RecommendationCarousel from "@/features/recommendations/components/RecommendationCarousel"
import TimelineCard from "@/features/activity/components/TimelineCard"

export function Dashboard() {
  const { user } = useAuth()
  const userId = user?.id || ""
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = React.useState<"now-watching" | "upcoming" | "recommended">(
    "now-watching"
  )

  // 1. Fetch library items & raw statistics (reused React Query cache)
  const {
    libraryItems,
    watchHistory,
    episodeProgress,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useRawStatistics()

  // 2. Fetch Continue Watching items
  const {
    data: continueWatching = [],
    isLoading: isContinueLoading,
    refetch: refetchContinue,
  } = useContinueWatching()

  // 3. Fetch Release Timeline for upcoming episodes/movies (also used for next episode countdown)
  const {
    data: timeline,
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ["releases", "timeline", userId],
    queryFn: () => ReleaseService.getReleaseTimeline(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // 4. Lazy-fetch recommendations only when the For You tab is active
  const { data: trending = [] } = useQuery({
    queryKey: ["recommendations", "trending", userId],
    queryFn: () => RecommendationService.getTrendingForYou(userId),
    enabled: activeTab === "recommended" && !!userId,
    staleTime: 10 * 60 * 1000,
  })

  const { data: becauseYouWatched = [] } = useQuery({
    queryKey: ["recommendations", "because-watched", userId],
    queryFn: () => RecommendationService.getBecauseYouWatched(userId),
    enabled: activeTab === "recommended" && !!userId,
    staleTime: 10 * 60 * 1000,
  })

  const { data: hiddenGems = [] } = useQuery({
    queryKey: ["recommendations", "hidden-gems", userId],
    queryFn: () => RecommendationService.getHiddenGems(userId),
    enabled: activeTab === "recommended" && !!userId,
    staleTime: 10 * 60 * 1000,
  })

  const { data: continueSuggestions = [] } = useQuery({
    queryKey: ["recommendations", "continue-suggestions", userId],
    queryFn: () => RecommendationService.getContinueSuggestions(userId),
    enabled: activeTab === "recommended" && !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // 5. Fetch 5 latest actions from Activity Timeline
  const { data: activityTimelineData } = useTimeline(undefined, 5)
  const recentActivities = activityTimelineData?.pages?.[0]?.data || []

  // 6. Fetch achievements
  const { data: achievements = [] } = useAchievements()
  const unlockedAchievements = React.useMemo(() => {
    return achievements.filter((a) => a.unlocked).slice(0, 3)
  }, [achievements])

  const handleRetry = () => {
    refetchStats()
    refetchContinue()
    refetchTimeline()
  }

  // Calculate Quick Stats overview metrics on the fly using centralized service
  const quickStatsMetrics = React.useMemo(() => {
    if (!libraryItems || !watchHistory) return null
    const overview = StatisticsService.calculateOverview(
      libraryItems,
      watchHistory,
      episodeProgress
    )
    return {
      moviesCount: overview.movies,
      tvShowsCount: overview.tvShows,
      episodesCount: overview.episodes,
      watchHours: overview.watchHours,
      currentStreak: overview.currentStreak,
      longestStreak: overview.longestStreak,
    }
  }, [libraryItems, watchHistory, episodeProgress])

  // Locate the single next upcoming TV episode airing today or in the future
  const nextUpcomingEpisode = React.useMemo(() => {
    if (!timeline) return null
    const allEvents = [
      ...(timeline.today || []),
      ...(timeline.tomorrow || []),
      ...(timeline.thisWeek || []),
      ...(timeline.nextWeek || []),
      ...(timeline.later || []),
    ]
    const upcomingTV = allEvents
      .filter((e) => e.mediaType === "tv" && new Date(e.airDate) >= new Date())
      .sort((a, b) => new Date(a.airDate).getTime() - new Date(b.airDate).getTime())
    return upcomingTV[0] || null
  }, [timeline])

  // Identify first-time users (no items cataloged in library)
  const isFirstTimeUser = libraryItems.length === 0

  if (isStatsLoading || isContinueLoading || isTimelineLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex flex-col space-y-6">
        <div className="h-28 bg-skeleton rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-skeleton rounded animate-pulse" />
            <div className="h-10 w-80 bg-skeleton rounded animate-pulse" />
            <div className="h-60 bg-skeleton rounded animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-44 bg-skeleton rounded animate-pulse" />
            <div className="h-64 bg-skeleton rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isStatsError) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md font-sans">
          <AlertCircle className="h-12 w-12 text-error" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Couldn't load Home.</h2>
            <p className="text-xs text-muted-foreground">
              We encountered an issue retrieving your viewing hub logs. Please try again.
            </p>
          </div>
          <Button onClick={handleRetry} size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background">
      {/* 1. Header welcome banner */}
      <DashboardHeader />

      {/* 2. First-time User Experience welcome card */}
      {isFirstTimeUser ? (
        <div className="border border-primary/20 bg-surface/30 rounded-card p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 font-sans">
          <div className="space-y-2">
            <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Welcome to CineVault</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Start tracking your favourite Movies and TV Shows or import your existing TV Time GDPR
              export files to see personalized insights, statistics, collections, and recommendation
              scores.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/import-export")}
              className="w-full sm:w-auto font-bold flex items-center gap-2"
            >
              <Compass className="h-4 w-4" />
              Import TV Time
            </Button>
            <Button
              onClick={() => navigate("/discover")}
              variant="outline"
              className="w-full sm:w-auto font-bold"
            >
              Discover Titles
            </Button>
          </div>
        </div>
      ) : (
        /* 3. Main Dashboard grid columns layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main left column layout */}
          <div className="lg:col-span-2 space-y-10">
            {/* Static Continue Watching Section (Always visible) */}
            <ContinueWatchingSection items={continueWatching} />

            {/* Home Tab controls */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2 sm:gap-4 select-none">
                  {(["now-watching", "upcoming", "recommended"] as const).map((tab) => {
                    const label =
                      tab === "now-watching"
                        ? "Now Watching"
                        : tab === "upcoming"
                          ? "Upcoming"
                          : "For You"
                    const isActive = activeTab === tab
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-2.5 text-xs font-black tracking-wider uppercase cursor-pointer outline-none transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                        {isActive && (
                          <motion.span
                            layoutId="activeHomeTabBorder"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab views using Framer Motion wrapper */}
              <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* TAB A: Now Watching */}
                    {activeTab === "now-watching" && (
                      <div className="space-y-8 font-sans">
                        {/* Currently Watching items */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                              Currently Watching
                            </h3>
                            <Link
                              to="/library"
                              className="text-[10px] text-primary font-bold hover:underline"
                            >
                              View All Library &rarr;
                            </Link>
                          </div>
                          {libraryItems.filter((i) => i.status === "watching").length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {libraryItems
                                .filter((i) => i.status === "watching")
                                .slice(0, 4)
                                .map((item) => {
                                  const posterUrl = item.poster_path
                                    ? tmdbClient.getImageUrl(item.poster_path)
                                    : null
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() =>
                                        navigate(`/${item.media_type}/${item.media_id}`)
                                      }
                                      className="flex flex-col border border-border/55 bg-surface/30 rounded-card overflow-hidden hover:border-primary/50 cursor-pointer group shadow-sm transition-all"
                                    >
                                      <div className="aspect-[2/3] bg-zinc-900 overflow-hidden relative">
                                        {posterUrl ? (
                                          <img
                                            src={posterUrl}
                                            alt={item.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground p-3 text-center">
                                            {item.title}
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-2 space-y-0.5">
                                        <h4 className="text-[10px] font-bold truncate group-hover:text-primary transition-colors">
                                          {item.title}
                                        </h4>
                                        <p className="text-[8px] text-muted-foreground uppercase font-semibold">
                                          {item.media_type === "movie" ? "Movie" : "TV Show"}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground font-semibold italic bg-zinc-950/20 p-4 border border-border/40 rounded-button">
                              No active watching titles. Start cataloging from Discover!
                            </p>
                          )}
                        </div>

                        {/* Recently Added items */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Recently Added
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {libraryItems
                              .sort(
                                (a, b) =>
                                  new Date(b.created_at || "").getTime() -
                                  new Date(a.created_at || "").getTime()
                              )
                              .slice(0, 4)
                              .map((item) => {
                                const posterUrl = item.poster_path
                                  ? tmdbClient.getImageUrl(item.poster_path)
                                  : null
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => navigate(`/${item.media_type}/${item.media_id}`)}
                                    className="flex flex-col border border-border/55 bg-surface/30 rounded-card overflow-hidden hover:border-primary/50 cursor-pointer group shadow-sm transition-all"
                                  >
                                    <div className="aspect-[2/3] bg-zinc-900 overflow-hidden relative">
                                      {posterUrl ? (
                                        <img
                                          src={posterUrl}
                                          alt={item.title}
                                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground p-3 text-center">
                                          {item.title}
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-2 space-y-0.5">
                                      <h4 className="text-[10px] font-bold truncate group-hover:text-primary transition-colors">
                                        {item.title}
                                      </h4>
                                      <p className="text-[8px] text-muted-foreground uppercase font-semibold">
                                        {item.media_type === "movie" ? "Movie" : "TV Show"}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>

                        {/* Recently Finished items */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Recently Finished
                          </h3>
                          {libraryItems.filter((i) => i.status === "completed").length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {libraryItems
                                .filter((i) => i.status === "completed")
                                .slice(0, 4)
                                .map((item) => {
                                  const posterUrl = item.poster_path
                                    ? tmdbClient.getImageUrl(item.poster_path)
                                    : null
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() =>
                                        navigate(`/${item.media_type}/${item.media_id}`)
                                      }
                                      className="flex flex-col border border-border/55 bg-surface/30 rounded-card overflow-hidden hover:border-primary/50 cursor-pointer group shadow-sm transition-all"
                                    >
                                      <div className="aspect-[2/3] bg-zinc-900 overflow-hidden relative">
                                        {posterUrl ? (
                                          <img
                                            src={posterUrl}
                                            alt={item.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground p-3 text-center">
                                            {item.title}
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-2 space-y-0.5">
                                        <h4 className="text-[10px] font-bold truncate group-hover:text-primary transition-colors">
                                          {item.title}
                                        </h4>
                                        <p className="text-[8px] text-muted-foreground uppercase font-semibold">
                                          {item.media_type === "movie" ? "Movie" : "TV Show"}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground font-semibold italic bg-zinc-950/20 p-4 border border-border/40 rounded-button">
                              No completed titles yet. Mark finished to see records here!
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB B: Upcoming Releases calendar */}
                    {activeTab === "upcoming" && (
                      <div className="space-y-6 font-sans">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Upcoming Releases
                          </h3>
                          <Link
                            to="/releases"
                            className="text-[10px] text-primary font-bold hover:underline"
                          >
                            View Full Calendar &rarr;
                          </Link>
                        </div>
                        {timeline &&
                        (timeline.today.length > 0 ||
                          timeline.tomorrow.length > 0 ||
                          timeline.thisWeek.length > 0) ? (
                          <div className="space-y-6">
                            {/* Today Group */}
                            {timeline.today.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-primary uppercase tracking-wider pl-1">
                                  Today
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {timeline.today.map((event) => (
                                    <ReleaseCard key={event.id} event={event} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tomorrow Group */}
                            {timeline.tomorrow.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-accent uppercase tracking-wider pl-1">
                                  Tomorrow
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {timeline.tomorrow.map((event) => (
                                    <ReleaseCard key={event.id} event={event} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* This Week Group */}
                            {timeline.thisWeek.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider pl-1">
                                  This Week
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {timeline.thisWeek.map((event) => (
                                    <ReleaseCard key={event.id} event={event} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground font-semibold italic bg-zinc-950/20 p-6 border border-border/40 rounded-button text-center">
                            No upcoming releases on your calendar. Add ongoing TV shows to trigger
                            dates!
                          </p>
                        )}
                      </div>
                    )}

                    {/* TAB C: Recommended lists */}
                    {activeTab === "recommended" && (
                      <div className="space-y-8 font-sans">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            For You
                          </h3>
                          <Link
                            to="/recommendations"
                            className="text-[10px] text-primary font-bold hover:underline"
                          >
                            View All Intelligence &rarr;
                          </Link>
                        </div>
                        <div className="space-y-6">
                          {continueSuggestions.length > 0 && (
                            <RecommendationCarousel
                              title="Resume watching or Similar Shows"
                              subtitle="TV shows from your watching list or items closely related to TV titles you completed."
                              items={continueSuggestions}
                            />
                          )}

                          {becauseYouWatched.length > 0 && (
                            <RecommendationCarousel
                              title="Because You Watched"
                              subtitle="Suggestions matching theme elements of your recently completed library movies and shows."
                              items={becauseYouWatched}
                            />
                          )}

                          {trending.length > 0 && (
                            <RecommendationCarousel
                              title="Trending Matches For You"
                              subtitle="High rating movies and TV series trending in CineVault matching your metadata preferences."
                              items={trending}
                            />
                          )}

                          {hiddenGems.length > 0 && (
                            <RecommendationCarousel
                              title="Hidden Gems & Discoveries"
                              subtitle="Highly-rated titles with lower global vote tallies you might have overlooked."
                              items={hiddenGems}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Desktop Right Sidebar columns */}
          <div className="space-y-8 lg:col-span-1">
            {/* Quick Stats Widget */}
            {quickStatsMetrics && (
              <div className="border border-border bg-surface/50 backdrop-blur-sm rounded-card p-5 space-y-4 font-sans shadow-sm">
                <div className="flex justify-between items-center border-b border-border pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary" />
                    Quick Stats
                  </h3>
                  <Link
                    to="/statistics"
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    View All &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-border/40 bg-zinc-950/20 rounded-button space-y-1">
                    <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                      <Film className="h-3 w-3 text-primary" /> Movies
                    </span>
                    <p className="text-lg font-black text-foreground">
                      {quickStatsMetrics.moviesCount}
                    </p>
                  </div>
                  <div className="p-3 border border-border/40 bg-zinc-950/20 rounded-button space-y-1">
                    <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                      <Tv className="h-3 w-3 text-accent" /> TV Shows
                    </span>
                    <p className="text-lg font-black text-foreground">
                      {quickStatsMetrics.tvShowsCount}
                    </p>
                  </div>
                  <div className="p-3 border border-border/40 bg-zinc-950/20 rounded-button space-y-1">
                    <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                      <Play className="h-3 w-3 text-primary" /> Episodes
                    </span>
                    <p className="text-lg font-black text-foreground">
                      {quickStatsMetrics.episodesCount}
                    </p>
                  </div>
                  <div className="p-3 border border-border/40 bg-zinc-950/20 rounded-button space-y-1">
                    <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" /> Hours
                    </span>
                    <p className="text-lg font-black text-foreground">
                      {quickStatsMetrics.watchHours}h
                    </p>
                  </div>
                  <div className="p-3 border border-border/40 bg-zinc-950/20 rounded-button space-y-1 col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500 fill-current" /> Watch Streak
                      </span>
                      <p className="text-sm font-black text-foreground mt-0.5">
                        {quickStatsMetrics.currentStreak} Days
                      </p>
                    </div>
                    <div className="text-right border-l border-border/40 pl-4">
                      <span className="text-[9px] text-muted-foreground font-black uppercase">
                        Longest
                      </span>
                      <p className="text-xs font-extrabold text-muted-foreground mt-0.5">
                        {quickStatsMetrics.longestStreak} Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Upcoming Episode countdown widget */}
            {nextUpcomingEpisode && (
              <div className="border border-border bg-surface/50 backdrop-blur-sm rounded-card p-5 space-y-3 font-sans shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                  <CalendarIcon className="h-4 w-4 text-accent" />
                  Next Upcoming Episode
                </h3>
                <div
                  onClick={() => navigate(`/tv/${nextUpcomingEpisode.mediaId}`)}
                  className="flex gap-3 cursor-pointer group"
                >
                  <div className="h-16 w-11 shrink-0 rounded overflow-hidden bg-zinc-900 border border-border/40 aspect-[2/3]">
                    {nextUpcomingEpisode.posterPath ? (
                      <img
                        src={tmdbClient.getImageUrl(nextUpcomingEpisode.posterPath)}
                        alt={nextUpcomingEpisode.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Tv className="h-6 w-6 text-muted-foreground/35" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black truncate group-hover:text-primary transition-colors">
                        {nextUpcomingEpisode.title}
                      </h4>
                      {nextUpcomingEpisode.details && (
                        <p className="text-[10px] text-primary font-bold">
                          S{String(nextUpcomingEpisode.details.seasonNumber).padStart(2, "0")}E
                          {String(nextUpcomingEpisode.details.episodeNumber).padStart(2, "0")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground mt-1">
                      <span>
                        {new Date(nextUpcomingEpisode.airDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-amber-500 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {new Date(nextUpcomingEpisode.airDate).toISOString().split("T")[0] ===
                        new Date().toISOString().split("T")[0]
                          ? "Today"
                          : "Upcoming"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity Timeline Widget */}
            {recentActivities.length > 0 && (
              <div className="border border-border bg-surface/50 backdrop-blur-sm rounded-card p-5 space-y-4 font-sans shadow-sm">
                <div className="flex justify-between items-center border-b border-border pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" />
                    Recent Activity
                  </h3>
                  <Link
                    to="/activity"
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    View Timeline &rarr;
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((item) => (
                    <TimelineCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Badges Preview Widget */}
            {unlockedAchievements.length > 0 && (
              <div className="border border-border bg-surface/50 backdrop-blur-sm rounded-card p-5 space-y-4 font-sans shadow-sm">
                <div className="flex justify-between items-center border-b border-border pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary" />
                    Achievements
                  </h3>
                  <Link
                    to="/statistics"
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    View All &rarr;
                  </Link>
                </div>
                <div className="flex flex-col gap-2.5">
                  {unlockedAchievements.map((badge) => {
                    return (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-2.5 border border-border/40 bg-zinc-950/20 rounded-button"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-lg">
                          {badge.icon || <Trophy className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black text-foreground truncate">
                            {badge.title}
                          </h4>
                          <p className="text-[9px] text-muted-foreground truncate leading-relaxed">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default Dashboard
