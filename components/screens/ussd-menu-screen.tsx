"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/app/app-provider"
import { transactionAPI, airtimeProviders } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, X } from "lucide-react"

type UssdScreenProps = {
  onBack: () => void
  onComplete: () => void
}

type MenuState = {
  id: string
  title: string
  options: { key: string; label: string; action?: string; next?: string }[]
  inputType?: "phone" | "amount" | "account" | "pin"
  inputLabel?: string
}

type SessionData = {
  service?: string
  country?: string
  provider?: string
  phoneNumber?: string
  amount?: string
  billType?: string
  accountNumber?: string
}

const MENUS: Record<string, MenuState> = {
  main: {
    id: "main",
    title: "Moneyfer USSD",
    options: [
      { key: "1", label: "Buy Airtime", next: "airtime-country" },
      { key: "2", label: "Pay Bills", next: "bills-type" },
      { key: "3", label: "Check Balance", action: "balance" },
      { key: "4", label: "Mini Statement", action: "statement" },
      { key: "0", label: "Exit", action: "exit" },
    ],
  },
  "airtime-country": {
    id: "airtime-country",
    title: "Select Country",
    options: [
      { key: "1", label: "Nigeria", next: "airtime-provider-ng" },
      { key: "2", label: "Kenya", next: "airtime-provider-ke" },
      { key: "3", label: "Ghana", next: "airtime-provider-gh" },
      { key: "0", label: "Back", next: "main" },
    ],
  },
  "airtime-provider-ng": {
    id: "airtime-provider-ng",
    title: "Select Provider",
    options: [
      { key: "1", label: "MTN", next: "airtime-phone" },
      { key: "2", label: "Airtel", next: "airtime-phone" },
      { key: "3", label: "Glo", next: "airtime-phone" },
      { key: "4", label: "9mobile", next: "airtime-phone" },
      { key: "0", label: "Back", next: "airtime-country" },
    ],
  },
  "airtime-provider-ke": {
    id: "airtime-provider-ke",
    title: "Select Provider",
    options: [
      { key: "1", label: "Safaricom", next: "airtime-phone" },
      { key: "2", label: "Airtel", next: "airtime-phone" },
      { key: "3", label: "Telkom", next: "airtime-phone" },
      { key: "0", label: "Back", next: "airtime-country" },
    ],
  },
  "airtime-provider-gh": {
    id: "airtime-provider-gh",
    title: "Select Provider",
    options: [
      { key: "1", label: "MTN", next: "airtime-phone" },
      { key: "2", label: "Vodafone", next: "airtime-phone" },
      { key: "3", label: "AirtelTigo", next: "airtime-phone" },
      { key: "0", label: "Back", next: "airtime-country" },
    ],
  },
  "airtime-phone": {
    id: "airtime-phone",
    title: "Enter Phone Number",
    options: [{ key: "0", label: "Back", next: "main" }],
    inputType: "phone",
    inputLabel: "Phone Number",
  },
  "airtime-amount": {
    id: "airtime-amount",
    title: "Enter Amount (USD)",
    options: [
      { key: "1", label: "$5", action: "airtime-5" },
      { key: "2", label: "$10", action: "airtime-10" },
      { key: "3", label: "$20", action: "airtime-20" },
      { key: "0", label: "Back", next: "airtime-phone" },
    ],
    inputType: "amount",
    inputLabel: "Or enter custom amount",
  },
  "bills-type": {
    id: "bills-type",
    title: "Select Bill Type",
    options: [
      { key: "1", label: "Electricity", next: "bills-account" },
      { key: "2", label: "Water", next: "bills-account" },
      { key: "3", label: "Internet", next: "bills-account" },
      { key: "4", label: "Cable TV", next: "bills-account" },
      { key: "0", label: "Back", next: "main" },
    ],
  },
  "bills-account": {
    id: "bills-account",
    title: "Enter Account Number",
    options: [{ key: "0", label: "Back", next: "bills-type" }],
    inputType: "account",
    inputLabel: "Account/Meter Number",
  },
  "bills-amount": {
    id: "bills-amount",
    title: "Enter Amount (USD)",
    options: [{ key: "0", label: "Back", next: "bills-account" }],
    inputType: "amount",
    inputLabel: "Amount to Pay",
  },
  "confirm-pin": {
    id: "confirm-pin",
    title: "Enter PIN to Confirm",
    options: [{ key: "0", label: "Cancel", next: "main" }],
    inputType: "pin",
    inputLabel: "Enter 4-digit PIN",
  },
}

