import type { FallbackProps } from "react-error-boundary"

export function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-50">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-red-500">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-400">
          {errorMessage || "An unexpected error occurred in the application."}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
