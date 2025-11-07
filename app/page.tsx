"use client"

import { AppProvider } from "./app-provider"
import { AppShell } from "@/components/app-shell"
import { SplashScreen } from "@/components/screens/splash-screen"
import { useApp } from "./app-provider"

function AppContent() {
  const { user } = useApp()

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
