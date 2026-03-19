"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/app-provider"
import { Send, Phone, Zap, Hash, Plus, Lock, ArrowRight } from "lucide-react"
import { PinModal } from "@/components/pin-modal"
import { useState } from "react"

export function DashboardScreen() {
  const { user, transfers, wallets, transactions, isPinSet } = useApp()
  const [showSetPinModal, setShowSetPinModal] = useState(false)

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.value, 0)
  const totalSent = transfers
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  // Combine transfers and transactions for recent activity
  const allTransactions = [
    ...transfers.map((t) => ({
      id: t.id,
      type: "transfer" as const,
      description: `To ${t.recipient}`,
      amount: t.amount,
      status: t.status,
      createdAt: t.createdAt,
    })),
    ...transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt,
    })),
  ].sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  const recentCountries = Array.from(new Set(transfers.map((t) => t.country))).slice(0, 5)

  const quickActions = [
    { id: "send", label: "Send", icon: Send, color: "bg-primary/10 text-primary" },
    { id: "airtime", label: "Airtime", icon: Phone, color: "bg-secondary/10 text-secondary" },
    { id: "bills", label: "Bills", icon: Zap, color: "bg-warning/10 text-warning" },
    { id: "ussd", label: "USSD", icon: Hash, color: "bg-info/10 text-info" },
  ]

  const handleQuickAction = (actionId: string) => {
    const event = new CustomEvent("navigate", { detail: actionId })
    window.dispatchEvent(event)
  }

  const stats = [
    { label: "Total Sent", value: `$${totalSent.toFixed(2)}` },
    { label: "Transfers", value: transfers.length.toString() },
    { label: "Countries", value: new Set(transfers.map((t) => t.country)).size.toString() || "0" },
    { label: "Success", value: transfers.length > 0 ? `${Math.round((transfers.filter((t) => t.status === "completed").length / transfers.length) * 100)}%` : "100%" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-bold capitalize">{user?.name}</h1>
        </div>
        {!isPinSet && (
          <Button variant="outline" size="sm" onClick={() => setShowSetPinModal(true)}>
            <Lock className="h-4 w-4 mr-2" />
            Set PIN
          </Button>
        )}
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Total Balance</span>
            <Badge>USDC</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-muted-foreground mt-2">Across all wallets</p>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-background/80 hover:bg-background transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Frequent Countries */}
      {recentCountries.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">Quick Send</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleQuickAction("send")}
                  className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-2"
                >
                  <span>{country}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Assets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Wallet Assets</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary">
            <Plus className="h-3 w-3 mr-1" />
            Top Up
          </Button>
        </div>
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

      {/* Activity Stats */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Activity</h3>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-3 pb-3">
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Activity</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary"
            onClick={() => handleQuickAction("history")}
          >
            View All
          </Button>
        </div>
        {allTransactions.length > 0 ? (
          <div className="space-y-2">
            {allTransactions.slice(0, 4).map((tx) => {
              const createdAt = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt)
              return (
                <Card key={tx.id} className="hover:shadow-sm transition-all">
                  <CardContent className="pt-3 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === "transfer" ? "bg-primary/10 text-primary" :
                        tx.type === "airtime" ? "bg-secondary/10 text-secondary" :
                        tx.type === "bills" ? "bg-warning/10 text-warning" :
                        "bg-success/10 text-success"
                      }`}>
                        {tx.type === "transfer" && <Send className="h-4 w-4" />}
                        {tx.type === "airtime" && <Phone className="h-4 w-4" />}
                        {tx.type === "bills" && <Zap className="h-4 w-4" />}
                        {tx.type === "topup" && <Plus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {tx.type === "topup" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </p>
                      <Badge 
                        variant={tx.status === "completed" ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No activity yet</p>
              <p className="text-xs mt-1">Start sending money to see activity</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Set PIN Modal */}
      <PinModal
        open={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        onSuccess={() => setShowSetPinModal(false)}
        mode="set"
        title="Secure Your Account"
        description="Set a 4-digit PIN to protect your transactions"
      />
    </div>
  )
}
