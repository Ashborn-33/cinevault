import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface StepProps {
  avatarFile: File | null
  avatarUrl: string | null
  onChange: (file: File | null, url: string | null) => void
  onNext: () => void
  onBack: () => void
}

export function AvatarStep({ avatarUrl, onChange, onNext, onBack }: StepProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onChange(file, url)
    }
  }

  const handleClear = () => {
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl)
    }
    onChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
          Profile Picture
        </CardTitle>
        <CardDescription className="text-xs">
          Upload an avatar image to personalize your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col items-center justify-center">
        {/* Preview Circle */}
        <div className="relative h-24 w-24 rounded-full border-2 border-border overflow-hidden bg-primary/5 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-primary font-heading">CV</span>
          )}
        </div>

        {/* Input Controls */}
        <div className="w-full space-y-3">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="avatar-upload-input"
          />
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? "Change Photo" : "Upload Photo"}
            </Button>
            {avatarUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="w-1/3">
          Back
        </Button>
        <Button onClick={onNext} className="w-2/3">
          {avatarUrl ? "Next Step" : "Skip & Continue"}
        </Button>
      </CardFooter>
    </>
  )
}
