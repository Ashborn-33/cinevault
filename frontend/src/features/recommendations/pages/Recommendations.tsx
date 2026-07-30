import {
  useRecommendations,
  useTrendingForYou,
  useHiddenGems,
  useContinueSuggestions,
} from "../hooks/useRecommendations"
import { RecommendationCarousel } from "../components/RecommendationCarousel"
import { RecommendationSkeleton } from "../components/RecommendationSkeleton"
import { EmptyRecommendations } from "../components/EmptyRecommendations"
import { Sparkles } from "lucide-react"

export function Recommendations() {
  const {
    becauseYouWatched,
    genreRecs,
    isLoading: isRecsLoading,
    isError,
    error,
  } = useRecommendations()
  const { data: trending = [], isLoading: isTrendingLoading } = useTrendingForYou()
  const { data: hiddenGems = [], isLoading: isHiddenLoading } = useHiddenGems()
  const { data: continueSuggestions = [], isLoading: isContinueLoading } = useContinueSuggestions()

  const isLoading = isRecsLoading || isTrendingLoading || isHiddenLoading || isContinueLoading

  if (isLoading) {
    return <RecommendationSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 flex items-center justify-center bg-background text-foreground text-center">
        <div className="p-8 border border-error/20 bg-error/5 rounded-card max-w-md font-sans">
          <p className="text-sm font-bold text-error">Recommendation Error</p>
          <p className="text-xs text-muted-foreground mt-2">{error?.message}</p>
        </div>
      </div>
    )
  }

  // Check if we have absolutely any recommendation content
  const hasContent =
    becauseYouWatched.length > 0 ||
    genreRecs.length > 0 ||
    trending.length > 0 ||
    hiddenGems.length > 0 ||
    continueSuggestions.length > 0

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] bg-background">
        <div className="space-y-1 border-b border-border/40 pb-5">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 select-none">
            <Sparkles className="h-8 w-8 text-primary" />
            CineVault Intelligence
          </h1>
          <p className="text-xs text-muted-foreground">
            Personalized, rule-based recommendation lists matching your watching habits.
          </p>
        </div>
        <EmptyRecommendations />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background font-sans">
      {/* Header and taglines */}
      <div className="space-y-1 border-b border-border/40 pb-5">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 select-none">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          CineVault Intelligence
        </h1>
        <p className="text-xs text-muted-foreground">
          Rule-based, high-fidelity recommendations computed from your viewing history, completed
          lists, and TMDB indexes.
        </p>
      </div>

      {/* 1. Continue Watched items / suggestions */}
      {continueSuggestions.length > 0 && (
        <RecommendationCarousel
          title="Resume watching or Similar Shows"
          subtitle="TV shows from your watching list or items closely related to TV titles you completed."
          items={continueSuggestions}
        />
      )}

      {/* 2. Because You Watched items */}
      {becauseYouWatched.length > 0 && (
        <RecommendationCarousel
          title="Because You Watched"
          subtitle="Suggestions matching theme elements of your recently completed library movies and shows."
          items={becauseYouWatched}
        />
      )}

      {/* 3. New releases / Genre preferences */}
      {genreRecs.length > 0 && (
        <RecommendationCarousel
          title="Recommended Releases For You"
          subtitle="Top popular choices fitting your favorite genre selections in CineVault."
          items={genreRecs}
        />
      )}

      {/* 4. Trending lists */}
      {trending.length > 0 && (
        <RecommendationCarousel
          title="Trending Matches For You"
          subtitle="High rating movies and TV series trending in CineVault matching your metadata preferences."
          items={trending}
        />
      )}

      {/* 5. Hidden gems lists */}
      {hiddenGems.length > 0 && (
        <RecommendationCarousel
          title="Hidden Gems & Discoveries"
          subtitle="Highly-rated titles with lower global vote tallies you might have overlooked."
          items={hiddenGems}
        />
      )}
    </div>
  )
}
export default Recommendations
