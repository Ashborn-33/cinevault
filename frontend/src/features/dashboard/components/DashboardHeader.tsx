import { useProfile } from "@/features/onboarding"
import { Tv, Sparkles, Film } from "lucide-react"

interface DashboardHeaderProps {
  inProgressCount: number
}

export function DashboardHeader({ inProgressCount }: DashboardHeaderProps) {
  const { profile } = useProfile()
  const username = profile?.username || "CineVault Member"
  const avatarUrl = profile?.avatar_url

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Dynamic motivational messages
  const getMotivationalMessage = () => {
    if (inProgressCount === 0) {
      return "Start building your library and track your movie and TV progress!"
    }
    if (inProgressCount === 1) {
      return "You have 1 title in progress. Let's finish it!"
    }
    return `You have ${inProgressCount} titles in progress. Ready to dive back in?`
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 border border-border bg-surface/50 backdrop-blur-sm rounded-card gap-6 font-sans">
      <div className="flex items-center gap-4 min-w-0">
        {/* User avatar or letter placeholder */}
        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary bg-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${username}'s Profile`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-black text-primary uppercase">{username.charAt(0)}</span>
          )}
        </div>

        {/* Greetings and motivational messages */}
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            Welcome back, <span className="text-primary truncate">{username}</span>
            <Sparkles className="h-4.5 w-4.5 text-accent animate-pulse shrink-0" />
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">{getMotivationalMessage()}</p>
        </div>
      </div>

      {/* Date metadata display */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-border/40 pt-4 md:pt-0 gap-1 text-[11px] font-semibold text-muted-foreground shrink-0">
        <span>{formattedDate}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Film className="h-3.5 w-3.5 text-primary" />
            CineVault On-Track
          </span>
          <span className="flex items-center gap-1">
            <Tv className="h-3.5 w-3.5 text-accent" />
            Home
          </span>
        </div>
      </div>
    </div>
  )
}
export default DashboardHeader
