import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  circle?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, circle = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-skeleton/40 dark:bg-skeleton/35 motion-reduce:animate-none",
          circle && "rounded-full",
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2 w-full", className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-3 rounded", index === lines - 1 && lines > 1 ? "w-4/5" : "w-full")}
          />
        ))}
      </div>
    )
  }
)
SkeletonText.displayName = "SkeletonText"

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    }

    return <Skeleton ref={ref} circle className={cn(sizeClasses[size], className)} {...props} />
  }
)
SkeletonAvatar.displayName = "SkeletonAvatar"

export interface SkeletonPosterProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: "2/3" | "16/9"
}

const SkeletonPoster = React.forwardRef<HTMLDivElement, SkeletonPosterProps>(
  ({ className, aspectRatio = "2/3", ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn(
          aspectRatio === "2/3" ? "aspect-[2/3]" : "aspect-[16/9]",
          "w-full rounded-card",
          className
        )}
        {...props}
      />
    )
  }
)
SkeletonPoster.displayName = "SkeletonPoster"

export type SkeletonMediaCardProps = React.HTMLAttributes<HTMLDivElement>

const SkeletonMediaCard = React.forwardRef<HTMLDivElement, SkeletonMediaCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "aspect-[2/3] w-full rounded-card border border-border/20 bg-skeleton/40 animate-pulse motion-reduce:animate-none relative p-4 flex flex-col justify-end gap-3",
          className
        )}
        {...props}
      >
        {/* Top right overlay box placeholder */}
        <div className="absolute right-3 top-3 h-6 w-6 rounded-badge bg-zinc-800/80" />
        {/* Top left overlay box placeholder */}
        <div className="absolute left-3 top-3 h-5 w-14 rounded-badge bg-zinc-800/80" />

        {/* Metadata placeholders */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-zinc-800/80" />
          <div className="h-3 w-1/2 rounded bg-zinc-800/80" />
          <div className="h-3 w-2/3 rounded bg-zinc-800/80" />
        </div>

        {/* Rating placeholders */}
        <div className="flex gap-2">
          <div className="h-4 w-10 rounded bg-zinc-800/80" />
          <div className="h-4 w-10 rounded bg-zinc-800/80" />
        </div>
      </div>
    )
  }
)
SkeletonMediaCard.displayName = "SkeletonMediaCard"

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonPoster, SkeletonMediaCard }
