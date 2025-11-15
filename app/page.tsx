"use client"

import { AppProvider } from "./app-provider"
import { AppShell } from "@/components/app-shell"
import { SplashScreen } from "@/components/screens/splash-screen"
import { useApp } from "./app-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

function AppContent() {
  const { user, isLoading } = useApp()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-8 w-8 mx-auto" />
          <p className="text-muted-foreground">Loading FlowPay...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <SplashScreen />
  }

  return <AppShell />
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
