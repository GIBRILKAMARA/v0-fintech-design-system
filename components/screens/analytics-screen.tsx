"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useApp } from "@/app/app-provider"
import type { Transaction, Transfer } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, Send, Phone, Zap, ArrowDownCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type AnalyticsScreenProps = {
  onBack: () => void
}

type CategoryData = {
  name: string
  value: number
  color: string
  icon: React.ReactNode
}

// Computed colors (not CSS variables) for Recharts
const COLORS = {
  transfer: "#6366f1", // indigo-500
  airtime: "#10b981", // emerald-500
  bills: "#f59e0b", // amber-500
  topup: "#22c55e", // green-500
}

export function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const { transfers, transactions, wallets } = useApp()

  // Combine all transactions for analysis
  const allTransactions = useMemo(() => {
    const combined: Array<{
      type: string
      amount: number
      createdAt: Date
      status: string
    }> = []

    transfers.forEach((t: Transfer) => {
      combined.push({
        type: "transfer",
        amount: t.amount,
        createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
        status: t.status,
      })
    })

    transactions.forEach((tx: Transaction) => {
      combined.push({
        type: tx.type,
        amount: tx.amount,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt),
        status: tx.status,
      })
    })

    return combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [transfers, transactions])

  // Calculate spending by category
  const categoryData = useMemo<CategoryData[]>(() => {
    const categories: Record<string, number> = {
      transfer: 0,
      airtime: 0,
      bills: 0,
      topup: 0,
    }

    allTransactions
      .filter((t) => t.status === "completed")
      .forEach((t) => {
        if (categories[t.type] !== undefined) {
          categories[t.type] += t.amount
        }
      })

    return [
      { name: "Transfers", value: categories.transfer, color: COLORS.transfer, icon: <Send className="h-4 w-4" /> },
      { name: "Airtime", value: categories.airtime, color: COLORS.airtime, icon: <Phone className="h-4 w-4" /> },
      { name: "Bills", value: categories.bills, color: COLORS.bills, icon: <Zap className="h-4 w-4" /> },
      { name: "Top-ups", value: categories.topup, color: COLORS.topup, icon: <ArrowDownCircle className="h-4 w-4" /> },
    ].filter((c) => c.value > 0)
  }, [allTransactions])

  // Calculate monthly spending trend
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString("en-US", { month: "short" })
      months[key] = 0
    }

    allTransactions
      .filter((t) => t.status === "completed" && t.type !== "topup")
      .forEach((t) => {
        const key = t.createdAt.toLocaleDateString("en-US", { month: "short" })
        if (months[key] !== undefined) {
          months[key] += t.amount
        }
      })

    return Object.entries(months).map(([month, amount]) => ({
      month,
      amount,
    }))
  }, [allTransactions])

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = allTransactions.filter((t) => t.status === "completed" && t.type !== "topup")
    const totalSpent = completed.reduce((sum, t) => sum + t.amount, 0)
    const avgTransaction = completed.length > 0 ? totalSpent / completed.length : 0

    // This month's spending
    const now = new Date()
    const thisMonth = completed.filter(
      (t) =>
        t.createdAt.getMonth() === now.getMonth() &&
        t.createdAt.getFullYear() === now.getFullYear()
    )
    const thisMonthSpent = thisMonth.reduce((sum, t) => sum + t.amount, 0)

    // Last month's spending
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = completed.filter(
      (t) =>
        t.createdAt.getMonth() === lastMonthDate.getMonth() &&
        t.createdAt.getFullYear() === lastMonthDate.getFullYear()
    )
    const lastMonthSpent = lastMonth.reduce((sum, t) => sum + t.amount, 0)

    const monthlyChange = lastMonthSpent > 0 
      ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100 
      : 0

    return {
      totalSpent,
      avgTransaction,
      thisMonthSpent,
      monthlyChange,
      transactionCount: completed.length,
    }
  }, [allTransactions])

  const totalBalance = wallets.reduce((sum, w) => sum + w.value, 0)

  // Chart configurations
  const barChartConfig = {
    amount: {
      label: "Amount",
      color: COLORS.transfer,
    },
  }

  const pieChartConfig = categoryData.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = {
      label: item.name,
      color: item.color,
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Your spending insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">${stats.thisMonthSpent.toFixed(2)}</p>
            {stats.monthlyChange !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${stats.monthlyChange > 0 ? "text-destructive" : "text-success"}`}>
                {stats.monthlyChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(stats.monthlyChange).toFixed(1)}% vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Avg Transaction</p>
            <p className="text-2xl font-bold">${stats.avgTransaction.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Spending by Category</CardTitle>
          <CardDescription>Where your money goes</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <>
              <ChartContainer config={pieChartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Category Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{category.name}</p>
                      <p className="text-xs text-muted-foreground">${category.value.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transaction data yet</p>
              <p className="text-sm">Start making transactions to see analytics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Spending Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Spending</CardTitle>
          <CardDescription>Last 6 months trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="amount"
                  fill={COLORS.transfer}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Total Transactions</span>
            <span className="font-semibold">{stats.transactionCount}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Most Used Service</span>
            <span className="font-semibold">
              {categoryData.length > 0
                ? categoryData.reduce((a, b) => (a.value > b.value ? a : b)).name
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Largest Transaction</span>
            <span className="font-semibold">
              ${allTransactions.length > 0
                ? Math.max(...allTransactions.map((t) => t.amount)).toFixed(2)
                : "0.00"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
