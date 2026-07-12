import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface StepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-heading text-3xl font-extrabold tracking-tight">
          Welcome to CineVault
        </CardTitle>
        <CardDescription className="text-xs">
          Your premium entertainment tracking vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Catalog your movie collections, track episode progress of anime and TV shows, log reviews,
          and analyze personal statistics.
        </p>
        <p className="text-xs text-muted-foreground">
          Let's spend a quick minute configuring your content preferences to personalize your
          experience.
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={onNext} className="w-full">
          Get Started
        </Button>
      </CardFooter>
    </>
  )
}
