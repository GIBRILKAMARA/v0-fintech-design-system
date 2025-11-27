"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/app-provider"
import { LoginScreen } from "./login-screen"
import { SignupScreen } from "./signup-screen"

export function SplashScreen() {
  const [screen, setScreen] = useState<"splash" | "login" | "signup">("splash")
  const { setUser } = useApp()

  if (screen === "login") {
    return <LoginScreen onBack={() => setScreen("splash")} />
  }

  if (screen === "signup") {
    return <SignupScreen onBack={() => setScreen("splash")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo */}
        <div>
          <h1 className="text-5xl font-bold text-primary mb-2">Moneyfer</h1>
          <p className="text-muted-foreground text-lg">Global payments at local speed</p>
        </div>

        {/* Features */}
        <div className="space-y-4 text-left bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-semibold">Instant Transfers</p>
              <p className="text-sm text-muted-foreground">Send money in seconds</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">30d</span>
            <div>
              <p className="font-semibold">60+ Countries</p>
              <p className="text-sm text-muted-foreground">Available worldwide</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold">USDC Payments</p>
              <p className="text-sm text-muted-foreground">Stablecoin settlement</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <Button onClick={() => setScreen("login")} className="w-full h-12 text-base">
            Sign In
          </Button>
          <Button onClick={() => setScreen("signup")} variant="secondary" className="w-full h-12 text-base">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}
