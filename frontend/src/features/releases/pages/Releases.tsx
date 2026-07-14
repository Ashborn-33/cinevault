import * as React from "react"
import { useState, useMemo } from "react"
import { Calendar, CalendarX } from "lucide-react"
import { useCalendar } from "../hooks/useReleases"
import { useLibrary } from "@/features/library"
import { ReleaseFilters } from "../components/ReleaseFilters"
import { ReleaseCard } from "../components/ReleaseCard"
import { ReleaseSkeleton } from "../components/ReleaseSkeleton"
import { EmptyReleases } from "../components/EmptyReleases"
import type { ReleaseFilters as FiltersType, ReleaseEvent } from "../types/releases"
import { format, differenceInCalendarDays, parseISO, isToday, isTomorrow } from "date-fns"
import { Button } from "@/components/ui/button"

// Lazy load CalendarView to satisfy code splitting performance targets
const CalendarView = React.lazy(() => import("../components/CalendarView"))

export function Releases() {
  const { data: events = [], isLoading, isError, error, refetch } = useCalendar()
  const { data: libraryItems = [] } = useLibrary()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filters, setFilters] = useState<FiltersType>({
    type: "all",
    scope: "all",
    time: "all",
    search: "",
  })

  const handleFilterChange = (updates: Partial<FiltersType>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  // Map library items keys for O(1) membership lookups
  const libraryKeys = useMemo(() => {
    return new Set(libraryItems.map((item) => `${item.media_type}-${item.media_id}`))
  }, [libraryItems])

  // Filter releases list
  const filteredEvents = useMemo(() => {
    let result = events

    // 1. Calendar date selection
    if (selectedDate) {
      result = result.filter((e) => e.airDate === selectedDate)
    }

    // 2. Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(q))
    }

    // 3. Media Type
    if (filters.type !== "all") {
      result = result.filter((e) => e.mediaType === filters.type)
    }

    // 4. Scope
    if (filters.scope === "library") {
      result = result.filter((e) => libraryKeys.has(`${e.mediaType}-${e.mediaId}`))
    }

    // 5. Time window
    if (filters.time !== "all") {
      const todayStr = format(new Date(), "yyyy-MM-dd")
      if (filters.time === "today") {
        result = result.filter((e) => e.airDate === todayStr)
      } else if (filters.time === "upcoming") {
        result = result.filter((e) => e.airDate > todayStr)
      }
    }

    return result
  }, [events, selectedDate, filters, libraryKeys])

  // Group events chronologically
  const timelineGroups = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const groups = {
      today: [] as ReleaseEvent[],
      tomorrow: [] as ReleaseEvent[],
      thisWeek: [] as ReleaseEvent[],
      nextWeek: [] as ReleaseEvent[],
      later: [] as ReleaseEvent[],
    }

    filteredEvents.forEach((e) => {
      const date = parseISO(e.airDate)
      const diff = differenceInCalendarDays(date, today)

      if (diff === 0 || isToday(date)) {
        groups.today.push(e)
      } else if (diff === 1 || isTomorrow(date)) {
        groups.tomorrow.push(e)
      } else if (diff >= 2 && diff <= 7) {
        groups.thisWeek.push(e)
      } else if (diff >= 8 && diff <= 14) {
        groups.nextWeek.push(e)
      } else if (diff >= 15 && diff <= 35) {
        groups.later.push(e)
      }
    })

    return groups
  }, [filteredEvents])

  const hasTimelineItems = useMemo(() => {
    return (
      timelineGroups.today.length > 0 ||
      timelineGroups.tomorrow.length > 0 ||
      timelineGroups.thisWeek.length > 0 ||
      timelineGroups.nextWeek.length > 0 ||
      timelineGroups.later.length > 0
    )
  }, [timelineGroups])

  const handleRetry = () => {
    refetch()
  }

  if (isLoading) {
    return <ReleaseSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md font-sans">
          <CalendarX className="h-12 w-12 text-error" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Failed to load calendar events</h2>
            <p className="text-xs text-muted-foreground">
              {error?.message || "We encountered an issue retrieving TMDB release schedules."}
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background font-sans">
      {/* Page Header */}
      <div className="space-y-1 border-b border-border/60 pb-5">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 select-none">
          <Calendar className="h-8 w-8 text-primary" />
          Release Center
        </h1>
        <p className="text-xs text-muted-foreground">
          Track upcoming movie releases and TV show episode air dates in a centralized schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Sidebar Filters & Calendar */}
        <div className="space-y-6">
          <ReleaseFilters filters={filters} onChange={handleFilterChange} />

          {/* Lazy loaded Calendar View */}
          <React.Suspense
            fallback={
              <div className="h-72 w-full bg-skeleton/40 border border-border/40 rounded-card animate-pulse" />
            }
          >
            <CalendarView
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </React.Suspense>
        </div>

        {/* Right 3 Columns: Chronological Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calendar selection active header */}
          {selectedDate && (
            <div className="flex items-center justify-between p-3 border border-primary/20 bg-primary/5 rounded-card text-xs">
              <span className="font-bold">
                Showing releases for:{" "}
                <span className="text-primary font-black">
                  {format(parseISO(selectedDate), "MMMM d, yyyy")}
                </span>
              </span>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-[10px] uppercase font-black tracking-wider text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 focus:outline-none"
              >
                Clear date filter
              </button>
            </div>
          )}

          {!hasTimelineItems ? (
            <EmptyReleases />
          ) : (
            <div className="space-y-8">
              {/* Today */}
              {timelineGroups.today.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-1">
                    Released Today
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                    {timelineGroups.today.map((item) => (
                      <ReleaseCard key={item.id} event={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tomorrow */}
              {timelineGroups.tomorrow.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-accent border-b border-border pb-1">
                    Tomorrow
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                    {timelineGroups.tomorrow.map((item) => (
                      <ReleaseCard key={item.id} event={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* This Week */}
              {timelineGroups.thisWeek.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-border pb-1">
                    This Week
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                    {timelineGroups.thisWeek.map((item) => (
                      <ReleaseCard key={item.id} event={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Next Week */}
              {timelineGroups.nextWeek.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                    Next Week
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                    {timelineGroups.nextWeek.map((item) => (
                      <ReleaseCard key={item.id} event={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Later */}
              {timelineGroups.later.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                    Later This Month
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-medium">
                    {timelineGroups.later.map((item) => (
                      <ReleaseCard key={item.id} event={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Releases
