import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AlertCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { FormField, FieldError } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAuth } from "../hooks/useAuth"
import { getReadableAuthError } from "../utils/authErrors"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

type LoginData = z.infer<typeof loginSchema>

export function Login() {
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authError, setAuthError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginData) => {
    setAuthError(null)
    try {
      await signIn(data)
      navigate(from, { replace: true })
    } catch (err) {
      setAuthError(getReadableAuthError(err))
    }
  }

  const handleOAuthPlaceholder = (provider: string) => {
    alert(`${provider} SSO Authentication is not configured in this environment (Coming Soon).`)
  }

  return (
    <>
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight">
          Sign In
        </CardTitle>
        <CardDescription className="text-xs">Access your CineVault collection</CardDescription>
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

          <FormField>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              error={!!errors.password}
              placeholder="••••••••"
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </FormField>

          <Button type="submit" className="w-full mt-2" loading={loading.signingIn}>
            Sign In
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/60"></div>
          <span className="flex-shrink mx-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-grow border-t border-border/60"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleOAuthPlaceholder("Google")}
          >
            Google (Soon)
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleOAuthPlaceholder("GitHub")}
          >
            GitHub (Soon)
          </Button>
        </div>

        <div className="text-center pt-2 space-y-2">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline block mx-auto outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
            onClick={() => handleOAuthPlaceholder("Guest Mode")}
          >
            Continue as Guest (Coming Soon)
          </button>
          <p className="text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </CardContent>
    </>
  )
}
export default Login
