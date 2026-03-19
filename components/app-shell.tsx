"use client"

import { useState, useEffect } from "react"
import { DashboardScreen } from "./screens/dashboard-screen"
import { SendMoneyFlow } from "./screens/send-money-flow"
import { SettingsScreen } from "./screens/settings-screen"
import { TransactionHistoryScreen } from "./screens/transaction-history-screen"
import { AirtimeScreen } from "./screens/airtime-screen"
import { BillsScreen } from "./screens/bills-screen"
import { UssdMenuScreen } from "./screens/ussd-menu-screen"
import { AnalyticsScreen } from "./screens/analytics-screen"
import { Navigation } from "./navigation"

type ScreenType = 
  | "dashboard" 
  | "send" 
  | "history" 
  | "settings" 
  | "analytics"
  | "airtime" 
  | "bills" 
  | "ussd"

export function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("dashboard")

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const screen = event.detail as ScreenType
      if (screen) {
        setCurrentScreen(screen)
      }
    }

    window.addEventListener("navigate" as any, handleNavigate as EventListener)
    return () => {
      window.removeEventListener("navigate" as any, handleNavigate as EventListener)
    }
  }, [])

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen />
      case "send":
        return (
          <SendMoneyFlow
            onComplete={() => setCurrentScreen("history")}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )
      case "history":
        return <TransactionHistoryScreen />
      case "analytics":
        return <AnalyticsScreen onBack={() => setCurrentScreen("dashboard")} />
      case "settings":
        return <SettingsScreen />
      case "airtime":
        return (
          <AirtimeScreen
            onComplete={() => setCurrentScreen("history")}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )
      case "bills":
        return (
          <BillsScreen
            onComplete={() => setCurrentScreen("history")}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )
      case "ussd":
        return (
          <UssdMenuScreen
            onComplete={() => setCurrentScreen("dashboard")}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )
      default:
        return <DashboardScreen />
    }
  }

  // Determine which navigation item is active
  const getNavScreen = (): "dashboard" | "send" | "history" | "analytics" | "settings" => {
    if (["airtime", "bills", "ussd"].includes(currentScreen)) {
      return "dashboard"
    }
    if (currentScreen === "send") {
      return "send"
    }
    return currentScreen as "dashboard" | "history" | "analytics" | "settings"
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <Navigation currentScreen={getNavScreen()} onNavigate={setCurrentScreen} />
    </div>
  )
}
