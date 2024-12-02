"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"

interface PricingTier {
  name: string
  description: string
  price: number
  features: string[]
  usageLimit?: number
}

interface AutomationPricingCardProps {
  payPerUse: PricingTier
  basicSubscription: PricingTier
  proSubscription: PricingTier
}

export function AutomationPricingCard({
  payPerUse,
  basicSubscription,
  proSubscription,
}: AutomationPricingCardProps) {
  const [selectedTier, setSelectedTier] = useState<"pay-per-use" | "basic" | "pro">("pay-per-use")

  const renderPricing = (tier: PricingTier) => {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${tier.price}</span>
            {tier.usageLimit ? (
              <span className="text-muted-foreground">/{tier.usageLimit} uses</span>
            ) : (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
        </div>
        <ul className="space-y-2.5">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full">Get Started with {tier.name}</Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Tabs
          defaultValue={selectedTier}
          onValueChange={(value) => setSelectedTier(value as typeof selectedTier)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pay-per-use">Pay Per Use</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
          </TabsList>
          <TabsContent value="pay-per-use" className="mt-4">
            {renderPricing(payPerUse)}
          </TabsContent>
          <TabsContent value="basic" className="mt-4">
            {renderPricing(basicSubscription)}
          </TabsContent>
          <TabsContent value="pro" className="mt-4">
            {renderPricing(proSubscription)}
          </TabsContent>
        </Tabs>
      </CardHeader>
      <CardFooter className="text-center text-sm text-muted-foreground">
        30-day money-back guarantee
      </CardFooter>
    </Card>
  )
}
