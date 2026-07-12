import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { FormField, FieldError } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAuth } from "../hooks/useAuth"
import { getReadableAuthError } from "../utils/authErrors"

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export function ResetPassword() {
  const { updatePassword, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordData) => {
    setAuthError(null)
    try {
      await updatePassword(data.password)
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
            Password Updated
          </CardTitle>
          <CardDescription className="text-xs">
            Your password has been successfully updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You can now sign in using your new credentials.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Proceed to Login</Link>
          </Button>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
          Set New Password
        </CardTitle>
        <CardDescription className="text-xs">Enter your new secure password</CardDescription>
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
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              error={!!errors.password}
              placeholder="••••••••"
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </FormField>

          <FormField>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              error={!!errors.confirmPassword}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </FormField>

          <Button type="submit" className="w-full mt-2" loading={loading.resettingPassword}>
            Update Password
          </Button>
        </form>
      </CardContent>
    </>
  )
}
export default ResetPassword
