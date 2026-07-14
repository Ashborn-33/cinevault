import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from "date-fns"
import type { ReleaseEvent } from "../types/releases"

interface CalendarViewProps {
  events: ReleaseEvent[]
  selectedDate: string | null
  onDateSelect: (dateStr: string | null) => void
}

export function CalendarView({ events, selectedDate, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart) // 0 for Sunday, 1 for Monday, etc.

  // Weekdays header
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Group events by day for quick lookup
  const eventsByDay = events.reduce<Record<string, ReleaseEvent[]>>((acc, event) => {
    acc[event.airDate] = acc[event.airDate] || []
    acc[event.airDate].push(event)
    return acc
  }, {})

  return (
    <div className="border border-border bg-surface/50 rounded-card p-4 font-sans select-none shadow-sm">
      {/* Month Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-zinc-900 border border-border/40 cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-zinc-900 border border-border/40 cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-2">
        {weekdays.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Padding for start week offset */}
        {Array.from({ length: startDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Calendar Day Cells */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayEvents = eventsByDay[dateStr] || []
          const isSelected = selectedDate === dateStr
          const isTodayDate = isSameDay(day, new Date())

          const hasMovie = dayEvents.some((e) => e.mediaType === "movie")
          const hasTv = dayEvents.some((e) => e.mediaType === "tv")

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(isSelected ? null : dateStr)}
              className={`relative aspect-square rounded-button border text-[10px] font-bold flex flex-col items-center justify-center cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? "bg-primary border-primary text-white scale-105 shadow-md"
                  : isTodayDate
                    ? "bg-zinc-900 border-primary text-primary"
                    : "bg-surface border-border/50 text-foreground hover:border-foreground"
              }`}
              aria-label={`Select ${format(day, "MMMM d, yyyy")}. ${dayEvents.length} events`}
            >
              <span>{format(day, "d")}</span>

              {/* Event type indicator dots */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {hasMovie && (
                    <span
                      className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-blue-400 animate-pulse"}`}
                      title="Movie release"
                    />
                  )}
                  {hasTv && (
                    <span
                      className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-purple-400 animate-pulse"}`}
                      title="TV episode release"
                    />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-[8px] font-black uppercase tracking-wider text-muted-foreground border-t border-border/40 pt-4 mt-4">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
          Movies
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
          TV Shows
        </span>
      </div>
    </div>
  )
}
export default CalendarView
