import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContinueWatching, useUpcomingEpisodes } from "../hooks/useDashboard"
import { DashboardHeader } from "../components/DashboardHeader"
import { ContinueWatchingSection } from "../components/ContinueWatchingSection"
import { UpcomingEpisodesSection } from "../components/UpcomingEpisodesSection"
import { DashboardSkeleton } from "../components/DashboardSkeleton"

export function Dashboard() {
  const {
    data: continueWatching = [],
    isLoading: isContinueLoading,
    isError: isContinueError,
    refetch: refetchContinue,
  } = useContinueWatching()

  const {
    data: upcomingGrouped,
    isLoading: isUpcomingLoading,
    isError: isUpcomingError,
    refetch: refetchUpcoming,
  } = useUpcomingEpisodes()

  const handleRetry = () => {
    refetchContinue()
    refetchUpcoming()
  }

  if (isContinueLoading || isUpcomingLoading) {
    return <DashboardSkeleton />
  }

  if (isContinueError || isUpcomingError || !upcomingGrouped) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md font-sans">
          <AlertCircle className="h-12 w-12 text-error" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Couldn't load dashboard.</h2>
            <p className="text-xs text-muted-foreground">
              We encountered an issue retrieving your watch tracking records. Please try again.
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
      {/* Welcome Header */}
      <DashboardHeader inProgressCount={continueWatching.length} />

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Continue Watching */}
        <div className="lg:col-span-2">
          <ContinueWatchingSection items={continueWatching} />
        </div>

        {/* Right Column: Upcoming Releases */}
        <div>
          <UpcomingEpisodesSection grouped={upcomingGrouped} />
        </div>
      </div>
    </div>
  )
}
export default Dashboard
