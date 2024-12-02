import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface SetupStep {
  id: string
  title: string
  description: string
  fields: SetupField[]
}

interface SetupField {
  id: string
  type: "text" | "textarea" | "select" | "oauth"
  label: string
  description?: string
  options?: { value: string; label: string }[]
  required?: boolean
}

interface AutomationSetupWizardProps {
  automationId: string
  steps: SetupStep[]
  onComplete: (config: Record<string, any>) => Promise<void>
}

export function AutomationSetupWizard({
  automationId,
  steps,
  onComplete,
}: AutomationSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (stepId: string, fieldId: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldId]: value,
      },
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await onComplete(config)
    } catch (error) {
      console.error("Error completing setup:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: SetupField, stepId: string) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            key={field.id}
            id={field.id}
            placeholder={field.label}
            onChange={(e) =>
              handleFieldChange(stepId, field.id, e.target.value)
            }
            value={config[stepId]?.[field.id] || ""}
          />
        )
      case "textarea":
        return (
          <Textarea
            key={field.id}
            id={field.id}
            placeholder={field.label}
            onChange={(e) =>
              handleFieldChange(stepId, field.id, e.target.value)
            }
            value={config[stepId]?.[field.id] || ""}
          />
        )
      case "select":
        return (
          <Select
            key={field.id}
            onValueChange={(value) =>
              handleFieldChange(stepId, field.id, value)
            }
            value={config[stepId]?.[field.id] || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.label} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        <Tabs value={steps[currentStep].id} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {steps.map((step, index) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                disabled={index !== currentStep}
                className="data-[state=active]:bg-primary"
              >
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={steps[currentStep].id}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{steps[currentStep].title}</h3>
                <p className="text-sm text-gray-500">
                  {steps[currentStep].description}
                </p>
              </div>
              <div className="space-y-4">
                {steps[currentStep].fields.map((field) =>
                  renderField(field, steps[currentStep].id)
                )}
              </div>
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {currentStep === steps.length - 1 ? "Complete" : "Next"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}
