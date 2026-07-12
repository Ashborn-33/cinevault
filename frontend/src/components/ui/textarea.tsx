import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full border border-transparent bg-clip-padding font-sans transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 duration-instant ease-out-decelerate py-2 select-text placeholder:text-muted-foreground",
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
        sm: "px-3 text-xs rounded-input",
        md: "px-4 text-sm rounded-input",
        lg: "px-5 text-base rounded-input",
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

export interface TextareaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  success?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, success, ...props }, ref) => {
    const textareaState = error ? "error" : success ? "success" : "normal"

    return (
      <textarea
        className={cn(textareaVariants({ variant, size, state: textareaState, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
