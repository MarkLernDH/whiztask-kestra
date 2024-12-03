import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutomationPricingCard } from "@/components/ui/automation-pricing-card"
import { AutomationMediaCarousel } from "@/components/ui/automation-media-carousel"
import { Star, Clock, Award } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

interface Automation {
  id: string
  name: string
  description: string
  category_id: string
  category: string
  complexity_level: string
  business_problem: string
  use_cases: string[]
  common_pain_points: string[]
  estimated_time_saved_hours: number
  featured_image: string
  media: any[]
  setup_time_minutes: number
  tools_integrated: string[]
  created_at: string
  updated_at: string
  categories: Category[]
  price_per_use: number
  usage_limit: number
  price_monthly: number
}

async function getAutomation(id: string): Promise<Automation | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("automations")
    .select(`
      *,
      categories:category_id (
        id,
        name,
        slug,
        description,
        icon
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Error fetching automation:", error)
    return null
  }

  // Manually transform the data to match the Automation type
  const automation: Automation = {
    ...data,
    media: data.media ? JSON.parse(data.media as string) : [],
    categories: (() => {
      // Check if categories is an array and has the expected structure
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        return data.categories.map(cat => {
          // Type guard to ensure cat has the expected properties
          if (typeof cat === 'object' && cat !== null) {
            return {
              id: (cat as any).id || '',
              name: (cat as any).name || '',
              slug: (cat as any).slug || '',
              description: (cat as any).description || '',
              icon: (cat as any).icon || ''
            }
          }
          return {
            id: '',
            name: '',
            slug: '',
            description: '',
            icon: ''
          }
        })
      }
      return []
    })(),
    // Add default values for pricing fields
    price_per_use: (data as any).price_per_use || 5,
    usage_limit: (data as any).usage_limit || 100,
    price_monthly: (data as any).price_monthly || 49.99,
    category_id: "",
    use_cases: [],
    common_pain_points: []
  }

  return automation
}

interface AutomationPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: AutomationPageProps): Promise<Metadata> {
  const automation = await getAutomation(params.id)

  if (!automation) {
    return {
      title: "Automation Not Found - TaskWhiz",
    }
  }

  return {
    title: `${automation.name} - TaskWhiz`,
    description: automation.description,
  }
}

export default async function AutomationPage({ params }: AutomationPageProps) {
  const automation = await getAutomation(params.id)

  if (!automation) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <Badge variant="outline" className="mb-2">
                {automation.categories?.[0]?.name}
              </Badge>
              <h1 className="text-3xl font-bold">{automation.name}</h1>
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.9</span>
                  <span className="text-sm text-muted-foreground">(124)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    238 purchases
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Saves {automation.estimated_time_saved_hours}h/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Media Carousel */}
            <AutomationMediaCarousel
              media={
                Array.isArray(automation.media)
                  ? automation.media
                  : [
                      {
                        type: "image" as const,
                        url: automation.featured_image || "https://placehold.co/1920x1080",
                        thumbnail: automation.featured_image || "https://placehold.co/640x360",
                      },
                    ]
              }
            />

            {/* Tabs */}
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="prose max-w-none">
                  <h2>About This Automation</h2>
                  <p>{automation.description}</p>
                  <h3>Business Problem</h3>
                  <p>{automation.business_problem}</p>
                  <h3>Use Cases</h3>
                  <ul>
                    {automation.use_cases.map((useCase: string) => (
                      <li key={useCase}>{useCase}</li>
                    ))}
                  </ul>
                  <h3>Common Pain Points Solved</h3>
                  <ul>
                    {automation.common_pain_points.map((point: string) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="space-y-6">
                <div className="prose max-w-none">
                  <h2>Setup Instructions</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Setup time: {automation.setup_time_minutes} minutes</span>
                  </div>
                  <p>Setup instructions will be provided after purchase.</p>
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <div className="prose max-w-none">
                  <h2>Required Integrations</h2>
                  <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {automation.tools_integrated.map((tool: string) => (
                      <Card key={tool} className="p-4">
                        <h3 className="font-medium">{tool}</h3>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Reviews */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-muted-foreground">Reviews coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <AutomationPricingCard
            payPerUse={{
              name: "Pay Per Use",
              description: "Perfect for occasional users",
              price: automation.price_per_use || 5,
              usageLimit: automation.usage_limit || 100,
              features: [
                "Pay only for what you use",
                "Basic support",
                "Access to core features",
                `Up to ${automation.usage_limit || 100} uses`,
              ],
            }}
            basicSubscription={{
              name: "Basic",
              description: "Great for regular users",
              price: automation.price_monthly || 29,
              features: [
                "Unlimited usage",
                "Priority support",
                "Access to all features",
                "Basic analytics",
                "Email notifications",
              ],
            }}
            proSubscription={{
              name: "Pro",
              description: "Best for power users",
              price: (automation.price_monthly || 29) * 2,
              features: [
                "Everything in Basic",
                "Premium support",
                "Advanced analytics",
                "Custom integrations",
                "API access",
                "Dedicated account manager",
              ],
            }}
          />
        </div>
      </div>
    </div>
  )
}
