"use client"

type NavigationProps = {
  currentScreen: "dashboard" | "send" | "history" | "settings"
  onNavigate: (screen: "dashboard" | "send" | "history" | "settings") => void
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "send", label: "Send", icon: "✈️" },
    { id: "history", label: "History", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ] as const

  return (
    <nav className="border-t border-border bg-background">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${
              currentScreen === item.id
                ? "text-primary border-t-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
