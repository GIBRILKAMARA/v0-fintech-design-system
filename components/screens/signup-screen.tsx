"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/app/app-provider"
import { KYCScreen } from "./kyc-screen"

type SignupScreenProps = {
  onBack: () => void
}

export function SignupScreen({ onBack }: SignupScreenProps) {
  const [step, setStep] = useState<"signup" | "kyc">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useApp()

  const handleSignup = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUser({
      id: "user-" + Date.now(),
      email,
      name,
      kycVerified: false,
    })
    setStep("kyc")
    setIsLoading(false)
  }

  if (step === "kyc") {
    return <KYCScreen />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm mb-4">
          ← Back
        </button>

        <div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join millions sending money globally</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleSignup} disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onBack} className="text-primary hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
