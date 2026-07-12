import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StepProps {
  onComplete: () => void
  onBack: () => void
  loading: boolean
  preferredContent: string[]
  favoriteGenres: string[]
}

export function CompletionStep({
  onComplete,
  onBack,
  loading,
  preferredContent,
  favoriteGenres,
}: StepProps) {
  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-heading text-3xl font-extrabold tracking-tight">
          Setup Complete!
        </CardTitle>
        <CardDescription className="text-xs">
          Your CineVault is configured and ready for cataloging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-card border border-border bg-surface p-4 text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
              Content Interests:
            </span>
            <div className="flex flex-wrap gap-1">
              {preferredContent.map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
              Favorite Genres:
            </span>
            <div className="flex flex-wrap gap-1">
              {favoriteGenres.map((g) => (
                <Badge key={g} variant="outline" className="text-[10px]">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="w-1/3" disabled={loading}>
          Back
        </Button>
        <Button onClick={onComplete} className="w-2/3" loading={loading}>
          Enter CineVault
        </Button>
      </CardFooter>
    </>
  )
}
