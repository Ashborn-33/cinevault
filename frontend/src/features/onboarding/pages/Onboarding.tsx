import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card } from "@/components/ui/card"
import { useProfile } from "../hooks/useProfile"
import type { OnboardingData } from "../types/onboarding"

import { WelcomeStep } from "../components/WelcomeStep"
import { ContentPreferencesStep } from "../components/ContentPreferencesStep"
import { GenreSelectionStep } from "../components/GenreSelectionStep"
import { AvatarStep } from "../components/AvatarStep"
import { CompletionStep } from "../components/CompletionStep"

export function Onboarding() {
  const { completeOnboarding } = useProfile()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    preferredContent: [],
    favoriteGenres: [],
    avatar: null,
    avatarUrl: null,
  })

  const nextStep = () => setStep((s) => Math.min(s + 1, 5))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleComplete = async () => {
    setSaving(true)
    try {
      await completeOnboarding(data.preferredContent, data.favoriteGenres, data.avatarUrl)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      console.error("Failed to complete onboarding", err)
      alert("Failed to save onboarding settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep onNext={nextStep} />
      case 2:
        return (
          <ContentPreferencesStep
            selected={data.preferredContent}
            onChange={(val) => setData((d) => ({ ...d, preferredContent: val }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <GenreSelectionStep
            selected={data.favoriteGenres}
            onChange={(val) => setData((d) => ({ ...d, favoriteGenres: val }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <AvatarStep
            avatarFile={data.avatar}
            avatarUrl={data.avatarUrl}
            onChange={(file, url) => setData((d) => ({ ...d, avatar: file, avatarUrl: url }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <CompletionStep
            preferredContent={data.preferredContent}
            favoriteGenres={data.favoriteGenres}
            onComplete={handleComplete}
            onBack={prevStep}
            loading={saving}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-medium shadow-level-2 flex flex-col justify-between min-h-[380px] p-2">
        <div className="flex-grow flex flex-col justify-center">{renderStep()}</div>

        {/* Step Indicator footer inside card */}
        <div className="border-t border-border/40 py-3 flex items-center justify-between text-xs text-muted-foreground px-4 font-semibold">
          <span>Step {step} of 5</span>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx + 1 === step ? "bg-primary w-4" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
export default Onboarding
