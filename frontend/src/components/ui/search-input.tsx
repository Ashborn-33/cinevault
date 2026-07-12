import * as React from "react"
import { Search, X } from "lucide-react"
import { Input, type InputProps } from "./input"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends Omit<InputProps, "type"> {
  onClear?: () => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const isDirty = value !== undefined && value !== null && String(value).length > 0

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
      if (onChange && inputRef.current) {
        const event = {
          target: {
            ...inputRef.current,
            value: "",
          },
          currentTarget: {
            ...inputRef.current,
            value: "",
          },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      inputRef.current?.focus()
    }

    return (
      <div className="relative w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <Input
          type="text"
          value={value}
          onChange={onChange}
          className={cn("pl-10", isDirty && "pr-10", className)}
          ref={inputRef}
          {...props}
        />
        {isDirty && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
