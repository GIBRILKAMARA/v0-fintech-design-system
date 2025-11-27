"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useApp } from "@/app/app-provider"

export function TransactionHistoryScreen() {
  const { transfers } = useApp()
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all")
  const [search, setSearch] = useState("")

  const filteredTransfers = transfers.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter
    const matchesSearch = t.recipient.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = [
    { label: "Total Sent", value: `$${transfers.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}` },
    { label: "Transactions", value: transfers.length.toString() },
    { label: "Success Rate", value: "100%" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-1">All your transfers and activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-3">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <Input placeholder="Search recipient..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["all", "completed", "pending", "failed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      {filteredTransfers.length > 0 ? (
        <div className="space-y-2">
          {filteredTransfers.map((transfer) => {
            const createdAt = transfer.createdAt instanceof Date ? transfer.createdAt : new Date(transfer.createdAt)
            return (
            <Card key={transfer.id} className="hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {transfer.status === "completed" ? "✓" : transfer.status === "pending" ? "⏳" : "✕"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{transfer.recipient}</p>
                    <p className="text-xs text-muted-foreground">
                      {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${transfer.amount}</p>
                    <Badge
                      variant={
                        transfer.status === "completed"
                          ? "default"
                          : transfer.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="mt-1"
                    >
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                  <span>{transfer.fromCurrency}</span>
                  <span>→</span>
                  <span>{transfer.toCurrency}</span>
                  <span className="ml-auto">@{transfer.rate}</span>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground space-y-2">
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
