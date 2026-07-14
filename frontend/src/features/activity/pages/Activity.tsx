import { useState, useMemo } from "react"
import { History, CalendarX } from "lucide-react"
import { useTimeline } from "../hooks/useActivity"
import { ActivityService } from "../services/activity.service"
import { TimelineFilters } from "../components/TimelineFilters"
import { TimelineCard } from "../components/TimelineCard"
import { TimelineSkeleton } from "../components/TimelineSkeleton"
import { EmptyTimeline } from "../components/EmptyTimeline"
import type { ActivityFilters as FiltersType } from "../types/activity"
import { Button } from "@/components/ui/button"

export function Activity() {
  const [filters, setFilters] = useState<FiltersType>({
    category: "all",
    search: "",
    sort: "newest",
  })

  // Hook handles infinite scrolling query parameter mappings
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTimeline(filters, 20)

  const handleFilterChange = (updates: Partial<FiltersType>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  // Merge all loaded pages of activities
  const allActivities = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || []
  }, [data])

  // Group activities chronologically
  const groupedSections = useMemo(() => {
    return ActivityService.groupTimelineByDate(allActivities)
  }, [allActivities])

  const hasItems = useMemo(() => allActivities.length > 0, [allActivities])

  const handleRetry = () => {
    refetch()
  }

  if (isLoading) {
    return <TimelineSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md font-sans">
          <CalendarX className="h-12 w-12 text-error" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Failed to load activity timeline</h2>
            <p className="text-xs text-muted-foreground">
              {error?.message || "We encountered an issue retrieving your CineVault activity logs."}
            </p>
          </div>
          <Button onClick={handleRetry} size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background font-sans">
      {/* Page Header */}
      <div className="space-y-1 border-b border-border/60 pb-5">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 select-none">
          <History className="h-8 w-8 text-primary" />
          Activity Timeline
        </h1>
        <p className="text-xs text-muted-foreground">
          Browse a chronological feed of your watches, milestones, and library updates.
        </p>
      </div>

      {/* Filter and Search Section */}
      <TimelineFilters filters={filters} onChange={handleFilterChange} />

      {/* Timeline Sections List */}
      {!hasItems ? (
        <EmptyTimeline />
      ) : (
        <div className="space-y-8">
          {/* Today */}
          {groupedSections.today.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-1">
                Today
              </h3>
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                {groupedSections.today.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedSections.yesterday.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-accent border-b border-border pb-1">
                Yesterday
              </h3>
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                {groupedSections.yesterday.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier This Week */}
          {groupedSections.thisWeek.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-border pb-1">
                Earlier This Week
              </h3>
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                {groupedSections.thisWeek.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier This Month */}
          {groupedSections.thisMonth.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                Earlier This Month
              </h3>
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                {groupedSections.thisMonth.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {groupedSections.older.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                Older Activity
              </h3>
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                {groupedSections.older.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Infinite Pagination Controls */}
          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="w-full max-w-xs text-xs font-extrabold uppercase tracking-wider"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More Activity"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default Activity
