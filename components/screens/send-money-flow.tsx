"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/app/app-provider"
import { transferAPI, exchangeRateAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

type SendMoneyFlowStep =
  | "country"
  | "method"
  | "recipient"
  | "amount"
  | "route"
  | "payment"
  | "crypto"
  | "processing"
  | "confirm"

type SendMoneyFlowProps = {
  onComplete: () => void
  onBack: () => void
}

const SEND_MONEY_STEPS: SendMoneyFlowStep[] = [
  "country",
  "method",
  "recipient",
  "amount",
  "route",
  "payment",
  "crypto",
  "processing",
  "confirm",
]

export function SendMoneyFlow({ onComplete, onBack }: SendMoneyFlowProps) {
  const [step, setStep] = useState<SendMoneyFlowStep>("country")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [countryQuery, setCountryQuery] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [sierraLeoneBank, setSierraLeoneBank] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientAccount, setRecipientAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedPayment, setSelectedPayment] = useState("")
  const [processingStep, setProcessingStep] = useState(0)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isLoadingRate, setIsLoadingRate] = useState(false)
  const { addTransfer, refreshTransfers, refreshWallets } = useApp()
  const { toast } = useToast()

  const recipientSchema = z.object({
    recipientName: z.string().min(2, "Recipient name is required"),
    recipientAccount: z.string().min(5, "Account number is required"),
  })

  const amountSchema = z.object({
    amount: z.string().refine((val) => {
      const num = Number.parseFloat(val)
      return !Number.isNaN(num) && num > 0
    }, "Please enter a valid amount"),
  })

  const countries = [
    "Nigeria",
    "Kenya",
    "Ghana",
    "Sierra Leone",
    "South Africa",
    "Egypt",
    "Morocco",
    "Tunisia",
    "Ivory Coast",
    "Senegal",
    "Ethiopia",
    "Uganda",
    "Tanzania",
    "Rwanda",
    "Zambia",
    "Zimbabwe",
    "Botswana",
    "Gambia",
    "Cameroon",
    "Angola",
    "Namibia",
    "United States",
    "Canada",
    "Mexico",
    "Brazil",
    "Argentina",
    "Chile",
    "Peru",
    "Colombia",
    "Panama",
    "Costa Rica",
    "United Kingdom",
    "Ireland",
    "France",
    "Germany",
    "Spain",
    "Italy",
    "Portugal",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "Poland",
    "Czech Republic",
    "Turkey",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "India",
    "Pakistan",
    "Bangladesh",
    "Sri Lanka",
    "Nepal",
    "China",
    "Hong Kong",
    "Singapore",
    "Malaysia",
    "Indonesia",
    "Philippines",
    "Thailand",
    "Vietnam",
    "Australia",
    "New Zealand",
  ]

  const getPayoutMethods = (country: string): string[] => {
    if (country === "Sierra Leone") {
      return ["Afrimoney", "Orange Money", "Bank - Sierra Leone"]
    }
    return ["Mobile Money", "Bank Transfer", "Wallet"]
  }

  const sierraLeoneBanks = [
    "Sierra Leone Commercial Bank",
    "United Bank Of Africa",
    "Rokel Commercial Bank",
    "Eco Bank",
    "Guarantee Trust Bank",
    "Other Bank (Sierra Leone)",
  ]

  const paymentMethods = ["USDC", "Card", "Bank Account"]

  // Get currency code based on country
  const getCurrencyCode = (country: string): string => {
    const currencyMap: Record<string, string> = {
      Nigeria: "NGN",
      Kenya: "KES",
      Ghana: "GHS",
      "Sierra Leone": "SLL",
      "South Africa": "ZAR",
      Egypt: "EGP",
      Morocco: "MAD",
      Tunisia: "TND",
      "Ivory Coast": "XOF",
      Senegal: "XOF",
      Ethiopia: "ETB",
      Uganda: "UGX",
      Tanzania: "TZS",
      Rwanda: "RWF",
      Zambia: "ZMW",
      Zimbabwe: "ZWL",
      Botswana: "BWP",
      Gambia: "GMD",
      Cameroon: "XAF",
      Angola: "AOA",
      Namibia: "NAD",
      "United States": "USD",
      Canada: "CAD",
      Mexico: "MXN",
      Brazil: "BRL",
      Argentina: "ARS",
      Chile: "CLP",
      Peru: "PEN",
      Colombia: "COP",
      Panama: "PAB",
      "Costa Rica": "CRC",
      "United Kingdom": "GBP",
      Ireland: "EUR",
      France: "EUR",
      Germany: "EUR",
      Spain: "EUR",
      Italy: "EUR",
      Portugal: "EUR",
      Netherlands: "EUR",
      Belgium: "EUR",
      Sweden: "SEK",
      Norway: "NOK",
      Denmark: "DKK",
      Switzerland: "CHF",
      Poland: "PLN",
      "Czech Republic": "CZK",
      Turkey: "TRY",
      "United Arab Emirates": "AED",
      "Saudi Arabia": "SAR",
      Qatar: "QAR",
      Kuwait: "KWD",
      India: "INR",
      Pakistan: "PKR",
      Bangladesh: "BDT",
      "Sri Lanka": "LKR",
      Nepal: "NPR",
      China: "CNY",
      "Hong Kong": "HKD",
      Singapore: "SGD",
      Malaysia: "MYR",
      Indonesia: "IDR",
      Philippines: "PHP",
      Thailand: "THB",
      Vietnam: "VND",
      Australia: "AUD",
      "New Zealand": "NZD",
    }
    return currencyMap[country] || "USD"
  }

  // Fetch exchange rate when country is selected
  useEffect(() => {
    if (selectedCountry && step === "amount") {
      setIsLoadingRate(true)
      exchangeRateAPI
        .getRate("USD", getCurrencyCode(selectedCountry), selectedCountry)
        .then((rate) => {
          setExchangeRate(rate.rate)
        })
        .catch(() => {
          toast({
            title: "Failed to fetch rate",
            description: "Using default rate. Please try again.",
            variant: "destructive",
          })
          setExchangeRate(1500) // Default fallback
        })
        .finally(() => {
          setIsLoadingRate(false)
        })
    }
  }, [selectedCountry, step, toast])

  // Reset payout method and bank when country changes
  useEffect(() => {
    setSelectedMethod("")
    setSierraLeoneBank("")
  }, [selectedCountry])

  // Auto-advance processing steps
  useEffect(() => {
    if (step === "processing" && processingStep < processingSteps.length - 1) {
      const timer = setTimeout(() => {
        setProcessingStep((s) => Math.min(s + 1, processingSteps.length - 1))
      }, 2000)
      return () => clearTimeout(timer)
    } else if (step === "processing" && processingStep === processingSteps.length - 1) {
      const timer = setTimeout(() => {
        handleNext()
      }, 1000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, processingStep])

  const routes = exchangeRate
    ? [
        { id: "direct", name: "Direct Route", time: "2-3 min", fee: 0.5, rate: exchangeRate },
        { id: "optimal", name: "Optimal (Cheapest)", time: "4-5 min", fee: 0.25, rate: exchangeRate * 0.999 },
        { id: "fast", name: "Fast Track", time: "30-60 sec", fee: 1.5, rate: exchangeRate },
      ]
    : []

  const processingSteps = [
    { label: "Converting to USDC", icon: "💱" },
    { label: "On-chain settlement", icon: "⛓️" },
    { label: "Local payout", icon: "🏦" },
    { label: "Recipient confirmed", icon: "✓" },
  ]

  const handleNext = () => {
    const currentIndex = SEND_MONEY_STEPS.indexOf(step)
    setStep(SEND_MONEY_STEPS[currentIndex + 1])
  }

  const handleComplete = async () => {
    if (step === "confirm") {
      try {
        const selectedRouteData = routes.find((r) => r.id === selectedRoute)
        if (!selectedRouteData) {
          toast({
            title: "Error",
            description: "Please select a route",
            variant: "destructive",
          })
          return
        }

        const transfer = await transferAPI.createTransfer({
          recipient: recipientName,
          recipientAccount,
          amount: Number.parseFloat(amount),
          fromCurrency: "USD",
          toCurrency: getCurrencyCode(selectedCountry),
          rate: selectedRouteData.rate,
          fee: selectedRouteData.fee,
          country: selectedCountry,
          method: selectedMethod,
          route: selectedRouteData.name,
        })

        addTransfer(transfer)
        await refreshTransfers()
        await refreshWallets()

        toast({
          title: "Transfer completed!",
          description: `$${amount} sent successfully`,
          variant: "success",
        })

        onComplete()
      } catch (error) {
        toast({
          title: "Transfer failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        })
      }
    } else {
      handleNext()
    }
  }

  const filteredCountries = countries.filter((country) => {
    if (!countryQuery.trim()) return true
    return country.toLowerCase().includes(countryQuery.trim().toLowerCase())
  })

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Progress */}
      <div className="pt-4 space-y-3">
        <button
          onClick={() => {
            const currentIndex = SEND_MONEY_STEPS.indexOf(step)
            if (currentIndex <= 0) {
              onBack()
            } else {
              setStep(SEND_MONEY_STEPS[currentIndex - 1])
            }
          }}
          className="text-muted-foreground text-sm hover:text-foreground"
        >
           d Back
        </button>
        <h1 className="text-3xl font-bold">Send Money</h1>
      </div>

      {/* Step: Country */}
      {step === "country" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Destination Country</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search country</label>
              <Input
                placeholder="Start typing to filter countries"
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedCountry === country ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {country}
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No countries match your search.</p>
              )}
            </div>
            <Button onClick={handleComplete} disabled={!selectedCountry} className="w-full mt-2">
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Method */}
      {step === "method" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payout Method</CardTitle>
            {selectedCountry === "Sierra Leone" && (
              <p className="text-sm text-muted-foreground mt-1">
                Cash out via Afrimoney, Orange Money, or local banks in Sierra Leone.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {getPayoutMethods(selectedCountry).map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedMethod === method ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                {method}
              </button>
            ))}
            <Button onClick={handleComplete} disabled={!selectedMethod} className="w-full mt-4">
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Recipient */}
      {step === "recipient" && (
        <Card>
          <CardHeader>
            <CardTitle>Recipient Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name</label>
              <Input
                placeholder="Full name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            {selectedCountry === "Sierra Leone" && selectedMethod === "Bank - Sierra Leone" && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Bank</label>
                <div className="space-y-2">
                  {sierraLeoneBanks.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSierraLeoneBank(bank)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        sierraLeoneBank === bank
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <Input
                placeholder="Enter account number"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                const form = { recipientName, recipientAccount }
                const result = recipientSchema.safeParse(form)
                if (result.success) {
                  if (
                    selectedCountry === "Sierra Leone" &&
                    selectedMethod === "Bank - Sierra Leone" &&
                    !sierraLeoneBank
                  ) {
                    toast({
                      title: "Select bank",
                      description: "Please choose a Sierra Leone bank for cash out.",
                      variant: "destructive",
                    })
                    return
                  }
                  handleNext()
                } else {
                  const error = result.error.errors[0]
                  toast({
                    title: "Validation error",
                    description: error?.message || "Please fill all fields correctly",
                    variant: "destructive",
                  })
                }
              }}
              className="w-full mt-4"
            >
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Amount */}
      {step === "amount" && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Amount</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoadingRate ? (
                "Loading rate..."
              ) : exchangeRate ? (
                `Real-time rate: 1 USD = ${exchangeRate.toLocaleString()} ${getCurrencyCode(selectedCountry)}`
              ) : (
                "Select country first"
              )}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {amount && exchangeRate && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">You'll send</p>
                <p className="text-2xl font-bold">
                  {(Number.parseFloat(amount) * exchangeRate).toLocaleString()} {getCurrencyCode(selectedCountry)}
                </p>
              </div>
            )}
            <Button
              onClick={() => {
                const result = amountSchema.safeParse({ amount })
                if (result.success && exchangeRate) {
                  handleNext()
                } else {
                  toast({
                    title: "Invalid amount",
                    description: "Please enter a valid amount greater than 0",
                    variant: "destructive",
                  })
                }
              }}
              disabled={!amount || !exchangeRate || isLoadingRate}
              className="w-full mt-4"
            >
              {isLoadingRate ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Loading...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "route" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Transfer Route</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Smart routing through USDC on-chain settlement</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  selectedRoute === route.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{route.name}</p>
                    <p className="text-xs text-muted-foreground">{route.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${route.fee.toFixed(2)}</p>
                    <Badge variant="outline" className="mt-1">
                      1 USD = {route.rate.toFixed(2)} {getCurrencyCode(selectedCountry)}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
            <Button onClick={handleComplete} disabled={!selectedRoute} className="w-full mt-4">
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Payment */}
      {step === "payment" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() => setSelectedPayment(method)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedPayment === method ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                {method}
              </button>
            ))}
            <Button onClick={handleComplete} disabled={!selectedPayment} className="w-full mt-4">
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "crypto" && selectedPayment === "USDC" && (
        <Card>
          <CardHeader>
            <CardTitle>Fund with USDC</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Scan QR or copy wallet address</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Placeholder */}
            <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl mb-2">📱</p>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  0x742d35Cc6634C0532925a3b844Bc2e7c8d7b4c2a
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-info/10 border border-info/20 p-3 rounded-lg">
              <p className="text-sm">Waiting for payment confirmation...</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="animate-spin">⏳</span>
                <span className="text-xs text-muted-foreground">Listening for on-chain settlement</span>
              </div>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Payment Confirmed
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "crypto" && selectedPayment !== "USDC" && (
        <Card>
          <CardHeader>
            <CardTitle>Add {selectedPayment}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <Input placeholder="1234 5678 9012 3456" />
            </div>
            <Button onClick={handleComplete} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline */}
            <div className="space-y-4">
              {processingSteps.map((processStep, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        processingStep > index
                          ? "bg-success text-white"
                          : processingStep === index
                            ? "bg-primary text-white animate-pulse"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {processingStep > index ? "✓" : processStep.icon}
                    </div>
                    {index < processingSteps.length - 1 && (
                      <div className={`w-1 h-8 my-1 ${processingStep > index ? "bg-success" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="py-2">
                    <p className="font-medium">{processStep.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {processingStep > index ? "Completed" : processingStep === index ? "In progress..." : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Auto advance simulation */}

            <Button
              onClick={() => {
                if (processingStep < processingSteps.length - 1) {
                  setProcessingStep(processingSteps.length - 1)
                  setTimeout(() => {
                    handleNext()
                  }, 500)
                } else {
                  handleNext()
                }
              }}
              className="w-full"
            >
              {processingStep === processingSteps.length - 1 ? "Continue" : "Skip to End"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-5xl mb-4">✓</p>
              <p className="text-2xl font-bold text-success">${amount}</p>
              <p className="text-muted-foreground">sent to {recipientName || "Recipient"}</p>
            </div>

            <div className="space-y-2 bg-muted/50 p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-medium">{recipientName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{selectedCountry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium">{selectedMethod || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Via:</span>
                <span className="font-medium">{selectedRoute ? routes.find((r) => r.id === selectedRoute)?.name : "USDC Settlement"}</span>
              </div>
              {exchangeRate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">1 USD = {exchangeRate.toFixed(2)} {getCurrencyCode(selectedCountry)}</span>
                </div>
              )}
              {selectedCountry === "Sierra Leone" &&
                selectedMethod === "Bank - Sierra Leone" &&
                sierraLeoneBank && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-medium">{sierraLeoneBank}</span>
                  </div>
                )}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Receipt ID:</span>
                <span className="font-mono text-xs">TX-{Date.now()}</span>
              </div>
            </div>

            <Button onClick={handleComplete} className="w-full bg-success hover:bg-success/90">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
