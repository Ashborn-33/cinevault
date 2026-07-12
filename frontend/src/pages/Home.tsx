export function Home() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4">
        <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          CineVault
        </h1>
        <p className="mx-auto max-w-xl text-lg font-medium text-zinc-400 sm:text-xl">
          Premium Entertainment Tracking Platform
        </p>
      </div>
    </div>
  )
}
