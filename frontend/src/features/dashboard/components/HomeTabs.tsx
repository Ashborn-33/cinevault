import { motion } from "framer-motion"

interface HomeTabsProps {
  activeTab: "now-watching" | "upcoming"
  onChange: (tab: "now-watching" | "upcoming") => void
}

export function HomeTabs({ activeTab, onChange }: HomeTabsProps) {
  const tabs = [
    { id: "now-watching" as const, label: "Now Watching" },
    { id: "upcoming" as const, label: "Upcoming" },
  ]

  return (
    <div className="w-full border-b border-border/40 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-6 md:gap-8 select-none min-w-max pb-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative pb-3 text-xs md:text-sm font-black tracking-wider uppercase cursor-pointer outline-none transition-colors select-none ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="activeHomeTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
