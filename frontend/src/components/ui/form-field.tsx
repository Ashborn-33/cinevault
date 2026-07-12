import * as React from "react"
import { cn } from "@/lib/utils"

export const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("space-y-2", className)} {...props} />
  }
)
FormField.displayName = "FormField"

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-xs text-muted-foreground tracking-wide", className)}
      {...props}
    />
  )
})
FieldDescription.displayName = "FieldDescription"

export const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null

  return (
    <p
      ref={ref}
      role="alert"
      className={cn("text-xs font-medium tracking-wide text-error", className)}
      {...props}
    >
      {children}
    </p>
  )
})
FieldError.displayName = "FieldError"
