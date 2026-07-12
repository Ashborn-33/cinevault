import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full border border-transparent bg-clip-padding font-sans transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 duration-instant ease-out-decelerate select-text placeholder:text-muted-foreground",
  {
    variants: {
      variant: {
        default:
          "border-border bg-background hover:border-muted-foreground/40 focus-visible:border-primary",
        filled:
          "bg-surface hover:bg-surface-hover focus-visible:bg-background focus-visible:border-primary",
        ghost:
          "bg-transparent hover:bg-surface hover:border-border/50 focus-visible:bg-background focus-visible:border-primary",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-input",
        md: "h-10 px-4 text-sm rounded-input",
        lg: "h-12 px-5 text-base rounded-input",
      },
      state: {
        normal: "",
        error: "border-error focus-visible:border-error focus-visible:ring-error/20",
        success: "border-success focus-visible:border-success focus-visible:ring-success/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "normal",
    },
  }
)

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, success, type = "text", ...props }, ref) => {
    const inputState = error ? "error" : success ? "success" : "normal"

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, state: inputState, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
