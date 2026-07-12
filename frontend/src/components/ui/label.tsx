import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-semibold leading-none text-foreground select-none cursor-pointer tracking-wide",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-error font-bold" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label }
