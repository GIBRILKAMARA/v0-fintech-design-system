"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/app/app-provider"

type PinModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  mode?: "verify" | "set" | "change"
  title?: string
  description?: string
}

export function PinModal({ 
  open, 
  onClose, 
  onSuccess, 
  mode = "verify",
  title,
  description 
}: PinModalProps) {
  const { isPinSet, verifyPin, setPin } = useApp()
  const [pin, setLocalPin] = useState(["", "", "", ""])
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""])
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setLocalPin(["", "", "", ""])
      setConfirmPin(["", "", "", ""])
      setStep("enter")
      setError("")
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [open])

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return

    const newPin = isConfirm ? [...confirmPin] : [...pin]
    newPin[index] = value.slice(-1)
    
    if (isConfirm) {
      setConfirmPin(newPin)
    } else {
      setLocalPin(newPin)
    }

    // Move to next input
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs
      refs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (newPin.every(d => d !== "") && index === 3) {
      handleAutoSubmit(newPin.join(""), isConfirm)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === "Backspace") {
      const currentPin = isConfirm ? confirmPin : pin
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmInputRefs : inputRefs
        refs.current[index - 1]?.focus()
      }
    }
  }

  const handleAutoSubmit = async (pinValue: string, isConfirm: boolean) => {
    setError("")
    setIsLoading(true)

    try {
      if (mode === "verify") {
        const isValid = await verifyPin(pinValue)
        if (isValid) {
          onSuccess()
          onClose()
        } else {
          setError("Incorrect PIN. Please try again.")
          setLocalPin(["", "", "", ""])
          setTimeout(() => inputRefs.current[0]?.focus(), 100)
        }
      } else if (mode === "set" || mode === "change") {
        if (!isConfirm) {
          setStep("confirm")
          setTimeout(() => confirmInputRefs.current[0]?.focus(), 100)
        } else {
          const originalPin = pin.join("")
          if (pinValue === originalPin) {
            await setPin(pinValue)
            onSuccess()
            onClose()
          } else {
            setError("PINs don't match. Please try again.")
            setConfirmPin(["", "", "", ""])
            setTimeout(() => confirmInputRefs.current[0]?.focus(), 100)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    if (title) return title
    if (mode === "set") return "Set Your PIN"
    if (mode === "change") return "Change PIN"
    return "Enter PIN"
  }

  const getDescription = () => {
    if (description) return description
    if (mode === "set") return "Create a 4-digit PIN to secure your transactions"
    if (mode === "change") return "Enter your new 4-digit PIN"
    if (step === "confirm") return "Confirm your 4-digit PIN"
    return "Enter your 4-digit PIN to continue"
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
          <DialogDescription className="text-center">
            {step === "confirm" ? "Confirm your PIN" : getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* PIN Input */}
          <div className="flex justify-center gap-3 mb-4">
            {(step === "confirm" ? confirmPin : pin).map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  if (step === "confirm") {
                    confirmInputRefs.current[index] = el
                  } else {
                    inputRefs.current[index] = el
                  }
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, step === "confirm")}
                onKeyDown={(e) => handleKeyDown(index, e, step === "confirm")}
                className="w-14 h-14 text-center text-2xl font-bold"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-destructive text-sm text-center mb-4">{error}</p>
          )}

          {/* Step Indicator for set/change mode */}
          {(mode === "set" || mode === "change") && (
            <div className="flex justify-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${step === "enter" ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-2 h-2 rounded-full ${step === "confirm" ? "bg-primary" : "bg-muted"}`} />
            </div>
          )}

          {/* Cancel Button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
