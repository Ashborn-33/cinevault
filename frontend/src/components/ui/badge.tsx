import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  X,
  Play,
  Check,
  Calendar,
  Pause,
  XCircle,
  Heart,
  Flame,
  Bell,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-badge border border-transparent font-sans tracking-wide uppercase select-none transition-colors duration-standard",
  {
    variants: {
      variant: {
        default: "bg-surface border-border text-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary/10 border-secondary/20 text-muted-foreground",
        outline: "border-border bg-transparent text-foreground",
        ghost: "bg-transparent text-foreground border-transparent",
        success: "bg-success/10 border-success/30 text-success",
        warning: "bg-warning/10 border-warning/30 text-warning",
        error: "bg-error/10 border-error/30 text-error",
        info: "bg-info/10 border-info/30 text-info",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px] font-bold",
        md: "px-2.5 py-0.5 text-[11px] font-bold",
        lg: "px-3 py-1 text-xs font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  onRemove?: () => void
  removeLabel?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, icon, onRemove, removeLabel = "Remove badge", children, ...props },
    ref
  ) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        <span>{children}</span>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-full hover:bg-foreground/10 p-0.5 text-current hover:text-foreground cursor-pointer select-none transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={removeLabel}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  }
)
Badge.displayName = "Badge"

export type StatusBadgeType =
  | "watching"
  | "completed"
  | "planning"
  | "on_hold"
  | "dropped"
  | "favorite"
  | "trending"
  | "upcoming"
  | "new_episode"

export interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "icon"> {
  status: StatusBadgeType
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, children, ...props }, ref) => {
    let variant: BadgeProps["variant"] = "default"
    let icon: React.ReactNode = null
    let label = ""

    switch (status) {
      case "watching":
        variant = "warning"
        icon = <Play className="h-3 w-3 fill-current" />
        label = "Watching"
        break
      case "completed":
        variant = "success"
        icon = <Check className="h-3 w-3 stroke-[3]" />
        label = "Completed"
        break
      case "planning":
        variant = "info"
        icon = <Calendar className="h-3 w-3" />
        label = "Planning"
        break
      case "on_hold":
        variant = "secondary"
        icon = <Pause className="h-3 w-3 fill-current" />
        label = "On Hold"
        break
      case "dropped":
        variant = "error"
        icon = <XCircle className="h-3 w-3" />
        label = "Dropped"
        break
      case "favorite":
        variant = "error"
        icon = <Heart className="h-3 w-3 fill-current text-rose-500" />
        label = "Favorite"
        break
      case "trending":
        variant = "primary"
        icon = <Flame className="h-3 w-3 fill-current" />
        label = "Trending"
        break
      case "upcoming":
        variant = "info"
        icon = <Bell className="h-3 w-3" />
        label = "Upcoming"
        break
      case "new_episode":
        variant = "primary"
        icon = <Sparkles className="h-3 w-3 fill-current" />
        label = "New Episode"
        break
    }

    return (
      <Badge ref={ref} variant={variant} icon={icon} className={className} {...props}>
        {children || label}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export interface GenreBadgeProps extends Omit<BadgeProps, "variant"> {
  genre: string
}

const GenreBadge = React.forwardRef<HTMLSpanElement, GenreBadgeProps>(
  ({ genre, className, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="secondary"
        className={cn("normal-case tracking-normal", className)}
        {...props}
      >
        {genre}
      </Badge>
    )
  }
)
GenreBadge.displayName = "GenreBadge"

export type RatingProvider = "imdb" | "tmdb" | "mal" | "anilist" | "user"

export interface RatingBadgeProps extends Omit<BadgeProps, "variant" | "icon"> {
  provider: RatingProvider
  rating: number | string
}

const RatingBadge = React.forwardRef<HTMLSpanElement, RatingBadgeProps>(
  ({ provider, rating, className, ...props }, ref) => {
    let variant: BadgeProps["variant"] = "default"
    let customStyles = ""
    let providerLabel = ""

    switch (provider) {
      case "imdb":
        customStyles = "bg-[#F5C518] text-black border-transparent font-bold font-mono"
        providerLabel = "IMDb"
        break
      case "tmdb":
        customStyles = "bg-[#01b4e4]/10 border-[#01b4e4]/30 text-[#01b4e4] font-mono"
        providerLabel = "TMDb"
        break
      case "mal":
        customStyles = "bg-[#2e51a2]/10 border-[#2e51a2]/30 text-[#2e51a2] font-mono"
        providerLabel = "MAL"
        break
      case "anilist":
        customStyles = "bg-[#3db4f2]/10 border-[#3db4f2]/30 text-[#3db4f2] font-mono"
        providerLabel = "AniList"
        break
      case "user":
        variant = "primary"
        customStyles = "font-mono"
        providerLabel = "User"
        break
    }

    return (
      <Badge ref={ref} variant={variant} className={cn(customStyles, className)} {...props}>
        <span className="opacity-60 mr-0.5">{providerLabel}</span>
        <span>{rating}</span>
      </Badge>
    )
  }
)
RatingBadge.displayName = "RatingBadge"

export { Badge, StatusBadge, GenreBadge, RatingBadge, badgeVariants }
