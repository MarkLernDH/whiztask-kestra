import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

interface PricingTier {
  id: string
  name: string
  description: string
  price: number
  interval: 'one_time' | 'monthly' | 'yearly'
  usageLimit: number | null
  features: string[]
  isPopular: boolean
}

interface PricingTiersProps {
  tiers: PricingTier[]
  onSelect: (tierId: string) => void
}

export function PricingTiers({ tiers, onSelect }: PricingTiersProps) {
  const formatPrice = (price: number, interval: string, usageLimit: number | null) => {
    if (interval === 'one_time') {
      return `$${price} for ${usageLimit} runs`
    }
    return `$${price}/${interval === 'monthly' ? 'mo' : 'yr'}`
  }

  const formatUsage = (usageLimit: number | null, interval: string) => {
    if (interval === 'one_time') return null
    return usageLimit ? `${usageLimit} runs/${interval === 'monthly' ? 'mo' : 'yr'}` : 'Unlimited runs'
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          className={`relative p-6 ${
            tier.isPopular ? 'border-primary shadow-lg' : ''
          }`}
        >
          {tier.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tier.description}
              </p>
            </div>

            <div>
              <span className="text-3xl font-bold">
                {formatPrice(tier.price, tier.interval, tier.usageLimit)}
              </span>
              {formatUsage(tier.usageLimit, tier.interval) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatUsage(tier.usageLimit, tier.interval)}
                </p>
              )}
            </div>

            <ul className="space-y-2">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className="w-full"
              variant={tier.isPopular ? "default" : "outline"}
              onClick={() => onSelect(tier.id)}
            >
              Choose {tier.name}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
