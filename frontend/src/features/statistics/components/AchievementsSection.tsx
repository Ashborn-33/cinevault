import { Award, Lock } from "lucide-react"
import type { Achievement } from "../types/statistics"

interface AchievementsSectionProps {
  achievements: Achievement[]
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-4 shadow-sm hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" />
          Milestones & Achievements
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black">
          {unlockedCount} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`flex flex-col items-center text-center p-3.5 border rounded-button transition-all relative ${
              ach.unlocked
                ? "bg-surface border-primary/30 hover:border-primary shadow-sm"
                : "bg-surface/30 border-border/40 opacity-45 grayscale select-none"
            }`}
          >
            {/* Achievement Icon Badge */}
            <div className="text-3xl mb-2.5 transform hover:scale-110 transition-transform select-none">
              {ach.unlocked ? (
                ach.icon
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground/60 mt-1.5" />
              )}
            </div>

            {/* Content text */}
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold tracking-tight truncate max-w-[100px]">
                {ach.title}
              </h4>
              <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed line-clamp-2">
                {ach.description}
              </p>
            </div>

            {/* Mini unlocked corner check indicator */}
            {ach.unlocked && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
export default AchievementsSection
