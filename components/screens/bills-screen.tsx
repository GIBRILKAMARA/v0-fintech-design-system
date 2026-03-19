"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/app/app-provider"
import { transactionAPI, billProviders, type BillTransaction } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PinModal } from "@/components/pin-modal"
import { ArrowLeft, Zap, Droplets, Wifi, Tv, MoreHorizontal, Check } from "lucide-react"

type BillsScreenProps = {
  onBack: () => void
  onComplete: () => void
}

const billCategories = [
  { id: "electricity", name: "Electricity", icon: Zap, color: "text-warning" },
  { id: "water", name: "Water", icon: Droplets, color: "text-info" },
  { id: "internet", name: "Internet", icon: Wifi, color: "text-primary" },
  { id: "tv", name: "Cable TV", icon: Tv, color: "text-secondary" },
  { id: "other", name: "Other", icon: MoreHorizontal, color: "text-muted-foreground" },
] as const

export function BillsScreen({ onBack, onComplete }: BillsScreenProps) {
  const { wallets, updateWalletBalance, addTransaction, refreshTransactions, isPinSet } = useApp()
  const { toast } = useToast()
  
  const [step, setStep] = useState<"category" | "provider" | "details" | "confirm" | "success">("category")
  const [selectedCategory, setSelectedCategory] = useState<BillTransaction["billType"] | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)

  const usdcWallet = wallets.find(w => w.symbol === "USDC")
  const providers = selectedCategory ? billProviders[selectedCategory] || [] : []
  const selectedProviderData = providers.find(p => p.id === selectedProvider)
  const selectedCategoryData = billCategories.find(c => c.id === selectedCategory)

  const handleCategorySelect = (categoryId: BillTransaction["billType"]) => {
    setSelectedCategory(categoryId)
    const categoryProviders = billProviders[categoryId] || []
    if (categoryProviders.length === 0) {
      // For "other" category, skip provider selection
      setStep("details")
    } else {
      setStep("provider")
    }
  }

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    setStep("details")
  }

  const handleContinue = () => {
    if (!accountNumber || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter account number and amount",
        variant: "destructive",
      })
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (usdcWallet && amountNum > usdcWallet.amount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough USDC for this transaction",
        variant: "destructive",
      })
      return
    }

    setStep("confirm")
  }

  const handleConfirm = () => {
    if (isPinSet) {
      setShowPinModal(true)
    } else {
      processTransaction()
    }
  }

  const processTransaction = async () => {
    setIsLoading(true)
    try {
      const amountNum = parseFloat(amount)

      // Create the bill transaction
      const tx = await transactionAPI.payBill({
        billType: selectedCategory!,
        accountNumber,
        amount: amountNum,
        provider: selectedProviderData?.name || selectedCategory || "Other",
      })

      // Deduct from wallet
      if (usdcWallet) {
        await updateWalletBalance(usdcWallet.id, usdcWallet.amount - amountNum)
      }

      addTransaction(tx)
      await refreshTransactions()

      setStep("success")
      toast({
        title: "Bill paid",
        description: `Successfully paid $${amountNum} for ${selectedCategoryData?.name}`,
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case "category":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Bill Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {billCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card 
                    key={category.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleCategorySelect(category.id as BillTransaction["billType"])}
                  >
                    <CardContent className="pt-4 flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-sm">{category.name}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case "provider":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {selectedCategoryData && (
                <>
                  <selectedCategoryData.icon className={`h-5 w-5 ${selectedCategoryData.color}`} />
                  <h3 className="font-semibold text-lg">{selectedCategoryData.name} Providers</h3>
                </>
              )}
            </div>
            <div className="space-y-2">
              {providers.map((provider) => (
                <Card 
                  key={provider.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {provider.logo}
                    </div>
                    <p className="font-medium">{provider.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep("category")} className="w-full">
              Back to Categories
            </Button>
          </div>
        )

      case "details":
        return (
          <div className="space-y-6">
            {selectedProviderData && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {selectedProviderData.logo}
                </div>
                <div>
                  <p className="font-medium">{selectedProviderData.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCategoryData?.name}</p>
                </div>
              </div>
            )}

            {!selectedProviderData && selectedCategoryData && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${selectedCategoryData.color}`}>
                  <selectedCategoryData.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{selectedCategoryData.name}</p>
                  <p className="text-xs text-muted-foreground">Custom Bill Payment</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Account/Meter Number</Label>
                <Input
                  id="account"
                  type="text"
                  placeholder="Enter account or meter number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {usdcWallet && (
                <p className="text-sm text-muted-foreground">
                  Available: ${usdcWallet.amount.toFixed(2)} USDC
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(providers.length > 0 ? "provider" : "category")} 
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )

      case "confirm":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confirm Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bill Type</span>
                  <span className="font-medium">{selectedCategoryData?.name}</span>
                </div>
                {selectedProviderData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{selectedProviderData.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium">{accountNumber}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">${amount}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConfirm} className="flex-1" disabled={isLoading}>
                {isLoading ? "Processing..." : "Pay Bill"}
              </Button>
            </div>
          </div>
        )

      case "success":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Payment Successful!</h3>
              <p className="text-muted-foreground mt-2">
                ${amount} has been paid for {selectedCategoryData?.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Account: {accountNumber}
              </p>
            </div>
            <Button onClick={onComplete} className="w-full">
              Done
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        {step !== "success" && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Pay Bills</h1>
          <p className="text-muted-foreground text-sm">Pay your utility bills instantly</p>
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* PIN Modal */}
      <PinModal
        open={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={processTransaction}
        mode="verify"
      />
    </div>
  )
}
