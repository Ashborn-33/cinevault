import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { History, Film, ArrowRight, ChevronLeft, ChevronRight, Tv } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading"
import { tmdbClient } from "@/features/discover"
import { useWatchHistory } from "../hooks/useTracking"

export function WatchHistory() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, refetch } = useWatchHistory(page, limit)

  const entries = data?.data || []
  const count = data?.count || 0
  const totalPages = Math.ceil(count / limit)

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1)
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "started":
        return {
          text: "Started Watching",
          variant: "secondary" as const,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        }
      case "continued":
        return {
          text: "Updated Progress",
          variant: "secondary" as const,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        }
      case "completed":
        return {
          text: "Completed",
          variant: "secondary" as const,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        }
      case "rewatched":
        return {
          text: "Started Rewatch",
          variant: "secondary" as const,
          color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
        }
      default:
        return {
          text: action,
          variant: "outline" as const,
          color: "text-muted-foreground border-border",
        }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-muted-foreground">Loading watch timeline...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md">
          <p className="text-sm font-bold text-error">Couldn't load watch history.</p>
          <Button onClick={() => refetch()} size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Watch History
          </h1>
          <p className="text-xs text-muted-foreground">
            A comprehensive record of your watch activities, status modifications, and progress
            events.
          </p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto font-sans font-semibold">
          {count} Activity Log{count === 1 ? "" : "s"}
        </Badge>
      </div>

      {/* Main Content Area */}
      {entries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-20 border border-border border-dashed rounded-card text-center space-y-4 animate-in fade-in">
          <History className="h-14 w-14 text-muted-foreground opacity-35" />
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-extrabold tracking-tight">No activity yet</h2>
            <p className="text-xs text-muted-foreground max-w-sm">
              Your activity timeline is currently empty. Start tracking movies in your library to
              build your history log.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/discover")}>
            Browse Movies
          </Button>
        </div>
      ) : (
        /* Timeline List layout */
        <div className="space-y-8 animate-in fade-in duration-medium">
          <div className="relative border-l border-border/80 pl-6 space-y-8 font-sans">
            {entries.map((entry) => {
              const actionDetails = getActionLabel(entry.action)
              const posterUrl = entry.poster_path
                ? tmdbClient.getImageUrl(entry.poster_path)
                : undefined
              const formattedDate = new Date(entry.watch_date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })

              const isTv = entry.media_type === "tv"
              const episodeText =
                isTv && entry.season_number && entry.episode_number
                  ? `S${String(entry.season_number).padStart(2, "0")}E${String(entry.episode_number).padStart(2, "0")}`
                  : isTv && entry.season_number
                    ? `Season ${entry.season_number}`
                    : null

              const actionLabel = episodeText ? `Watched ${episodeText}` : actionDetails.text

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background group-hover:scale-125 transition-transform duration-instant" />

                  {/* Activity Entry Card */}
                  <div className="flex gap-4 p-4 border border-border bg-surface/50 backdrop-blur-sm rounded-card hover:border-border-hover transition-colors shadow-sm">
                    {/* Tiny Movie Poster */}
                    <div
                      onClick={() => navigate(`/${entry.media_type}/${entry.media_id}`)}
                      className="h-16 w-11 shrink-0 rounded-button overflow-hidden bg-zinc-900 border border-border/60 aspect-[2/3] cursor-pointer flex items-center justify-center"
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={entry.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : isTv ? (
                        <Tv className="h-6 w-6 text-muted-foreground/30" />
                      ) : (
                        <Film className="h-6 w-6 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Metadata column */}
                    <div className="flex-grow space-y-2.5 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3
                          onClick={() => navigate(`/${entry.media_type}/${entry.media_id}`)}
                          className="text-sm font-extrabold tracking-tight truncate hover:text-primary cursor-pointer max-w-md"
                        >
                          {entry.title}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Action status and details */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${actionDetails.color}`}
                        >
                          {actionLabel}
                        </span>

                        {entry.episode_name && (
                          <span className="text-[11px] text-foreground font-bold italic truncate max-w-[200px]">
                            "{entry.episode_name}"
                          </span>
                        )}

                        {/* Progress changes indicator */}
                        {!isTv &&
                          entry.action === "continued" &&
                          entry.previous_progress !== null &&
                          entry.new_progress !== null && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                              <span>{entry.previous_progress}%</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-foreground font-bold">
                                {entry.new_progress}%
                              </span>
                            </span>
                          )}

                        {isTv && entry.new_progress !== null && (
                          <span className="text-[10px] text-muted-foreground font-semibold bg-surface border border-border/60 px-2 py-0.5 rounded-full">
                            {entry.new_progress}% Overall
                          </span>
                        )}

                        {entry.action === "completed" &&
                          entry.completion_source === "progress_100" && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Auto 100%
                            </span>
                          )}

                        {/* Runtime indicator */}
                        {entry.runtime_minutes && (
                          <span className="text-[10px] text-muted-foreground font-semibold bg-surface border border-border/60 px-2 py-0.5 rounded-full">
                            {entry.runtime_minutes} mins
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-6">
              <span className="text-xs text-muted-foreground font-semibold">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default WatchHistory
