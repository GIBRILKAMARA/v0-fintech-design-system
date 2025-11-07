"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KYCScreen() {
  const [step, setStep] = useState<"document" | "liveness" | "review" | "complete">("document")

  const steps = [
    { id: "document", label: "Document", icon: "📄" },
    { id: "liveness", label: "Liveness", icon: "📸" },
    { id: "review", label: "Review", icon: "✓" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold">Verification Complete</h1>
          <p className="text-muted-foreground">Your account is ready to use. Start sending money now!</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Continue to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <div className="flex gap-2 h-1 bg-muted rounded-full overflow-hidden">
            <div className="bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{steps[currentStepIndex]?.icon}</span>
              {steps[currentStepIndex]?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "document" && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Upload a photo of your government-issued ID</p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-3xl mb-2">📁</p>
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Passport, Driver's License, or ID Card</p>
                </div>
              </div>
            )}

            {step === "liveness" && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Take a selfie for liveness verification</p>
                <div className="border-2 border-border rounded-lg p-12 text-center bg-muted/30">
                  <p className="text-5xl mb-4">📸</p>
                  <p className="text-sm font-medium">Camera ready</p>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Review your information</p>
                <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> John Doe
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Document:</span> Verified
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Liveness:</span> Passed
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                const nextStep = steps[currentStepIndex + 1]?.id || "complete"
                setStep(nextStep as any)
              }}
              className="w-full"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
