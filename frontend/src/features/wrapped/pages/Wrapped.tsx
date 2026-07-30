import { useState } from "react"
import { Sparkles, Film } from "lucide-react"
import { useWrapped } from "../hooks/useWrapped"
import { WrappedCarousel } from "../components/WrappedCarousel"
import { WrappedSkeleton } from "../components/WrappedSkeleton"

export function Wrapped() {
  const years = [
    { value: "2026", label: "2026 Wrapped" },
    { value: "2025", label: "2025 Wrapped" },
    { value: "lifetime", label: "Lifetime Wrapped" },
  ]

  const [selectedYear, setSelectedYear] = useState("2026")
  const { data, isLoading } = useWrapped(selectedYear)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10 space-y-6 md:space-y-8 font-sans select-none text-foreground">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight">
              CineVault Wrapped
            </h1>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            Your viewing journey summarized into shareable slideshow highlights.
          </p>
        </div>

        {/* Year Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <button
              key={y.value}
              onClick={() => setSelectedYear(y.value)}
              className={`px-3 py-1.5 rounded-button text-xs font-black uppercase transition-all duration-200 outline-none border ${
                selectedYear === y.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface text-muted-foreground border-border hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Presentation Area */}
      <div className="min-h-[450px] flex items-center justify-center">
        {isLoading ? (
          <WrappedSkeleton />
        ) : data ? (
          <div className="w-full max-w-sm">
            <WrappedCarousel data={data} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-card bg-surface/20 max-w-lg mx-auto py-16 space-y-6">
            <div className="p-4 bg-primary/10 rounded-full border border-primary/20 text-primary">
              <Film className="h-10 w-10 shrink-0" />
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h2 className="text-base font-black tracking-tight">No Viewing Data Found</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                We couldn't compile a {selectedYear === "lifetime" ? "lifetime" : `${selectedYear}`}{" "}
                Wrapped summary. Mark some movies as completed to unlock your story!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Wrapped
