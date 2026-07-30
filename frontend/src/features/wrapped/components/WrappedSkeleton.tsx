export function WrappedSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center min-h-[400px] select-none font-sans">
      <div className="h-10 w-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted/80 rounded animate-pulse mx-auto" />
        <div className="h-3 w-48 bg-muted/50 rounded animate-pulse mx-auto" />
      </div>
    </div>
  )
}
export default WrappedSkeleton
