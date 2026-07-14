import * as React from "react"
import { AlertCircle, BarChart3, Clock, Film, Tv, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

// Hooks & Services
import {
  useOverview,
  useGenreStats,
  useActivity,
  useInsights,
  useAchievements,
  useWatchStreak,
  useRecentlyCompleted,
  useRawStatistics,
} from "../hooks/useStatistics"

// Components (Static load)
import { StatCard } from "../components/StatCard"
import { ViewingInsightsSection } from "../components/ViewingInsightsSection"
import { RecentlyCompletedSection } from "../components/RecentlyCompletedSection"
import { StatisticsSkeleton } from "../components/StatisticsSkeleton"
import { EmptyStatistics } from "../components/EmptyStatistics"

// Heavy Components (Lazy load to split Recharts bundle)
const GenrePieChart = React.lazy(() => import("../components/GenrePieChart"))
const ActivityBarChart = React.lazy(() => import("../components/ActivityBarChart"))
const ActivityAreaChart = React.lazy(() => import("../components/ActivityAreaChart"))
const StreakCalendarHeatmap = React.lazy(() => import("../components/StreakCalendarHeatmap"))
const AchievementsSection = React.lazy(() => import("../components/AchievementsSection"))

export function Statistics() {
  const { watchHistory, isLoading, isError, error, refetch } = useRawStatistics()

  // Dynamic Query metrics
  const overview = useOverview()
  const genreStats = useGenreStats()
  const activity = useActivity()
  const insights = useInsights()
  const achievements = useAchievements()
  const streak = useWatchStreak()
  const recentlyCompleted = useRecentlyCompleted()

  const handleRetry = () => {
    refetch()
  }

  if (isLoading) {
    return <StatisticsSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md font-sans">
          <AlertCircle className="h-12 w-12 text-error" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Failed to load statistics</h2>
            <p className="text-xs text-muted-foreground">
              {error?.message || "We encountered an issue retrieving your watch habits history."}
            </p>
          </div>
          <Button onClick={handleRetry} size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (watchHistory.length === 0) {
    return <EmptyStatistics />
  }

  const formatWatchTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`
    const hours = Math.round((minutes / 60) * 10) / 10
    if (hours > 48) {
      const days = Math.round((hours / 24) * 10) / 10
      return `${days} days`
    }
    return `${hours} hrs`
  }

  const renderChartFallback = (heightClass = "h-64") => (
    <div
      className={`w-full ${heightClass} bg-skeleton/40 border border-border/40 rounded-card animate-pulse`}
    />
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background">
      {/* Page Header */}
      <div className="space-y-1 border-b border-border/60 pb-5">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Personal Statistics
        </h1>
        <p className="text-xs text-muted-foreground">
          Analyze and explore your viewing habits, calendar streaks, and milestones unlocked.
        </p>
      </div>

      {/* SECTION 1: Overview Cards */}
      {overview.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Watch Time"
            value={formatWatchTime(overview.data.totalWatchTime)}
            icon={Clock}
            subtitle="Across movies & TV shows"
            accentColor="text-primary"
          />
          <StatCard
            label="Movies Completed"
            value={overview.data.moviesCompleted}
            icon={Film}
            subtitle="Successfully finished"
            accentColor="text-accent"
          />
          <StatCard
            label="Episodes Completed"
            value={overview.data.episodesCompleted}
            icon={Tv}
            subtitle="Individual TV episodes"
            accentColor="text-emerald-400"
          />
          <StatCard
            label="Completion Rate"
            value={`${overview.data.completionRate}%`}
            icon={Trophy}
            subtitle="Library progress status"
            progressPercentage={overview.data.completionRate}
            accentColor="text-amber-400"
          />
        </div>
      )}

      {/* SECTION 2-5: Main Dashboard Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Charts and Timeline Activities */}
        <div className="lg:col-span-2 space-y-8">
          {activity.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <React.Suspense fallback={renderChartFallback()}>
                <ActivityBarChart
                  data={activity.data.weeklyActivity}
                  title="Weekly Activity (Watch Hours)"
                />
              </React.Suspense>
              <React.Suspense fallback={renderChartFallback()}>
                <ActivityAreaChart
                  data={activity.data.monthlyActivity}
                  title="Monthly Trend (Watch Hours)"
                />
              </React.Suspense>
            </div>
          )}

          {/* Viewing insights dynamic cards */}
          <ViewingInsightsSection insights={insights.data} />

          {/* Milestone Achievements */}
          <React.Suspense fallback={renderChartFallback("h-72")}>
            <AchievementsSection achievements={achievements.data} />
          </React.Suspense>
        </div>

        {/* Right 1 Column: Ratios, Heatmaps, and Recents */}
        <div className="space-y-8">
          {/* Genre pie ratio */}
          <React.Suspense fallback={renderChartFallback("h-80")}>
            <GenrePieChart data={genreStats.data} />
          </React.Suspense>

          {/* Calendar Heatmap and streaks */}
          {streak.data && (
            <React.Suspense fallback={renderChartFallback("h-48")}>
              <StreakCalendarHeatmap
                heatmapData={streak.data.heatmapData}
                currentStreak={streak.data.currentStreak}
                longestStreak={streak.data.longestStreak}
              />
            </React.Suspense>
          )}

          {/* Recently Completed posters */}
          <RecentlyCompletedSection items={recentlyCompleted.data} />
        </div>
      </div>
    </div>
  )
}
export default Statistics
