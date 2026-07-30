import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WrappedData } from "../types/wrapped"

interface ShareCardProps {
  data: WrappedData
}

export function ShareCard({ data }: ShareCardProps) {
  // Download PNG: Renders stats poster on canvas and downloads image
  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 600
    canvas.height = 900
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw Linear Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 0, 900)
    grad.addColorStop(0, "#1e1b4b") // deep violet
    grad.addColorStop(1, "#09090b") // slate dark
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 600, 900)

    // Accent header lines
    ctx.fillStyle = "#a78bfa"
    ctx.font = "900 16px sans-serif"
    ctx.fillText("CINEVAULT WRAPPED", 50, 70)

    ctx.fillStyle = "#ffffff"
    ctx.font = "900 48px sans-serif"
    ctx.fillText(data.yearLabel, 50, 130)

    // Stats Grid
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 20px sans-serif"
    ctx.fillText(`Movies Logged:  ${data.moviesCount}`, 50, 220)
    ctx.fillText(`Episodes Watched:  ${data.episodesCount}`, 50, 275)
    ctx.fillText(`Total Hours:  ${data.hoursCount} hrs`, 50, 330)

    // Genres section
    ctx.fillStyle = "#a78bfa"
    ctx.font = "900 18px sans-serif"
    ctx.fillText("FAVORITE GENRES", 50, 410)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 18px sans-serif"
    data.genres.slice(0, 3).forEach((g, idx) => {
      ctx.fillText(`${idx + 1}. ${g.name} (${g.percentage}%)`, 70, 455 + idx * 45)
    })

    // Profile highlights
    ctx.fillStyle = "#a78bfa"
    ctx.font = "900 18px sans-serif"
    ctx.fillText("VIEWER IDENTITY", 50, 620)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`Longest Watch Streak:  ${data.longestStreak} days`, 50, 665)
    ctx.fillText(`Viewer Level Achieved:  Level ${data.levelReached}`, 50, 715)

    // Footer signature
    ctx.fillStyle = "#71717a"
    ctx.font = "bold 13px sans-serif"
    ctx.fillText("Celebrate your viewing journey at cinevault.app", 50, 830)

    // Trigger download link
    const link = document.createElement("a")
    link.download = `cinevault-wrapped-${data.yearLabel}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  // Print Wrapped Summary
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto select-none font-sans text-center">
      {/* Decorative Poster card box */}
      <div className="border border-white/20 bg-gradient-to-b from-indigo-950/40 to-zinc-950 p-6 rounded-card shadow-level-3 space-y-4 text-left">
        <div className="space-y-1">
          <span className="text-[10px] text-primary font-black uppercase tracking-wider">
            CineVault Wrapped
          </span>
          <h4 className="text-xl font-black">{data.yearLabel} Journey</h4>
        </div>

        <div className="space-y-2 text-xs font-bold text-muted-foreground">
          <p>
            Movies completed: <span className="text-white">{data.moviesCount}</span>
          </p>
          <p>
            Episodes watched: <span className="text-white">{data.episodesCount}</span>
          </p>
          <p>
            Hours watched: <span className="text-white">{data.hoursCount} hrs</span>
          </p>
          <p>
            Watch streak: <span className="text-white">{data.longestStreak} days</span>
          </p>
          <p>
            Level achieved: <span className="text-white">Lvl {data.levelReached}</span>
          </p>
        </div>
      </div>

      {/* Button deck */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleDownloadPNG}
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm justify-center"
        >
          <Download className="h-4 w-4" />
          Export PNG
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm justify-center"
        >
          <Printer className="h-4 w-4" />
          Print PDF
        </Button>
      </div>
    </div>
  )
}
export default ShareCard