export function UssdMenuScreen({ onBack, onComplete }: UssdScreenProps) {
  const { wallets, updateWalletBalance, addTransaction, refreshTransactions, isPinSet, verifyPin } = useApp()
  const { toast } = useToast()

  const [currentMenu, setCurrentMenu] = useState<MenuState>(MENUS.main)
  const [sessionData, setSessionData] = useState<SessionData>({})
  const [displayHistory, setDisplayHistory] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)

  const usdcWallet = wallets.find((w) => w.symbol === "USDC")

  useEffect(() => {
    // Focus input on menu change
    inputRef.current?.focus()
    // Scroll display to bottom
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight
    }
  }, [currentMenu, displayHistory])

  const addToHistory = (text: string) => {
    setDisplayHistory((prev) => [...prev, text])
  }

  const navigateToMenu = (menuId: string) => {
    const menu = MENUS[menuId]
    if (menu) {
      addToHistory("")
      addToHistory(`--- ${menu.title} ---`)
      menu.options.forEach((opt) => {
        addToHistory(`${opt.key}. ${opt.label}`)
      })
      if (menu.inputLabel) {
        addToHistory("")
        addToHistory(menu.inputLabel + ":")
      }
      setCurrentMenu(menu)
    }
  }

  const handleAction = async (action: string) => {
    setIsProcessing(true)

    try {
      if (action === "balance") {
        const balance = usdcWallet?.amount.toFixed(2) || "0.00"
        addToHistory("")
        addToHistory(`Your balance: $${balance} USDC`)
        addToHistory("")
        addToHistory("Press 0 to go back")
        setResultMessage(`Balance: $${balance}`)
      } else if (action === "statement") {
        addToHistory("")
        addToHistory("--- Mini Statement ---")
        addToHistory("Recent Transactions:")
        addToHistory("1. Airtime - $10.00")
        addToHistory("2. Transfer - $50.00")
        addToHistory("3. Bill Pay - $25.00")
        addToHistory("")
        addToHistory("Press 0 to go back")
      } else if (action === "exit") {
        onBack()
      } else if (action.startsWith("airtime-")) {
        const amount = parseInt(action.split("-")[1])
        await processAirtime(amount)
      } else if (action === "process-bill") {
        await processBill()
      }
    } catch (error) {
      addToHistory("")
      addToHistory(`Error: ${error instanceof Error ? error.message : "Transaction failed"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const processAirtime = async (amount: number) => {
    if (!sessionData.phoneNumber) {
      addToHistory("Error: Phone number not set")
      return
    }

    if (usdcWallet && amount > usdcWallet.amount) {
      addToHistory("")
      addToHistory("Insufficient balance!")
      addToHistory(`Available: $${usdcWallet.amount.toFixed(2)}`)
      return
    }

    addToHistory("")
    addToHistory("Processing...")

    const tx = await transactionAPI.buyAirtime({
      phoneNumber: sessionData.phoneNumber,
      amount,
      provider: sessionData.provider || "Unknown",
      country: sessionData.country || "Unknown",
    })

    if (usdcWallet) {
      await updateWalletBalance(usdcWallet.id, usdcWallet.amount - amount)
    }

    addTransaction(tx)
    await refreshTransactions()

    addToHistory("")
    addToHistory("*** SUCCESS ***")
    addToHistory(`$${amount} airtime sent to`)
    addToHistory(sessionData.phoneNumber)
    addToHistory("")
    addToHistory("Press 0 to return to menu")

    toast({
      title: "Airtime purchased",
      description: `$${amount} sent to ${sessionData.phoneNumber}`,
      variant: "success",
    })
  }

  const processBill = async () => {
    const amount = parseFloat(sessionData.amount || "0")

    if (!sessionData.accountNumber || !amount) {
      addToHistory("Error: Missing details")
      return
    }

    if (usdcWallet && amount > usdcWallet.amount) {
      addToHistory("")
      addToHistory("Insufficient balance!")
      addToHistory(`Available: $${usdcWallet.amount.toFixed(2)}`)
      return
    }

    addToHistory("")
    addToHistory("Processing...")

    const billType = (sessionData.billType as "electricity" | "water" | "internet" | "tv") || "other"
    const tx = await transactionAPI.payBill({
      billType,
      accountNumber: sessionData.accountNumber,
      amount,
      provider: billType,
    })

    if (usdcWallet) {
      await updateWalletBalance(usdcWallet.id, usdcWallet.amount - amount)
    }

    addTransaction(tx)
    await refreshTransactions()

    addToHistory("")
    addToHistory("*** SUCCESS ***")
    addToHistory(`$${amount} paid for ${billType}`)
    addToHistory(`Account: ${sessionData.accountNumber}`)
    addToHistory("")
    addToHistory("Press 0 to return to menu")

    toast({
      title: "Bill paid",
      description: `$${amount} paid for ${billType}`,
      variant: "success",
    })
  }

  const handleSubmit = async () => {
    if (!input.trim()) return

    const userInput = input.trim()
    addToHistory(`> ${userInput}`)
    setInput("")

    // Handle special inputs
    if (userInput === "0" && currentMenu.id !== "main") {
      // Go back
      if (resultMessage) {
        setResultMessage(null)
        navigateToMenu("main")
      } else {
        const backOption = currentMenu.options.find((o) => o.key === "0")
        if (backOption?.next) {
          navigateToMenu(backOption.next)
        }
      }
      return
    }

    // Handle input types
    if (currentMenu.inputType === "phone" && userInput.length >= 10) {
      setSessionData((prev) => ({ ...prev, phoneNumber: userInput }))
      navigateToMenu("airtime-amount")
      return
    }

    if (currentMenu.inputType === "amount" && !isNaN(parseFloat(userInput))) {
      const amount = parseFloat(userInput)
      if (currentMenu.id === "airtime-amount") {
        await handleAction(`airtime-${amount}`)
      } else if (currentMenu.id === "bills-amount") {
        setSessionData((prev) => ({ ...prev, amount: userInput }))
        if (isPinSet) {
          navigateToMenu("confirm-pin")
        } else {
          await handleAction("process-bill")
        }
      }
      return
    }

    if (currentMenu.inputType === "account" && userInput.length >= 5) {
      setSessionData((prev) => ({ ...prev, accountNumber: userInput }))
      navigateToMenu("bills-amount")
      return
    }

    if (currentMenu.inputType === "pin") {
      if (userInput.length === 4) {
        const isValid = await verifyPin(userInput)
        if (isValid) {
          await handleAction("process-bill")
        } else {
          addToHistory("")
          addToHistory("Invalid PIN. Try again.")
        }
      }
      return
    }

    // Handle menu options
    const selectedOption = currentMenu.options.find((o) => o.key === userInput)
    if (selectedOption) {
      // Store selection data
      if (currentMenu.id === "airtime-country") {
        const countries = { "1": "Nigeria", "2": "Kenya", "3": "Ghana" }
        setSessionData((prev) => ({ ...prev, country: countries[userInput as keyof typeof countries] }))
      }
      if (currentMenu.id.startsWith("airtime-provider")) {
        const providerLabel = selectedOption.label
        setSessionData((prev) => ({ ...prev, provider: providerLabel, service: "airtime" }))
      }
      if (currentMenu.id === "bills-type") {
        const billTypes = { "1": "electricity", "2": "water", "3": "internet", "4": "tv" }
        setSessionData((prev) => ({
          ...prev,
          billType: billTypes[userInput as keyof typeof billTypes],
          service: "bills",
        }))
      }

      if (selectedOption.action) {
        await handleAction(selectedOption.action)
      } else if (selectedOption.next) {
        navigateToMenu(selectedOption.next)
      }
    } else {
      addToHistory("Invalid option. Try again.")
    }
  }

  // Initialize display on mount
  useEffect(() => {
    addToHistory("*328# Moneyfer USSD")
    addToHistory("")
    addToHistory("--- Main Menu ---")
    MENUS.main.options.forEach((opt) => {
      addToHistory(`${opt.key}. ${opt.label}`)
    })
    addToHistory("")
    addToHistory("Enter option:")
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">USSD Menu</h1>
          <p className="text-muted-foreground text-sm">*328# Moneyfer Services</p>
        </div>
      </div>

      {/* USSD Display */}
      <Card className="bg-card border-2 border-primary/20">
        <CardContent className="p-0">
          {/* Screen */}
          <div
            ref={displayRef}
            className="bg-muted/30 p-4 h-[400px] overflow-y-auto font-mono text-sm space-y-1"
          >
            {displayHistory.map((line, i) => (
              <div key={i} className={line.startsWith(">") ? "text-primary" : "text-foreground"}>
                {line || "\u00A0"}
              </div>
            ))}
            {isProcessing && (
              <div className="text-muted-foreground animate-pulse">Processing...</div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              ref={inputRef}
              type={currentMenu.inputType === "pin" ? "password" : "text"}
              inputMode={currentMenu.inputType === "phone" || currentMenu.inputType === "pin" ? "numeric" : "text"}
              placeholder="Enter response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="font-mono"
              disabled={isProcessing}
            />
            <Button onClick={handleSubmit} disabled={isProcessing || !input.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-12 text-lg font-mono"
            onClick={() => setInput((prev) => prev + key)}
          >
            {key}
          </Button>
        ))}
      </div>

      {/* Clear and Backspace */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setInput((prev) => prev.slice(0, -1))}
        >
          Backspace
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setInput("")}>
          Clear
        </Button>
      </div>
    </div>
  )
}
