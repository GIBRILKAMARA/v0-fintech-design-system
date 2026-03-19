"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { useApp } from "@/app/app-provider"
import { transferAPI, type Transaction, type Transfer } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Search, Send, Phone, Zap, ArrowDownCircle, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CombinedTransaction = {
  id: string
  type: "transfer" | "airtime" | "bills" | "topup"
  description: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed" | "reversed"
  createdAt: Date
  details?: Record<string, string>
}

export function TransactionHistoryScreen() {
  const { transfers, transactions, refreshTransfers } = useApp()
  const [typeFilter, setTypeFilter] = useState<"all" | "transfer" | "airtime" | "bills" | "topup">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed" | "reversed">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  // Combine transfers and transactions into a unified list
  const combinedTransactions = useMemo<CombinedTransaction[]>(() => {
    const combined: CombinedTransaction[] = []

    // Add transfers
    transfers.forEach((t: Transfer) => {
      combined.push({
        id: t.id,
        type: "transfer",
        description: `To ${t.recipient}`,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
        details: {
          recipient: t.recipient,
          fromCurrency: t.fromCurrency,
          toCurrency: t.toCurrency,
          rate: t.rate.toString(),
          country: t.country,
        },
      })
    })

    // Add other transactions
    transactions.forEach((tx: Transaction) => {
      combined.push({
        id: tx.id,
        type: tx.type as CombinedTransaction["type"],
        description: tx.description,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt),
        details: tx.metadata as Record<string, string>,
      })
    })

    // Sort by date descending
    return combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [transfers, transactions])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return combinedTransactions.filter((t) => {
      // Type filter
      if (typeFilter !== "all" && t.type !== typeFilter) return false

      // Status filter
      if (statusFilter !== "all" && t.status !== statusFilter) return false

      // Date filter
      const now = new Date()
      const txDate = t.createdAt
      if (dateFilter === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (txDate < startOfDay) return false
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (txDate < weekAgo) return false
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        if (txDate < monthAgo) return false
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          t.description.toLowerCase().includes(searchLower) ||
          t.type.toLowerCase().includes(searchLower) ||
          t.status.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [combinedTransactions, typeFilter, statusFilter, dateFilter, search])

  // Calculate stats
  const stats = useMemo(() => {
    const completed = filteredTransactions.filter((t) => t.status === "completed")
    const totalAmount = completed.reduce((sum, t) => sum + t.amount, 0)
    const successRate = filteredTransactions.length > 0 
      ? Math.round((completed.length / filteredTransactions.length) * 100)
      : 100

    return {
      totalAmount: totalAmount.toFixed(2),
      count: filteredTransactions.length,
      successRate: `${successRate}%`,
    }
  }, [filteredTransactions])

  const getTypeIcon = (type: CombinedTransaction["type"]) => {
    switch (type) {
      case "transfer":
        return <Send className="h-5 w-5" />
      case "airtime":
        return <Phone className="h-5 w-5" />
      case "bills":
        return <Zap className="h-5 w-5" />
      case "topup":
        return <ArrowDownCircle className="h-5 w-5" />
      default:
        return <Send className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: CombinedTransaction["type"]) => {
    switch (type) {
      case "transfer":
        return "bg-primary/10 text-primary"
      case "airtime":
        return "bg-secondary/10 text-secondary"
      case "bills":
        return "bg-warning/10 text-warning"
      case "topup":
        return "bg-success/10 text-success"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusVariant = (status: CombinedTransaction["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
      case "processing":
        return "secondary"
      case "reversed":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-1">All your transfers and activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="pt-3">
            <p className="text-lg font-bold">${stats.totalAmount}</p>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3">
            <p className="text-lg font-bold">{stats.count}</p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3">
            <p className="text-lg font-bold">{stats.successRate}</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search transactions..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="airtime">Airtime</SelectItem>
              <SelectItem value="bills">Bills</SelectItem>
              <SelectItem value="topup">Top-ups</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["all", "completed", "pending", "failed", "reversed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
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
      {filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            return (
              <Card key={tx.id} className="hover:shadow-sm transition-all">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.createdAt.toLocaleDateString()} at {tx.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {tx.type === "topup" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={getStatusVariant(tx.status)}
                        className="mt-1"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Transaction type badge and details */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                    <Badge variant="outline" className="text-xs">
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </Badge>
                    
                    {tx.details?.country && (
                      <span>{tx.details.country}</span>
                    )}
                    
                    {tx.details?.rate && (
                      <span className="ml-auto">@{tx.details.rate}</span>
                    )}

                    {/* Reverse button for pending transfers */}
                    {tx.type === "transfer" && (tx.status === "pending" || tx.status === "processing") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-xs text-primary hover:text-primary/80 px-2 h-auto"
                        onClick={async () => {
                          try {
                            await transferAPI.reverseTransfer(tx.id)
                            await refreshTransfers()
                            toast({
                              title: "Transfer reversed",
                              description: "The transaction has been successfully reversed.",
                              variant: "success",
                            })
                          } catch (error) {
                            toast({
                              title: "Unable to reverse transfer",
                              description: error instanceof Error ? error.message : "Please try again.",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        Reverse
                      </Button>
                    )}
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
            <p className="text-sm">Try adjusting your filters or start making transactions</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
