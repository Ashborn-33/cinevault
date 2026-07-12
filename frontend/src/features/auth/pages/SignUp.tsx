import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { FormField, FieldError } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAuth } from "../hooks/useAuth"
import { getReadableAuthError } from "../utils/authErrors"

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphanumeric characters and underscores"
      ),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
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

type SignupData = z.infer<typeof signupSchema>

export function SignUp() {
  const { signUp, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: SignupData) => {
    setAuthError(null)
    try {
      await signUp(data)
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
            Check Your Inbox
          </CardTitle>
          <CardDescription className="text-xs">
            We have sent a verification email to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please click the activation link in the email to verify your account and activate your
            vault.
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
          Create Account
        </CardTitle>
        <CardDescription className="text-xs">
          Sign up to catalog and track your watch lists
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              error={!!errors.username}
              placeholder="cinephile_99"
              {...register("username")}
            />
            <FieldError>{errors.username?.message}</FieldError>
          </FormField>

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

          <FormField>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              error={!!errors.password}
              placeholder="••••••••"
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </FormField>

          <FormField>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              error={!!errors.confirmPassword}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </FormField>

          <Button type="submit" className="w-full mt-2" loading={loading.signingUp}>
            Register Account
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Sign In
            </Link>
          </p>
        </div>
      </CardContent>
    </>
  )
}
export default SignUp
