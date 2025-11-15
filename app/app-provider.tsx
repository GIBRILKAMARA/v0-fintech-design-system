"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, transferAPI, walletAPI, type User, type Transfer, type Wallet } from "@/lib/api"

type AppContextType = {
  user: User | null
  setUser: (user: User | null) => void
  transfers: Transfer[]
  addTransfer: (transfer: Transfer) => void
  refreshTransfers: () => Promise<void>
  wallets: Wallet[]
  refreshWallets: () => Promise<void>
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Check for existing session
        const currentUser = await authAPI.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }

        // Load transfers
        const loadedTransfers = await transferAPI.getTransfers()
        setTransfers(loadedTransfers)

        // Load wallets
        const loadedWallets = await walletAPI.getWallets()
        setWallets(loadedWallets)
      } catch (error) {
        console.error("Failed to load initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const refreshTransfers = async () => {
    try {
      const loadedTransfers = await transferAPI.getTransfers()
      setTransfers(loadedTransfers)
    } catch (error) {
      console.error("Failed to refresh transfers:", error)
    }
  }

  const refreshWallets = async () => {
    try {
      const loadedWallets = await walletAPI.getWallets()
      setWallets(loadedWallets)
    } catch (error) {
      console.error("Failed to refresh wallets:", error)
    }
  }

  const addTransfer = (transfer: Transfer) => {
    setTransfers([transfer, ...transfers])
  }

  const handleSetUser = async (newUser: User | null) => {
    setUser(newUser)
    if (!newUser) {
      // Logout - clear data
      await authAPI.logout()
      setTransfers([])
      setWallets([])
    } else {
      // Login - refresh data
      await refreshTransfers()
      await refreshWallets()
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        transfers,
        addTransfer,
        refreshTransfers,
        wallets,
        refreshWallets,
        isLoading,
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
