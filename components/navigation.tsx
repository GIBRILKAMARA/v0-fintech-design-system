"use client"

import { Home, Send, Clock, Settings, BarChart3 } from "lucide-react"

type ScreenType = "dashboard" | "send" | "history" | "analytics" | "settings"

type NavigationProps = {
  currentScreen: ScreenType
  onNavigate: (screen: ScreenType) => void
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Home", icon: Home },
    { id: "send" as const, label: "Send", icon: Send },
    { id: "history" as const, label: "History", icon: Clock },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ]

  return (
    <nav className="border-t border-border bg-background">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                currentScreen === item.id
                  ? "text-primary border-t-2 border-primary -mt-[2px]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
