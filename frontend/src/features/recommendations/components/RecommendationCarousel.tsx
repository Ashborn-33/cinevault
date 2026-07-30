import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import RecommendationCard from "./RecommendationCard"
import type { RecommendationItem } from "../types/recommendations"

interface RecommendationCarouselProps {
  title: string
  subtitle?: string
  items: RecommendationItem[]
}

export function RecommendationCarousel({ title, subtitle, items }: RecommendationCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 500
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-3 font-sans select-none relative group/carousel">
      {/* Header Info */}
      <div className="space-y-0.5">
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
            {subtitle}
          </p>
        )}
      </div>

      {/* Slide Container wrapper */}
      <div className="relative">
        {/* Left scroll control button */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-border bg-background/90 text-foreground flex items-center justify-center cursor-pointer shadow opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 hover:border-primary focus:outline-none"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Horizontal scroll rail */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-4"
        >
          {items.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>

        {/* Right scroll control button */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-border bg-background/90 text-foreground flex items-center justify-center cursor-pointer shadow opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 hover:border-primary focus:outline-none"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
export default RecommendationCarousel
