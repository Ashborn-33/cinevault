import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-button text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 duration-instant ease-out-decelerate border border-transparent select-none relative",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-surface border border-border text-foreground hover:bg-surface-hover",
        outline: "border-border bg-background hover:bg-surface-hover hover:text-foreground",
        ghost: "hover:bg-surface-hover hover:text-foreground",
        destructive: "bg-error text-primary-foreground hover:bg-error/80",
        success: "bg-success text-primary-foreground hover:bg-success/80",
        warning: "bg-warning text-primary-foreground hover:bg-warning/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    if (asChild) {
      return (
        <Slot.Root
          className={cn(buttonVariants({ variant, size, className }), "relative")}
          ref={ref}
          {...props}
        >
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
            </span>
          )}
          <Slot.Slottable>{children}</Slot.Slottable>
        </Slot.Root>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "relative")}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
          </span>
        )}
        <span
          className={cn("inline-flex items-center justify-center gap-2", loading && "invisible")}
        >
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
