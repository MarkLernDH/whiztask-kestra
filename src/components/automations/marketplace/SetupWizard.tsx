'use client';

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SetupStep {
  id: string
  title: string
  description: string
  fields: {
    id: string
    label: string
    type: "text" | "email" | "password" | "select"
    placeholder?: string
    help?: string
    options?: { label: string; value: string }[]
  }[]
}

interface SetupWizardProps {
  steps: SetupStep[]
  onComplete: (data: Record<string, any>) => void
  onCancel: () => void
}

export function SetupWizard({ steps, onComplete, onCancel }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete(formData)
    } else {
      setCurrentStep(current => current + 1)
    }
  }

  const handleBack = () => {
    if (currentStep === 0) {
      onCancel()
    } else {
      setCurrentStep(current => current - 1)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>{currentStepData.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentStepData.fields.map(field => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    [field.id]: e.target.value
                  }))
                }
              />
              {field.help && (
                <p className="text-sm text-muted-foreground">{field.help}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  )
}
