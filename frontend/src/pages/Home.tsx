export function Home() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center bg-background text-foreground transition-colors duration-300">
      <div className="max-w-2xl space-y-4">
        <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text font-heading text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl lg:text-8xl">
          CineVault
        </h1>
        <p className="mx-auto max-w-xl font-sans text-lg font-medium tracking-normal text-muted-foreground sm:text-xl lg:text-2xl">
          Premium Entertainment Tracking Platform
        </p>
      </div>
    </div>
  )
}
