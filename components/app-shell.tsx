"use client"

import { useState } from "react"
import { DashboardScreen } from "./screens/dashboard-screen"
import { SendMoneyFlow } from "./screens/send-money-flow"
import { SettingsScreen } from "./screens/settings-screen"
import { TransactionHistoryScreen } from "./screens/transaction-history-screen"
import { Navigation } from "./navigation"

export function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "send" | "history" | "settings">("dashboard")

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentScreen === "dashboard" && <DashboardScreen />}
        {currentScreen === "send" && <SendMoneyFlow onComplete={() => setCurrentScreen("history")} />}
        {currentScreen === "history" && <TransactionHistoryScreen />}
        {currentScreen === "settings" && <SettingsScreen />}
      </div>

      {/* Bottom Navigation */}
      <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </div>
  )
}
