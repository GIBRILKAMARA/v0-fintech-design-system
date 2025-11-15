"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/app-provider"

export function DashboardScreen() {
  const { user, transfers, wallets } = useApp()

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.value, 0)
  const totalSent = transfers
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const stats = [
    { label: "Total Sent", value: `$${totalSent.toFixed(2)}`, icon: "✈️" },
    { label: "Transfers", value: transfers.length.toString(), icon: "📊" },
    { label: "Countries", value: new Set(transfers.map((t) => t.country)).size.toString() || "0", icon: "🌍" },
    { label: "Success Rate", value: transfers.length > 0 ? `${Math.round((transfers.filter((t) => t.status === "completed").length / transfers.length) * 100)}%` : "100%", icon: "⚡" },
  ]

  const recentCountries = Array.from(new Set(transfers.map((t) => t.country))).slice(0, 5)

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-3xl font-bold capitalize">{user?.name}</h1>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="mb-4">
            <p className="text-muted-foreground text-sm">Send to</p>
            <p className="text-2xl font-bold">Frequently Used</p>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {recentCountries.length > 0 ? (
              recentCountries.map((country) => (
                <button
                  key={country}
                  className="px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {country}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent countries</p>
            )}
          </div>
          <Button
            onClick={() => {
              // This will be handled by the navigation
              const event = new CustomEvent("navigate", { detail: "send" })
              window.dispatchEvent(event)
            }}
            className="w-full"
          >
            Send Money
          </Button>
        </CardContent>
      </Card>

      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Total Balance</span>
            <Badge>USDC</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-muted-foreground mt-2">Across all wallets</p>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Sent (All Time)</p>
            <p className="text-lg font-semibold">${totalSent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold mb-3 text-sm">Wallet Assets</h3>
        <div className="space-y-2">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                      {wallet.symbol[0]}
                    </div>
                    <div>
                      <p className="font-medium">{wallet.symbol}</p>
                      <p className="text-xs text-muted-foreground">{wallet.network}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${wallet.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground">{wallet.amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No wallets yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-sm">Activity</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4">
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transfers */}
      <div>
        <h3 className="font-semibold mb-3">Recent Transfers</h3>
        {transfers.length > 0 ? (
          <div className="space-y-2">
            {transfers.slice(0, 3).map((transfer) => (
              <Card key={transfer.id} className="hover:shadow-sm transition-all">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transfer.recipient}</p>
                    <p className="text-sm text-muted-foreground">
                      {transfer.fromCurrency} → {transfer.toCurrency} @ {transfer.rate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${transfer.amount}</p>
                    <Badge variant={transfer.status === "completed" ? "default" : "secondary"} className="mt-1">
                      {transfer.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No transfers yet</p>
              <p className="text-xs mt-1">Start sending money to see activity</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
