import { useEffect, useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import type { WrappedData } from "../types/wrapped"
import { WrappedCard } from "./WrappedCard"

interface WrappedCarouselProps {
  data: WrappedData
}

export function WrappedCarousel({ data }: WrappedCarouselProps) {
  const TOTAL_CARDS = 12
  const CARD_DURATION = 7500 // 7.5 seconds per card

  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const progressTimerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)

  // Navigation handlers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev < TOTAL_CARDS - 1) {
        setProgress(0)
        startTimeRef.current = null
        pausedTimeRef.current = 0
        return prev + 1
      }
      return prev // Stay on thank you page
    })
  }, [TOTAL_CARDS])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev > 0) {
        setProgress(0)
        startTimeRef.current = null
        pausedTimeRef.current = 0
        return prev - 1
      }
      return prev
    })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === "ArrowLeft") {
        handlePrev()
      } else if (e.key === " ") {
        e.preventDefault()
        setIsPaused((p) => !p)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrev])

  // Animation frame loop for progress bar
  useEffect(() => {
    if (isPaused) {
      if (progressTimerRef.current) {
        cancelAnimationFrame(progressTimerRef.current)
        progressTimerRef.current = null
      }
      return
    }

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - pausedTimeRef.current
      }

      const elapsed = timestamp - startTimeRef.current
      const pct = Math.min(100, (elapsed / CARD_DURATION) * 100)
      setProgress(pct)

      if (pct >= 100) {
        pausedTimeRef.current = 0
        startTimeRef.current = null
        handleNext()
      } else {
        progressTimerRef.current = requestAnimationFrame(tick)
      }
    }

    progressTimerRef.current = requestAnimationFrame(tick)

    return () => {
      if (progressTimerRef.current) {
        cancelAnimationFrame(progressTimerRef.current)
      }
    }
  }, [isPaused, activeIndex, handleNext])

  // Handle manual pause tracking
  const togglePause = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false)
    } else {
      // Pausing
      setIsPaused(true)
      if (startTimeRef.current) {
        pausedTimeRef.current = performance.now() - startTimeRef.current
      }
    }
  }

  // Tap-to-hold handlers
  const handlePointerDown = () => {
    setIsPaused(true)
    if (startTimeRef.current) {
      pausedTimeRef.current = performance.now() - startTimeRef.current
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPaused(false)
    // If it was a quick click, perform layout-based navigation
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentX = (x / rect.width) * 100

    if (percentX < 25) {
      handlePrev()
    } else if (percentX > 75) {
      handleNext()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto w-full select-none">
      {/* 1. Header Progress Bar Strip */}
      <div className="flex gap-1 w-full px-2">
        {Array.from({ length: TOTAL_CARDS }).map((_, idx) => {
          let widthVal = "0%"
          if (idx < activeIndex) widthVal = "100%"
          if (idx === activeIndex) widthVal = `${progress}%`

          return (
            <div
              key={idx}
              className="h-1.5 flex-grow bg-white/15 rounded-full overflow-hidden relative"
            >
              <div
                style={{ width: widthVal }}
                className="h-full bg-primary rounded-full transition-all duration-75"
              />
            </div>
          )
        })}
      </div>

      {/* 2. Main Slideshow Card Container */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full aspect-[9/16] max-h-[600px] border border-border/80 rounded-card relative bg-zinc-950 overflow-hidden shadow-level-3 cursor-pointer group"
      >
        <WrappedCard cardIndex={activeIndex} data={data} />

        {/* Tap areas indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-[20%] z-dropdown cursor-w-resize" />
        <div className="absolute right-0 top-0 bottom-0 w-[20%] z-dropdown cursor-e-resize" />
      </div>

      {/* 3. Slider controls panel */}
      <div className="flex items-center justify-between w-full px-4">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="p-2 border border-border bg-surface text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-button outline-none transition-colors"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={togglePause}
          className="p-2 border border-border bg-surface text-foreground hover:bg-surface-hover rounded-button outline-none transition-colors flex items-center gap-1.5 text-xs font-black uppercase"
          aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={handleNext}
          disabled={activeIndex === TOTAL_CARDS - 1}
          className="p-2 border border-border bg-surface text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-button outline-none transition-colors"
          aria-label="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
export default WrappedCarousel
