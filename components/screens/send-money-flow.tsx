"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/app/app-provider"

type SendMoneyFlowProps = {
  onComplete: () => void
}

export function SendMoneyFlow({ onComplete }: SendMoneyFlowProps) {
  const [step, setStep] = useState<
    "country" | "method" | "recipient" | "amount" | "route" | "payment" | "crypto" | "processing" | "confirm"
  >("country")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedPayment, setSelectedPayment] = useState("")
  const [processingStep, setProcessingStep] = useState(0)
  const { addTransfer } = useApp()

  const countries = ["Nigeria", "Kenya", "Ghana", "Mexico", "India", "Brazil"]
  const methods = ["Mobile Money", "Bank Transfer", "Wallet"]
  const paymentMethods = ["USDC", "Card", "Bank Account"]

  const routes = [
    { id: "direct", name: "Direct Route", time: "2-3 min", fee: "$0.50", rate: 1500 },
    { id: "optimal", name: "Optimal (Cheapest)", time: "4-5 min", fee: "$0.25", rate: 1499 },
    { id: "fast", name: "Fast Track", time: "30-60 sec", fee: "$1.50", rate: 1500 },
  ]

  const processingSteps = [
    { label: "Converting to USDC", icon: "💱" },
    { label: "On-chain settlement", icon: "⛓️" },
    { label: "Local payout", icon: "🏦" },
    { label: "Recipient confirmed", icon: "✓" },
  ]

  const handleNext = () => {
    const steps: (typeof step)[] = [
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
    const currentIndex = steps.indexOf(step)
    setStep(steps[currentIndex + 1])
  }

  const handleComplete = () => {
    if (step === "confirm") {
      addTransfer({
        id: "transfer-" + Date.now(),
        recipient: recipientName,
        amount: Number.parseFloat(amount),
        fromCurrency: "USD",
        toCurrency: "NGN",
        rate: 1500,
        status: "completed",
        createdAt: new Date(),
      })
      onComplete()
    } else {
      handleNext()
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Progress */}
      <div className="pt-4 space-y-3">
        <button onClick={() => setStep("country")} className="text-muted-foreground text-sm hover:text-foreground">
          ← Back
        </button>
        <h1 className="text-3xl font-bold">Send Money</h1>
      </div>

      {/* Step: Country */}
      {step === "country" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Destination Country</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedCountry === country ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                {country}
              </button>
            ))}
            <Button onClick={handleComplete} disabled={!selectedCountry} className="w-full mt-4">
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
          </CardHeader>
          <CardContent className="space-y-2">
            {methods.map((method) => (
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
              <Input placeholder="Full name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <Input placeholder="Enter account number" />
            </div>
            <Button onClick={handleComplete} disabled={!recipientName} className="w-full mt-4">
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
            <p className="text-sm text-muted-foreground mt-1">Real-time rate: 1 USD = 1,500 NGN</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD)</label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            {amount && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">You'll send</p>
                <p className="text-2xl font-bold">{(Number.parseFloat(amount) * 1500).toLocaleString()} NGN</p>
              </div>
            )}
            <Button onClick={handleComplete} disabled={!amount} className="w-full mt-4">
              Next
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
                    <p className="text-sm font-medium">{route.fee}</p>
                    <Badge variant="outline" className="mt-1">
                      1 USDC = {route.rate} NGN
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
            {processingStep < processingSteps.length - 1 && (
              <div
                onAnimationIteration={() => setProcessingStep((s) => Math.min(s + 1, processingSteps.length - 1))}
                className="hidden"
              />
            )}

            <Button
              onClick={() => {
                setProcessingStep(processingSteps.length - 1)
                setTimeout(handleComplete, 500)
              }}
              className="w-full"
            >
              {processingStep === processingSteps.length - 1 ? "View Receipt" : "Simulate Completion"}
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
              <p className="text-muted-foreground">sent to {recipientName}</p>
            </div>

            <div className="space-y-2 bg-muted/50 p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-medium">{recipientName}</span>
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
                <span className="text-muted-foreground">Via:</span>
                <span className="font-medium">USDC Settlement</span>
              </div>
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
