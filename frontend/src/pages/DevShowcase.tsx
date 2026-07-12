import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Mail, ArrowRight, Settings } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PasswordInput } from "@/components/ui/password-input"
import { SearchInput } from "@/components/ui/search-input"
import { FormField, FieldError } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { MediaCard, type MediaItem } from "@/components/ui/media-card"
import { Badge, StatusBadge, GenreBadge, RatingBadge } from "@/components/ui/badge"
import { SkeletonText, SkeletonAvatar, SkeletonMediaCard } from "@/components/ui/skeleton"
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading"

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().max(160, "Bio must not exceed 160 characters").optional(),
})

type FormData = z.infer<typeof schema>

const SECTIONS = [
  { id: "foundation", label: "Foundation Tokens" },
  { id: "buttons", label: "Buttons & Actions" },
  { id: "forms", label: "Forms & Fields" },
  { id: "cards", label: "Base Cards" },
  { id: "media-cards", label: "Media Cards" },
  { id: "badges", label: "Badge Primitives" },
  { id: "loading", label: "Loading System" },
]

const mockMediaItems: MediaItem[] = [
  {
    id: "1",
    title: "Interstellar",
    type: "movie",
    posterUrl:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    releaseYear: 2014,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    runtime: 169,
    averageRating: 8.6,
    userRating: 10,
    status: "completed",
    isFavorite: true,
  },
  {
    id: "2",
    title: "Demon Slayer: Kimetsu no Yaiba",
    type: "anime",
    posterUrl:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    releaseYear: 2019,
    genres: ["Action", "Fantasy", "Adventure"],
    runtime: 24,
    averageRating: 8.7,
    status: "watching",
    isTrending: true,
    progress: {
      current: 12,
      total: 26,
      type: "episodes",
    },
  },
  {
    id: "3",
    title: "Breaking Bad",
    type: "tv",
    posterUrl:
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
    releaseYear: 2008,
    genres: ["Crime", "Drama", "Thriller"],
    runtime: 49,
    averageRating: 9.5,
    userRating: 9,
    status: "completed",
    progress: {
      current: 5,
      total: 5,
      type: "seasons",
    },
  },
]

