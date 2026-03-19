// Mock API layer for Moneyfer
// In a real app, these would be actual API calls

export type User = {
  id: string
  email: string
  name: string
  kycVerified: boolean
  walletAddress?: string
  createdAt: Date
  pin?: string
  pinSet: boolean
}

export type TransactionType = "transfer" | "airtime" | "bills" | "topup" | "request"

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  currency: string
  status: "pending" | "processing" | "completed" | "failed" | "reversed"
  createdAt: Date
  description: string
  category?: string
  metadata?: Record<string, unknown>
}

export type AirtimeTransaction = Transaction & {
  type: "airtime"
  phoneNumber: string
  provider: string
  country: string
}

export type BillTransaction = Transaction & {
  type: "bills"
  billType: "electricity" | "water" | "internet" | "tv" | "other"
  accountNumber: string
  provider: string
}

export type TopupTransaction = Transaction & {
  type: "topup"
  method: "card" | "bank" | "crypto"
  reference?: string
}

export type Wallet = {
  id: string
  symbol: string
  amount: number
  value: number
  network: string
  address?: string
}

export type Transfer = {
  id: string
  recipient: string
  recipientAccount?: string
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  fee: number
  status: "pending" | "processing" | "completed" | "failed" | "reversed"
  createdAt: Date
  country: string
  method: string
  route: string
  txHash?: string
}

export type ExchangeRate = {
  from: string
  to: string
  rate: number
  timestamp: Date
}

// Storage keys
const STORAGE_KEYS = {
  USER: "flowpay_user",
  TRANSFERS: "flowpay_transfers",
  WALLETS: "flowpay_wallets",
  SESSION: "flowpay_session",
  TRANSACTIONS: "flowpay_transactions",
  PIN: "flowpay_pin",
} as const

// Helper functions for localStorage
function getStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(key)
}

// Mock delay for API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<User> {
    await delay(1000)
    
    // Mock validation
    if (!email || !password) {
      throw new Error("Email and password are required")
    }
    
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters")
    }

    // Check if user exists
    const existingUser = getStorage<User>(STORAGE_KEYS.USER)
    if (existingUser && existingUser.email === email) {
      setStorage(STORAGE_KEYS.SESSION, { userId: existingUser.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 })
      return existingUser
    }

    // Create new user for demo
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0],
      kycVerified: false,
      createdAt: new Date(),
    }
    
    setStorage(STORAGE_KEYS.USER, newUser)
    setStorage(STORAGE_KEYS.SESSION, { userId: newUser.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 })
    return newUser
  },

  async signup(email: string, password: string, name: string): Promise<User> {
    await delay(1000)
    
    if (!email || !password || !name) {
      throw new Error("All fields are required")
    }
    
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters")
    }

    const existingUser = getStorage<User>(STORAGE_KEYS.USER)
    if (existingUser && existingUser.email === email) {
      throw new Error("User with this email already exists")
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      kycVerified: false,
      createdAt: new Date(),
    }
    
    setStorage(STORAGE_KEYS.USER, newUser)
    setStorage(STORAGE_KEYS.SESSION, { userId: newUser.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 })
    return newUser
  },

  async logout(): Promise<void> {
    await delay(300)
    removeStorage(STORAGE_KEYS.SESSION)
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200)
    const session = getStorage<{ userId: string; expiresAt: number }>(STORAGE_KEYS.SESSION)
    
    if (!session || session.expiresAt < Date.now()) {
      removeStorage(STORAGE_KEYS.SESSION)
      return null
    }

    const user = getStorage<User>(STORAGE_KEYS.USER)
    if (!user) return null
    
    // Convert date strings back to Date objects
    return {
      ...user,
      createdAt: user.createdAt instanceof Date 
        ? user.createdAt 
        : new Date(user.createdAt),
    }
  },

  async updateKYCStatus(verified: boolean): Promise<User> {
    await delay(500)
    const user = getStorage<User>(STORAGE_KEYS.USER)
    if (!user) throw new Error("User not found")
    
    const updatedUser = { ...user, kycVerified: verified }
    setStorage(STORAGE_KEYS.USER, updatedUser)
    return updatedUser
  },
}

