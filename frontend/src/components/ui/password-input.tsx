import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, type InputProps } from "./input"
import { cn } from "@/lib/utils"

export type PasswordInputProps = Omit<InputProps, "type">

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
            <span
              className={cn(
                "absolute transition-all duration-standard ease-out-decelerate",
                showPassword ? "scale-0 rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100"
              )}
            >
              <Eye className="h-4 w-4" />
            </span>
            <span
              className={cn(
                "absolute transition-all duration-standard ease-out-decelerate",
                showPassword ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-45 opacity-0"
              )}
            >
              <EyeOff className="h-4 w-4" />
            </span>
          </span>
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
