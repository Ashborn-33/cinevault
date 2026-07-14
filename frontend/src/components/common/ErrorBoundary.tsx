import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught rendering exception:", error, errorInfo)
  }

  private handleRetry = () => {
    if (
      this.state.error?.name === "ChunkLoadError" ||
      this.state.error?.message?.includes("Failed to fetch dynamically imported module")
    ) {
      window.location.reload()
    } else {
      this.setState({ hasError: false, error: null })
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-8 border border-error/20 bg-error/5 rounded-card text-center space-y-4 font-sans text-foreground">
          <AlertTriangle className="h-10 w-10 text-error shrink-0" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold">Something went wrong</h2>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              We encountered an issue rendering this section. This might be due to a transient
              network failure or a system update.
            </p>
          </div>
          <Button
            onClick={this.handleRetry}
            size="sm"
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reload & Retry
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
