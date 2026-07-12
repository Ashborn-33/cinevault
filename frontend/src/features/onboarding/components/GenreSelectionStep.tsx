import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { ONBOARDING_GENRES } from "../constants/genres"

interface StepProps {
  selected: string[]
  onChange: (value: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function GenreSelectionStep({ selected, onChange, onNext, onBack }: StepProps) {
  const toggleGenre = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((item) => item !== genre))
    } else {
      onChange([...selected, genre])
    }
  }

  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
          Favorite Genres
        </CardTitle>
        <CardDescription className="text-xs">
          Choose the categories that appeal to you most
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-2 justify-center font-sans">
          {ONBOARDING_GENRES.map((genre) => {
            const isSelected = selected.includes(genre)
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground font-bold shadow-level-1 scale-95"
                    : "bg-surface border-border text-foreground hover:bg-surface-hover"
                }`}
              >
                {genre}
              </button>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="w-1/3">
          Back
        </Button>
        <Button onClick={onNext} className="w-2/3" disabled={selected.length === 0}>
          Next Step
        </Button>
      </CardFooter>
    </>
  )
}
