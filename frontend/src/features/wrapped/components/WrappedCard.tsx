import { motion } from "framer-motion"
import {
  Film,
  Tv,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  User,
  Heart,
} from "lucide-react"
import type { WrappedData } from "../types/wrapped"
import { AnimatedCounter } from "./AnimatedCounter"
import { GenreChart } from "./GenreChart"
import { ShareCard } from "./ShareCard"

interface WrappedCardProps {
  cardIndex: number
  data: WrappedData
}

export function WrappedCard({ cardIndex, data }: WrappedCardProps) {
  const imagePrefix = "https://image.tmdb.org/t/p/w300"

  // Animation variants
  const slideUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  }

  const scaleUp = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  }

  switch (cardIndex) {
    // Card 1: Welcome
    case 0:
      return (
        <motion.div
          key="welcome"
          variants={scaleUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 text-white rounded-card"
        >
          <div className="p-4 bg-primary/10 rounded-full border border-primary/20 shadow animate-pulse">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Your CineVault Wrapped
            </span>
            <h2 className="text-3xl font-black font-heading leading-tight tracking-tight">
              {data.yearLabel} Journey
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed font-semibold">
              Let's look back at the movies, shows, and milestones that shaped your screen time.
            </p>
          </div>
        </motion.div>
      )

    // Card 2: Watched Stats
    case 1:
      return (
        <motion.div
          key="stats"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-zinc-900 to-indigo-950 text-white rounded-card space-y-8"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-primary font-black uppercase tracking-wider">
              Viewing Volume
            </span>
            <h3 className="text-2xl font-black font-heading">By The Numbers</h3>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-card border border-white/5">
              <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Film className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black">
                  <AnimatedCounter value={data.moviesCount} />
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase">
                  Movies Completed
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-card border border-white/5">
              <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
                <Tv className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black">
                  <AnimatedCounter value={data.episodesCount} />
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase">
                  Episodes Completed
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-card border border-white/5">
              <div className="p-2.5 bg-pink-500/10 rounded-lg text-pink-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black">
                  <AnimatedCounter value={data.hoursCount} />
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase">
                  Total Watch Hours
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )

    // Card 3: Favorite Genres
    case 2:
      return (
        <motion.div
          key="genres"
          variants={scaleUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-indigo-950 via-zinc-950 to-zinc-900 text-white rounded-card text-center space-y-8"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
              Taste Signature
            </span>
            <h3 className="text-2xl font-black font-heading">Your Top Genres</h3>
          </div>

          <GenreChart genres={data.genres} />
        </motion.div>
      )

    // Card 4: Favorite Actor & Director
    case 3:
      return (
        <motion.div
          key="cast-crew"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-purple-950 to-zinc-900 text-white rounded-card space-y-8"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider">
              Talent Spotlight
            </span>
            <h3 className="text-2xl font-black font-heading">Favorite Stars</h3>
          </div>

          <div className="space-y-5">
            {data.favoriteActor && (
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-card border border-white/5">
                {data.favoriteActor.profilePath ? (
                  <img
                    src={`${imagePrefix}${data.favoriteActor.profilePath}`}
                    alt={data.favoriteActor.name}
                    className="h-14 w-14 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black text-purple-400 uppercase">
                    Favorite Actor
                  </span>
                  <div className="text-base font-black leading-tight">
                    {data.favoriteActor.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    Watched {data.favoriteActor.count} times
                  </div>
                </div>
              </div>
            )}

            {data.favoriteDirector && (
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-card border border-white/5">
                {data.favoriteDirector.profilePath ? (
                  <img
                    src={`${imagePrefix}${data.favoriteDirector.profilePath}`}
                    alt={data.favoriteDirector.name}
                    className="h-14 w-14 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black text-purple-400 uppercase">
                    Favorite Director
                  </span>
                  <div className="text-base font-black leading-tight">
                    {data.favoriteDirector.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    Watched {data.favoriteDirector.count} times
                  </div>
                </div>
              </div>
            )}

            {!data.favoriteActor && !data.favoriteDirector && (
              <p className="text-xs text-muted-foreground text-center font-semibold">
                No actor/director details available in this range.
              </p>
            )}
          </div>
        </motion.div>
      )

    // Card 5: Streaks & Activity
    case 4:
      return (
        <motion.div
          key="streak"
          variants={scaleUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950 text-white rounded-card space-y-6"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-primary font-black uppercase tracking-wider">
              Consistency
            </span>
            <h3 className="text-2xl font-black font-heading">Viewing Rhythms</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 p-4 rounded-card border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-black uppercase text-muted-foreground">
                  Longest Streak
                </span>
              </div>
              <span className="text-lg font-black text-indigo-400">{data.longestStreak} days</span>
            </div>

            <div className="bg-white/5 p-4 rounded-card border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-black uppercase text-muted-foreground">
                  Most Active Month
                </span>
              </div>
              <span className="text-xs font-black uppercase text-purple-400">
                {data.mostActiveMonth}
              </span>
            </div>

            <div className="bg-white/5 p-4 rounded-card border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-pink-400" />
                <span className="text-xs font-black uppercase text-muted-foreground">
                  Peak Weekday
                </span>
              </div>
              <span className="text-xs font-black uppercase text-pink-400">
                {data.mostActiveDay}
              </span>
            </div>
          </div>
        </motion.div>
      )

    // Card 6: Movie & TV Show of the Year
    case 5:
      return (
        <motion.div
          key="featured-year"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 text-white rounded-card space-y-6"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
              Champions
            </span>
            <h3 className="text-2xl font-black font-heading">Picks Of The Year</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide block">
                Movie of Year
              </span>
              {data.movieOfTheYear?.posterPath ? (
                <img
                  src={`${imagePrefix}${data.movieOfTheYear.posterPath}`}
                  alt={data.movieOfTheYear.title}
                  className="w-full aspect-[2/3] object-cover rounded-card border border-white/10 shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-white/10 rounded-card flex items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="text-xs font-black truncate max-w-full">
                {data.movieOfTheYear?.title || "No movie logged"}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide block">
                TV Show of Year
              </span>
              {data.tvShowOfTheYear?.posterPath ? (
                <img
                  src={`${imagePrefix}${data.tvShowOfTheYear.posterPath}`}
                  alt={data.tvShowOfTheYear.title}
                  className="w-full aspect-[2/3] object-cover rounded-card border border-white/10 shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-white/10 rounded-card flex items-center justify-center">
                  <Tv className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="text-xs font-black truncate max-w-full">
                {data.tvShowOfTheYear?.title || "No show logged"}
              </div>
            </div>
          </div>
        </motion.div>
      )

    // Card 7: Hidden Gem
    case 6:
      return (
        <motion.div
          key="hidden-gem"
          variants={scaleUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-indigo-950 via-zinc-950 to-zinc-900 text-white rounded-card space-y-6"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
              Rare Discovery
            </span>
            <h3 className="text-2xl font-black font-heading">Your Hidden Gem</h3>
          </div>

          {data.hiddenGem ? (
            <div className="space-y-3 max-w-[150px] mx-auto">
              {data.hiddenGem.posterPath ? (
                <img
                  src={`${imagePrefix}${data.hiddenGem.posterPath}`}
                  alt={data.hiddenGem.title}
                  className="w-full aspect-[2/3] object-cover rounded-card border border-white/15 shadow-level-2"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-white/10 rounded-card flex items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="text-sm font-black truncate">{data.hiddenGem.title}</div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-semibold">
              No completed media in this range.
            </p>
          )}
        </motion.div>
      )

    // Card 8: Top Collection
    case 7:
      return (
        <motion.div
          key="collection"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-zinc-900 to-purple-950 text-white rounded-card space-y-6"
        >
          <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/20 shadow">
            <Layers className="h-10 w-10 text-purple-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider block">
              Curator Pride
            </span>
            <h3 className="text-2xl font-black font-heading">Top Collection</h3>
            {data.topCollection ? (
              <div className="pt-2 space-y-1">
                <div className="text-lg font-black text-white">{data.topCollection.name}</div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Holds {data.topCollection.itemsCount} curated items
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground pt-2 font-semibold">
                No collections created in this period yet.
              </p>
            )}
          </div>
        </motion.div>
      )

    // Card 9: Achievements Earned
    case 8:
      return (
        <motion.div
          key="achievements"
          variants={scaleUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-indigo-950 via-zinc-950 to-amber-950 text-white rounded-card space-y-6"
        >
          <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-sm animate-bounce">
            <Award className="h-10 w-10 text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">
              Milestones Met
            </span>
            <h3 className="text-2xl font-black font-heading">Achievements Unlocked</h3>
            <div className="text-5xl font-black text-white pt-2">
              <AnimatedCounter value={data.achievementsEarned} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-semibold">
              Badges earned for consistency, high ratings, and diverse genres.
            </p>
          </div>
        </motion.div>
      )

    // Card 10: Viewer Level & XP
    case 9:
      return (
        <motion.div
          key="viewer-identity"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-purple-950 via-zinc-950 to-zinc-900 text-white rounded-card space-y-6"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-primary font-black uppercase tracking-wider">
              XP Progress
            </span>
            <h3 className="text-2xl font-black font-heading">Viewer Level</h3>
          </div>

          <div className="space-y-5 bg-white/5 p-5 rounded-card border border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-muted-foreground">
                Current Level
              </span>
              <span className="text-lg font-black text-primary">Level {data.levelReached}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-muted-foreground">XP Earned</span>
              <span className="text-base font-black text-white">+{data.xpEarned} XP</span>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (data.xpEarned % 300) / 3)}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <div className="text-[9px] font-black uppercase text-muted-foreground text-right">
                {data.xpEarned % 300} / 300 XP to next level
              </div>
            </div>
          </div>
        </motion.div>
      )

    // Card 11: Recommendations You Loved
    case 10:
      return (
        <motion.div
          key="next-journey"
          variants={scaleUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-zinc-900 to-indigo-950 text-white rounded-card space-y-6"
        >
          <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow">
            <Heart className="h-10 w-10 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">
              Recommendation Engine
            </span>
            <h3 className="text-xl font-black font-heading leading-tight">
              Ready For What's Next?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-semibold">
              Your taste aggregates are already generating brand new recommendation carousels in
              your Dashboard. Keep exploring!
            </p>
          </div>
        </motion.div>
      )

    // Card 12: Share Screen
    case 11:
      return (
        <motion.div
          key="share-wrapped"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center h-full p-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-card"
        >
          <ShareCard data={data} />
        </motion.div>
      )

    default:
      return null
  }
}
export default WrappedCard
