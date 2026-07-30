import { useEffect, useRef } from "react"
import { useMotionValue, useTransform, animate } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  duration?: number
}

export function AnimatedCounter({ value, duration = 1.5 }: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" })
    return () => controls.stop()
  }, [value, duration, count])

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest)
      }
    })
  }, [rounded])

  return <span ref={ref}>0</span>
}
export default AnimatedCounter
