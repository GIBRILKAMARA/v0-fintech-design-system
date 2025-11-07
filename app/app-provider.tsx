"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

type User = {
  id: string
  email: string
  name: string
  kycVerified: boolean
  walletAddress?: string
}

type Transfer = {
  id: string
  recipient: string
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: Date
}

type AppContextType = {
  user: User | null
  setUser: (user: User | null) => void
  transfers: Transfer[]
  addTransfer: (transfer: Transfer) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)

  const addTransfer = (transfer: Transfer) => {
    setTransfers([transfer, ...transfers])
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        transfers,
        addTransfer,
        isDarkMode,
        setIsDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
