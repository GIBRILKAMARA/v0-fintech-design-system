"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/app/app-provider"
import { transactionAPI, airtimeProviders } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PinModal } from "@/components/pin-modal"
import { ArrowLeft, Phone, Check } from "lucide-react"

type AirtimeScreenProps = {
  onBack: () => void
  onComplete: () => void
}

const countries = [
  { code: "NG", name: "Nigeria", flag: "NG", currency: "NGN" },
  { code: "KE", name: "Kenya", flag: "KE", currency: "KES" },
  { code: "GH", name: "Ghana", flag: "GH", currency: "GHS" },
]

const presetAmounts = [5, 10, 20, 50, 100]

export function AirtimeScreen({ onBack, onComplete }: AirtimeScreenProps) {
  const { wallets, updateWalletBalance, addTransaction, refreshTransactions, isPinSet } = useApp()
  const { toast } = useToast()
  
  const [step, setStep] = useState<"country" | "provider" | "details" | "confirm" | "success">("country")
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)

  const usdcWallet = wallets.find(w => w.symbol === "USDC")
  const providers = selectedCountry ? airtimeProviders[selectedCountry as keyof typeof airtimeProviders] || [] : []
  const selectedProviderData = providers.find(p => p.id === selectedProvider)

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
    setStep("provider")
  }

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    setStep("details")
  }

  const handleContinue = () => {
    if (!phoneNumber || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter phone number and amount",
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
      const countryData = countries.find(c => c.code === selectedCountry)

      // Create the airtime transaction
      const tx = await transactionAPI.buyAirtime({
        phoneNumber,
        amount: amountNum,
        provider: selectedProviderData?.name || selectedProvider,
        country: countryData?.name || selectedCountry,
      })

      // Deduct from wallet
      if (usdcWallet) {
        await updateWalletBalance(usdcWallet.id, usdcWallet.amount - amountNum)
      }

      addTransaction(tx)
      await refreshTransactions()

      setStep("success")
      toast({
        title: "Airtime purchased",
        description: `Successfully sent $${amountNum} airtime to ${phoneNumber}`,
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
      case "country":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Country</h3>
            <div className="space-y-2">
              {countries.map((country) => (
                <Card 
                  key={country.code}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleCountrySelect(country.code)}
                >
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                      {country.flag}
                    </div>
                    <div>
                      <p className="font-medium">{country.name}</p>
                      <p className="text-xs text-muted-foreground">{country.currency}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "provider":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Provider</h3>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => (
                <Card 
                  key={provider.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <CardContent className="pt-4 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                      {provider.logo}
                    </div>
                    <p className="font-medium text-sm">{provider.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep("country")} className="w-full">
              Back to Countries
            </Button>
          </div>
        )

      case "details":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {selectedProviderData?.logo}
              </div>
              <div>
                <p className="font-medium">{selectedProviderData?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {countries.find(c => c.code === selectedCountry)?.name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <div className="flex gap-2 flex-wrap">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Or enter custom amount"
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
              <Button variant="outline" onClick={() => setStep("provider")} className="flex-1">
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
                <CardTitle className="text-base">Confirm Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{selectedProviderData?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="font-medium">{phoneNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">
                    {countries.find(c => c.code === selectedCountry)?.name}
                  </span>
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
                {isLoading ? "Processing..." : "Confirm"}
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
              <h3 className="text-xl font-bold">Airtime Sent!</h3>
              <p className="text-muted-foreground mt-2">
                ${amount} airtime has been sent to {phoneNumber}
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
          <h1 className="text-2xl font-bold">Buy Airtime</h1>
          <p className="text-muted-foreground text-sm">Purchase mobile airtime instantly</p>
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
