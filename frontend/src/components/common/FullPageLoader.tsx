import { LoadingSpinner } from "@/components/ui/loading"

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground font-sans">
      <div className="flex flex-col items-center gap-4">
        <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text font-heading text-4xl font-black tracking-tight text-transparent animate-pulse select-none">
          CineVault
        </h1>
        <LoadingSpinner size="lg" />
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider animate-pulse">
          Loading features...
        </p>
      </div>
    </div>
  )
}
export default FullPageLoader
