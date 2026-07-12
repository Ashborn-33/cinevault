import type { FallbackProps } from "react-error-boundary"

export function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground transition-colors duration-300">
      <div className="max-w-md space-y-6">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-error">
          Something went wrong
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          {errorMessage || "An unexpected error occurred in the application."}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="rounded-button bg-surface border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