// Wallet API
export const walletAPI = {
  async getWallets(): Promise<Wallet[]> {
    await delay(300)
    const stored = getStorage<Wallet[]>(STORAGE_KEYS.WALLETS)
    
    if (stored) return stored

    // Default wallets
    const defaultWallets: Wallet[] = [
      { id: "wallet-1", symbol: "USDC", amount: 2450.5, value: 2450.5, network: "Polygon" },
      { id: "wallet-2", symbol: "ETH", amount: 0.85, value: 2840.0, network: "Ethereum" },
      { id: "wallet-3", symbol: "USDT", amount: 1000, value: 1000.0, network: "Polygon" },
    ]
    
    setStorage(STORAGE_KEYS.WALLETS, defaultWallets)
    return defaultWallets
  },

  async updateWallet(walletId: string, amount: number): Promise<Wallet> {
    await delay(300)
    const wallets = await this.getWallets()
    const wallet = wallets.find((w) => w.id === walletId)
    
    if (!wallet) throw new Error("Wallet not found")
    
    const updated = { ...wallet, amount, value: amount }
    const updatedWallets = wallets.map((w) => (w.id === walletId ? updated : w))
    setStorage(STORAGE_KEYS.WALLETS, updatedWallets)
    
    return updated
  },
}

// Transfer API
export const transferAPI = {
  async getTransfers(): Promise<Transfer[]> {
    await delay(200)
    const stored = getStorage<Transfer[]>(STORAGE_KEYS.TRANSFERS)
    if (!stored) return []
    
    // Convert date strings back to Date objects
    return stored.map((transfer) => ({
      ...transfer,
      createdAt: transfer.createdAt instanceof Date 
        ? transfer.createdAt 
        : new Date(transfer.createdAt),
    }))
  },

  async createTransfer(transfer: Omit<Transfer, "id" | "createdAt" | "status">): Promise<Transfer> {
    await delay(500)
    
    const newTransfer: Transfer = {
      ...transfer,
      id: `transfer-${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    }
    
    const transfers = await this.getTransfers()
    setStorage(STORAGE_KEYS.TRANSFERS, [newTransfer, ...transfers])
    
    return newTransfer
  },

  async updateTransferStatus(transferId: string, status: Transfer["status"]): Promise<Transfer> {
    await delay(300)
    const transfers = await this.getTransfers()
    const transfer = transfers.find((t) => t.id === transferId)
    
    if (!transfer) throw new Error("Transfer not found")
    
    const updated = { ...transfer, status }
    const updatedTransfers = transfers.map((t) => (t.id === transferId ? updated : t))
    setStorage(STORAGE_KEYS.TRANSFERS, updatedTransfers)
    
    return updated
  },

  async reverseTransfer(transferId: string): Promise<Transfer> {
    // Convenience helper for reversing a transfer
    return this.updateTransferStatus(transferId, "reversed")
  },
}

// Exchange Rate API
export const exchangeRateAPI = {
  async getRate(from: string, to: string, country?: string): Promise<ExchangeRate> {
    await delay(400)
    
    // Mock rates based on currency pairs
    const rates: Record<string, number> = {
      "USD-NGN": 1500,
      "USD-KES": 130,
      "USD-GHS": 12.5,
      "USD-MXN": 17.2,
      "USD-INR": 83.5,
      "USD-BRL": 5.1,
    }
    
    const key = `${from}-${to}`
    const rate = rates[key] || 1.0
    
    return {
      from,
      to,
      rate,
      timestamp: new Date(),
    }
  },
}

// PIN API
export const pinAPI = {
  async setPin(pin: string): Promise<void> {
    await delay(300)
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      throw new Error("PIN must be exactly 4 digits")
    }
    setStorage(STORAGE_KEYS.PIN, pin)
    
    // Update user to mark PIN as set
    const user = getStorage<User>(STORAGE_KEYS.USER)
    if (user) {
      setStorage(STORAGE_KEYS.USER, { ...user, pinSet: true })
    }
  },

  async verifyPin(pin: string): Promise<boolean> {
    await delay(200)
    const storedPin = getStorage<string>(STORAGE_KEYS.PIN)
    return storedPin === pin
  },

  async changePin(oldPin: string, newPin: string): Promise<void> {
    await delay(300)
    const isValid = await this.verifyPin(oldPin)
    if (!isValid) {
      throw new Error("Current PIN is incorrect")
    }
    await this.setPin(newPin)
  },

  async isPinSet(): Promise<boolean> {
    await delay(100)
    const pin = getStorage<string>(STORAGE_KEYS.PIN)
    return !!pin
  },
}

// Transaction API (unified for all transaction types)
export const transactionAPI = {
  async getTransactions(): Promise<Transaction[]> {
    await delay(200)
    const stored = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS)
    if (!stored) return []
    
    return stored.map((tx) => ({
      ...tx,
      createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt),
    }))
  },

  async createTransaction(tx: Omit<Transaction, "id" | "createdAt" | "status">): Promise<Transaction> {
    await delay(500)
    
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    }
    
    const transactions = await this.getTransactions()
    setStorage(STORAGE_KEYS.TRANSACTIONS, [newTx, ...transactions])
    
    return newTx
  },

  async updateTransactionStatus(txId: string, status: Transaction["status"]): Promise<Transaction> {
    await delay(300)
    const transactions = await this.getTransactions()
    const tx = transactions.find((t) => t.id === txId)
    
    if (!tx) throw new Error("Transaction not found")
    
    const updated = { ...tx, status }
    const updatedTxs = transactions.map((t) => (t.id === txId ? updated : t))
    setStorage(STORAGE_KEYS.TRANSACTIONS, updatedTxs)
    
    return updated
  },

  async buyAirtime(data: { phoneNumber: string; amount: number; provider: string; country: string }): Promise<AirtimeTransaction> {
    await delay(800)
    
    const tx: AirtimeTransaction = {
      id: `airtime-${Date.now()}`,
      type: "airtime",
      amount: data.amount,
      currency: "USD",
      status: "completed",
      createdAt: new Date(),
      description: `Airtime - ${data.provider}`,
      phoneNumber: data.phoneNumber,
      provider: data.provider,
      country: data.country,
      category: "airtime",
    }
    
    const transactions = await this.getTransactions()
    setStorage(STORAGE_KEYS.TRANSACTIONS, [tx, ...transactions])
    
    return tx
  },

  async payBill(data: { billType: BillTransaction["billType"]; accountNumber: string; amount: number; provider: string }): Promise<BillTransaction> {
    await delay(800)
    
    const tx: BillTransaction = {
      id: `bill-${Date.now()}`,
      type: "bills",
      amount: data.amount,
      currency: "USD",
      status: "completed",
      createdAt: new Date(),
      description: `${data.billType.charAt(0).toUpperCase() + data.billType.slice(1)} Bill - ${data.provider}`,
      billType: data.billType,
      accountNumber: data.accountNumber,
      provider: data.provider,
      category: "bills",
    }
    
    const transactions = await this.getTransactions()
    setStorage(STORAGE_KEYS.TRANSACTIONS, [tx, ...transactions])
    
    return tx
  },

  async topUp(data: { amount: number; method: TopupTransaction["method"] }): Promise<TopupTransaction> {
    await delay(800)
    
    const tx: TopupTransaction = {
      id: `topup-${Date.now()}`,
      type: "topup",
      amount: data.amount,
      currency: "USD",
      status: "completed",
      createdAt: new Date(),
      description: `Wallet Top-up via ${data.method}`,
      method: data.method,
      reference: `REF-${Date.now()}`,
      category: "topup",
    }
    
    const transactions = await this.getTransactions()
    setStorage(STORAGE_KEYS.TRANSACTIONS, [tx, ...transactions])
    
    return tx
  },
}

// Airtime Providers
export const airtimeProviders = {
  NG: [
    { id: "mtn", name: "MTN", logo: "M" },
    { id: "airtel", name: "Airtel", logo: "A" },
    { id: "glo", name: "Glo", logo: "G" },
    { id: "9mobile", name: "9mobile", logo: "9" },
  ],
  KE: [
    { id: "safaricom", name: "Safaricom", logo: "S" },
    { id: "airtel-ke", name: "Airtel", logo: "A" },
    { id: "telkom", name: "Telkom", logo: "T" },
  ],
  GH: [
    { id: "mtn-gh", name: "MTN", logo: "M" },
    { id: "vodafone", name: "Vodafone", logo: "V" },
    { id: "airteltigo", name: "AirtelTigo", logo: "A" },
  ],
}

// Bill Providers
export const billProviders = {
  electricity: [
    { id: "eko", name: "Eko Electric", logo: "E" },
    { id: "ikeja", name: "Ikeja Electric", logo: "I" },
    { id: "abuja", name: "Abuja Electric", logo: "A" },
  ],
  water: [
    { id: "lagos-water", name: "Lagos Water Corp", logo: "L" },
    { id: "fct-water", name: "FCT Water Board", logo: "F" },
  ],
  internet: [
    { id: "spectranet", name: "Spectranet", logo: "S" },
    { id: "smile", name: "Smile", logo: "S" },
    { id: "swift", name: "Swift Networks", logo: "S" },
  ],
  tv: [
    { id: "dstv", name: "DSTV", logo: "D" },
    { id: "gotv", name: "GOtv", logo: "G" },
    { id: "startimes", name: "StarTimes", logo: "S" },
  ],
  other: [],
}

