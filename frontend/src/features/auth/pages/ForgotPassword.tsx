import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormField, FieldError } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAuth } from "../hooks/useAuth"
import { getReadableAuthError } from "../utils/authErrors"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export function ForgotPassword() {
  const { resetPassword, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordData) => {
    setAuthError(null)
    try {
      await resetPassword(data.email)
      setIsSuccess(true)
    } catch (err) {
      setAuthError(getReadableAuthError(err))
    }
  }

  if (isSuccess) {
    return (
      <>
        <CardHeader className="text-center space-y-2 pb-4">
          <CheckCircle className="h-12 w-12 text-success mx-auto" />
          <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
            Email Sent
          </CardTitle>
          <CardDescription className="text-xs">
            We have sent password recovery instructions to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check your inbox and click the reset link to verify and change your password.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your email to receive recovery instructions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {authError && (
          <div
            className="flex gap-2 p-3 text-xs border border-error/20 bg-error/5 text-error rounded-button animate-in fade-in duration-standard"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              error={!!errors.email}
              placeholder="name@example.com"
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </FormField>

          <Button type="submit" className="w-full mt-2" loading={loading.resettingPassword}>
            Send Recovery Email
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center justify-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>
      </CardContent>
    </>
  )
}
export default ForgotPassword
