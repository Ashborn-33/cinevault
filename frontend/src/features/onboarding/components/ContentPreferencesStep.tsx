import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface StepProps {
  selected: string[]
  onChange: (value: string[]) => void
  onNext: () => void
  onBack: () => void
}

const CONTENT_OPTIONS = [
  "Movies",
  "TV Shows",
  "Anime",
  "K-Dramas",
  "Documentaries",
  "Cartoons",
  "Web Series",
]

export function ContentPreferencesStep({ selected, onChange, onNext, onBack }: StepProps) {
  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
          Content Interests
        </CardTitle>
        <CardDescription className="text-xs">
          Select what type of media you plan to track
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {CONTENT_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleOption(opt)}
                className={`py-3 px-4 rounded-button text-xs font-semibold border transition-all cursor-pointer select-none text-center outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground font-bold shadow-level-1 scale-95"
                    : "bg-surface border-border text-foreground hover:bg-surface-hover hover:border-border-hover"
                }`}
              >
                {opt}
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
