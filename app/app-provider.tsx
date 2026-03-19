"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, transferAPI, walletAPI, pinAPI, transactionAPI, type User, type Transfer, type Wallet, type Transaction } from "@/lib/api"

type AppContextType = {
  user: User | null
  setUser: (user: User | null) => void
  transfers: Transfer[]
  addTransfer: (transfer: Transfer) => void
  refreshTransfers: () => Promise<void>
  wallets: Wallet[]
  refreshWallets: () => Promise<void>
  updateWalletBalance: (walletId: string, newAmount: number) => Promise<void>
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  refreshTransactions: () => Promise<void>
  isPinSet: boolean
  isPinVerified: boolean
  setIsPinVerified: (verified: boolean) => void
  verifyPin: (pin: string) => Promise<boolean>
  setPin: (pin: string) => Promise<void>
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isPinSet, setIsPinSet] = useState(false)
  const [isPinVerified, setIsPinVerified] = useState(false)
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

        // Load transactions
        const loadedTransactions = await transactionAPI.getTransactions()
        setTransactions(loadedTransactions)

        // Check if PIN is set
        const pinSet = await pinAPI.isPinSet()
        setIsPinSet(pinSet)
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

  const updateWalletBalance = async (walletId: string, newAmount: number) => {
    try {
      await walletAPI.updateWallet(walletId, newAmount)
      await refreshWallets()
    } catch (error) {
      console.error("Failed to update wallet balance:", error)
      throw error
    }
  }

  const refreshTransactions = async () => {
    try {
      const loadedTransactions = await transactionAPI.getTransactions()
      setTransactions(loadedTransactions)
    } catch (error) {
      console.error("Failed to refresh transactions:", error)
    }
  }

  const addTransaction = (tx: Transaction) => {
    setTransactions([tx, ...transactions])
  }

  const addTransfer = (transfer: Transfer) => {
    setTransfers([transfer, ...transfers])
  }

  const verifyPin = async (pin: string): Promise<boolean> => {
    const isValid = await pinAPI.verifyPin(pin)
    if (isValid) {
      setIsPinVerified(true)
    }
    return isValid
  }

  const handleSetPin = async (pin: string): Promise<void> => {
    await pinAPI.setPin(pin)
    setIsPinSet(true)
    setIsPinVerified(true)
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
        updateWalletBalance,
        transactions,
        addTransaction,
        refreshTransactions,
        isPinSet,
        isPinVerified,
        setIsPinVerified,
        verifyPin,
        setPin: handleSetPin,
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
