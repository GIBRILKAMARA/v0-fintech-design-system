"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useApp } from "@/app/app-provider"
import { useTheme } from "next-themes"

export function SettingsScreen() {
  const { user, setUser } = useApp()
  const { theme, setTheme } = useTheme()
  const [showWallets, setShowWallets] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)

  const connectedWallets = [
    { name: "Phantom", address: "0x742d...4c2a", connected: true },
    { name: "Coinbase Wallet", address: "0x123d...5e4b", connected: true },
  ]

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">👤</div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.kycVerified && <Badge className="mt-1">KYC Verified</Badge>}
            </div>
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle
            className="text-base cursor-pointer flex items-center justify-between"
            onClick={() => setShowWallets(!showWallets)}
          >
            Connected Wallets
            <span className="text-muted-foreground">{showWallets ? "▲" : "▼"}</span>
          </CardTitle>
        </CardHeader>
        {showWallets && (
          <CardContent className="space-y-3">
            {connectedWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div>
                  <p className="font-medium">{wallet.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{wallet.address}</p>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3 bg-transparent">
              Connect New Wallet
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 p-2 cursor-pointer">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
              className="rounded w-4 h-4"
            />
            <span className="text-sm">Dark Mode</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle
            className="text-base cursor-pointer flex items-center justify-between"
            onClick={() => setShowSecurity(!showSecurity)}
          >
            Security
            <span className="text-muted-foreground">{showSecurity ? "▲" : "▼"}</span>
          </CardTitle>
        </CardHeader>
        {showSecurity && (
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              🔐 Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              📱 Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              🔑 Backup Seed Phrase
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              🛡️ Security & Privacy
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
            <span className="text-sm">Transfer notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
            <span className="text-sm">Security alerts</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded w-4 h-4" />
            <span className="text-sm">Marketing emails</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
            <span className="text-sm">Rate change notifications</span>
          </label>
        </CardContent>
      </Card>

      {/* About & Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start text-foreground">
            Terms of Service
          </Button>
          <Button variant="ghost" className="w-full justify-start text-foreground">
            Privacy Policy
          </Button>
          <Button variant="ghost" className="w-full justify-start text-foreground">
            Help & Support
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">FlowPay v1.0.0 • © 2025</p>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="destructive" className="w-full" onClick={() => setUser(null)}>
        Sign Out
      </Button>
    </div>
  )
}