export function DevShowcase() {
  const [searchVal, setSearchVal] = useState("")
  const [btnLoading, setBtnLoading] = useState(false)
  const [submittedData, setSubmittedData] = useState<FormData | null>(null)
  const [removableBadges, setRemovableBadges] = useState([
    "Sci-Fi",
    "Drama",
    "Adventure",
    "Thriller",
  ])
  const [overlayActive, setOverlayActive] = useState(false)

  const handleRemoveBadge = (badgeToRemove: string) => {
    setRemovableBadges((prev) => prev.filter((b) => b !== badgeToRemove))
  }

  const triggerOverlay = () => {
    setOverlayActive(true)
    setTimeout(() => setOverlayActive(false), 3000)
  }

  const onSubmit = (data: FormData) => {
    setSubmittedData(data)
    setTimeout(() => setSubmittedData(null), 5000)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      bio: "",
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 flex gap-8">
      {/* Sticky Left Navigation */}
      <aside className="hidden md:block w-56 shrink-0 sticky top-24 h-[calc(100vh-10rem)] overflow-y-auto border-r border-border pr-6 space-y-4">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Sections
        </h3>
        <nav className="flex flex-col gap-1 text-sm font-semibold text-muted-foreground">
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="py-1.5 hover:text-primary transition-colors focus-visible:text-primary"
            >
              {sec.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Showcase Panel */}
      <div className="flex-1 space-y-20 overflow-y-auto scroll-smooth pb-24">
        <header className="space-y-2 border-b border-border pb-6">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">
            CineVault Developer Showcase
          </h1>
          <p className="text-sm text-muted-foreground">
            A comprehensive sandbox and documentation board of CineVault Product Design System
            primitives.
          </p>
        </header>

        {/* 1. Foundation */}
        <section id="foundation" className="scroll-mt-24 space-y-8">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">1. Foundation Tokens</h2>
            <p className="text-xs text-muted-foreground">
              Core variables representing color systems, typography sizing, and borders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Color Swatches */}
            <Card>
              <CardHeader>
                <CardTitle>Color Palettes</CardTitle>
                <CardDescription>Primary, accents, and semantic variables</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="h-12 w-full rounded bg-primary" />
                  <span className="text-[10px] font-bold block">Primary (Violet)</span>
                </div>
                <div className="space-y-1">
                  <div className="h-12 w-full rounded bg-accent" />
                  <span className="text-[10px] font-bold block">Accent (Rose)</span>
                </div>
                <div className="space-y-1">
                  <div className="h-12 w-full rounded bg-secondary" />
                  <span className="text-[10px] font-bold block">Secondary (Slate)</span>
                </div>
                <div className="space-y-1">
                  <div className="h-12 w-full rounded bg-surface border border-border" />
                  <span className="text-[10px] font-bold block">Surface</span>
                </div>
                <div className="space-y-1">
                  <div className="h-12 w-full rounded bg-success" />
                  <span className="text-[10px] font-bold block">Success</span>
                </div>
                <div className="space-y-1">
                  <div className="h-12 w-full rounded bg-error" />
                  <span className="text-[10px] font-bold block">Error</span>
                </div>
              </CardContent>
            </Card>

            {/* Typography scale */}
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>Outfit heading & Inter body stacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    Display
                  </span>
                  <p className="font-heading text-3xl font-extrabold tracking-tight">
                    Display Text
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    Heading 1
                  </span>
                  <p className="font-heading text-xl font-bold tracking-tight">Heading 1 Title</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    Body Standard
                  </span>
                  <p className="font-sans text-sm font-medium">
                    This is a paragraph of standard body font text.
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    Monospace
                  </span>
                  <p className="font-mono text-xs">JetBrains Mono rating score: 9.3</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. Buttons */}
        <section id="buttons" className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">2. Buttons & Actions</h2>
            <p className="text-xs text-muted-foreground">
              Standardized action trigger system using semantic token definitions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Button Matrix</CardTitle>
              <CardDescription>Available variants, sizes, and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Variants:
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sizes:
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">XS size</Button>
                  <Button size="sm">SM size</Button>
                  <Button size="md">MD size</Button>
                  <Button size="lg">LG size</Button>
                  <Button size="xl">XL size</Button>
                  <Button size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  States & Layouts:
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Disabled Button</Button>
                  <Button loading>Loading...</Button>
                  <Button variant="outline" size="icon" loading>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button leftIcon={<Mail className="h-4 w-4" />}>Left Icon</Button>
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Right Icon</Button>
                  <Button
                    loading={btnLoading}
                    onClick={() => {
                      setBtnLoading(true)
                      setTimeout(() => setBtnLoading(false), 2000)
                    }}
                  >
                    Interactive Action Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Forms */}
        <section id="forms" className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">3. Forms & Fields</h2>
            <p className="text-xs text-muted-foreground">
              Unified input, description, and error validation components.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Field Configuration Primitives</CardTitle>
                <CardDescription>Input variants and semantic feedback states</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField>
                    <Label>Default Input</Label>
                    <Input placeholder="Default border input..." />
                  </FormField>
                  <FormField>
                    <Label>Filled Input</Label>
                    <Input variant="filled" placeholder="Filled input..." />
                  </FormField>
                  <FormField>
                    <Label>Ghost Input</Label>
                    <Input variant="ghost" placeholder="Minimal borderless..." />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <FormField>
                    <Label>Success State</Label>
                    <Input success placeholder="Valid input value" />
                  </FormField>
                  <FormField>
                    <Label>Error State</Label>
                    <Input error placeholder="Invalid input value" />
                    <FieldError>Please enter a correct value.</FieldError>
                  </FormField>
                  <FormField>
                    <Label>Password Input</Label>
                    <PasswordInput placeholder="Secure password toggle..." />
                  </FormField>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <FormField>
                    <Label>Search Input</Label>
                    <SearchInput
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      onClear={() => setSearchVal("")}
                      placeholder="Type query to trigger clearing X..."
                    />
                  </FormField>
                  <FormField>
                    <Label>Textarea</Label>
                    <Textarea placeholder="Write a short summary..." />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Sandbox</CardTitle>
                <CardDescription>Interactive react-hook-form + zod resolver</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <FormField>
                    <Label htmlFor="username" required>
                      Username
                    </Label>
                    <Input
                      id="username"
                      error={!!errors.username}
                      placeholder="cinephile_99"
                      {...register("username")}
                    />
                    <FieldError>{errors.username?.message}</FieldError>
                  </FormField>

                  <FormField>
                    <Label htmlFor="password" required>
                      Password
                    </Label>
                    <PasswordInput
                      id="password"
                      error={!!errors.password}
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    <FieldError>{errors.password?.message}</FieldError>
                  </FormField>

                  <FormField>
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      error={!!errors.bio}
                      placeholder="I love movies..."
                      {...register("bio")}
                    />
                    <FieldError>{errors.bio?.message}</FieldError>
                  </FormField>

                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </form>

                {submittedData && (
                  <div className="rounded-button border border-success/35 bg-success/10 p-4 mt-4 text-xs text-success animate-in fade-in">
                    <p className="font-bold">Validated successfully!</p>
                    <pre className="mt-1 overflow-x-auto">
                      {JSON.stringify(submittedData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Cards */}
        <section id="cards" className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">4. Base Cards</h2>
            <p className="text-xs text-muted-foreground">
              General-purpose containers styled with layout spacing tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default</CardTitle>
                <CardDescription>Flat surface, border outline</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Standard box layout container.</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated</CardTitle>
                <CardDescription>Soft background, shadow level 1</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Suggests depth hierarchy.</p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined</CardTitle>
                <CardDescription>Uses canvas bg, border outline</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Lightweight structural divider.</p>
              </CardContent>
            </Card>

            <Card variant="glass" hoverable>
              <CardHeader>
                <CardTitle>Glass (Hoverable)</CardTitle>
                <CardDescription>Frosted blur, interactive scale</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Premium scale transition.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Media Cards */}
        <section id="media-cards" className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">5. Media Cards</h2>
            <p className="text-xs text-muted-foreground">
              Signature vertical 2:3 layout featuring gradient covers, rating metrics, progress
              indicators, and fallback states.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {mockMediaItems.map((item) => (
              <MediaCard key={item.id} item={item} onClick={() => {}} />
            ))}
          </div>
        </section>

        {/* 6. Badges */}
        <section id="badges" className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">6. Badge System</h2>
            <p className="text-xs text-muted-foreground">
              Visual categorization markers and scoring tags.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Badge Varieties</CardTitle>
              <CardDescription>
                Styling variants, status pills, databases, and removable tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Styling Variants:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status Badges:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="watching" />
                  <StatusBadge status="completed" />
                  <StatusBadge status="planning" />
                  <StatusBadge status="on_hold" />
                  <StatusBadge status="dropped" />
                  <StatusBadge status="favorite" />
                  <StatusBadge status="trending" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Rating Authorities:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <RatingBadge provider="imdb" rating="8.6" />
                  <RatingBadge provider="tmdb" rating="84%" />
                  <RatingBadge provider="mal" rating="9.12" />
                  <RatingBadge provider="user" rating="10" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Genres & Filtering:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <GenreBadge genre="Sci-Fi" />
                  <GenreBadge genre="Adventure" />
                  <GenreBadge genre="Drama" />
                  <span>|</span>
                  {removableBadges.map((genre) => (
                    <Badge
                      key={genre}
                      variant="primary"
                      onRemove={() => handleRemoveBadge(genre)}
                      removeLabel={`Remove ${genre}`}
                    >
                      {genre}
                    </Badge>
                  ))}
                  {removableBadges.length === 0 && (
                    <Button
                      size="xs"
                      onClick={() =>
                        setRemovableBadges(["Sci-Fi", "Drama", "Adventure", "Thriller"])
                      }
                    >
                      Reset Removable List
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. Loading */}
        <section id="loading" className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight">7. Loading System</h2>
            <p className="text-xs text-muted-foreground">
              Pulses, spin animations, overlays, and shift-free skeletons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Elements</CardTitle>
                <CardDescription>Text paragraphs and avatars</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <SkeletonAvatar size="md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-skeleton w-3/4 rounded" />
                    <div className="h-3 bg-skeleton w-1/2 rounded" />
                  </div>
                </div>
                <SkeletonText lines={4} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spinners & Overlays</CardTitle>
                <CardDescription>Activity overlays with frosted backdrops</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative overflow-hidden min-h-[140px] flex flex-col justify-between">
                <LoadingOverlay visible={overlayActive} message="Updating collection database..." />
                <div className="flex items-center gap-4">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                </div>
                <Button size="sm" onClick={triggerOverlay}>
                  Trigger Overlay (3s)
                </Button>
              </CardContent>
            </Card>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">
                Skeleton Media Card:
              </span>
              <SkeletonMediaCard />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
