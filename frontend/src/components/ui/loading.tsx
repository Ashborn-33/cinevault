import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps extends React.HTMLAttributes<SVGElement> {
  size?: "sm" | "md" | "lg"
}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    }

    return (
      <Loader2
        ref={ref}
        className={cn(
          "animate-spin text-primary shrink-0 motion-reduce:animate-[spin_3s_linear_infinite]",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  visible?: boolean
  message?: string
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, visible = true, message, ...props }, ref) => {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm z-popover flex flex-col items-center justify-center gap-3 animate-in fade-in duration-standard",
          className
        )}
        role="alert"
        aria-busy="true"
        aria-live="polite"
        {...props}
      >
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-muted-foreground tracking-wide">{message}</p>
        )}
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"

export { LoadingSpinner, LoadingOverlay }
