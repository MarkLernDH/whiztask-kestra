import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SetupWizard } from "@/components/automations/marketplace/SetupWizard"
import { Star, Clock, Award } from "lucide-react"

interface Automation {
  id: string
  name: string
  description: string
  business_problem: string
  use_cases: string[]
  common_pain_points: string[]
  estimated_time_saved_hours: number
  setup_time_minutes: number
  tools_integrated: string[]
  price_monthly: number
  complexity_level: string
  category: string
}

async function getAutomation(id: string): Promise<Automation | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("id", id)
    .single()
  
  if (error) {
    console.error("Error fetching automation:", error)
    return null
  }
  
  return data
}

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const automation = await getAutomation(params.id)
  if (!automation) return { title: "Automation Not Found" }
  
  return {
    title: `${automation.name} - TaskWhiz Marketplace`,
    description: automation.description
  }
}

export default async function MarketplaceAutomationPage({ params }: PageProps) {
  const automation = await getAutomation(params.id)
  if (!automation) notFound()

  const setupSteps = [
    {
      id: "basics",
      title: "Basic Information",
      description: "Let's get started with some basic information",
      fields: [
        {
          id: "name",
          label: "Automation Name",
          type: "text" as const,
          placeholder: "My Social Media Automation",
          help: "Give your automation a memorable name"
        }
      ]
    },
    // Add more steps based on automation requirements
  ]

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{automation.category}</Badge>
                <Badge variant="outline">{automation.complexity_level}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{automation.name}</h1>
              <p className="text-xl text-muted-foreground">{automation.description}</p>
            </div>

            <Tabs defaultValue="overview" className="bg-white rounded-lg shadow-sm border">
              <TabsList className="border-b">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
                <TabsTrigger value="setup">Setup Guide</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">The Problem We Solve</h3>
                  <p className="text-muted-foreground">{automation.business_problem}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Time Saved</p>
                        <p className="text-sm text-muted-foreground">
                          {automation.estimated_time_saved_hours}h/month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
                      <Star className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Setup Time</p>
                        <p className="text-sm text-muted-foreground">
                          {automation.setup_time_minutes} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Integrations</p>
                        <p className="text-sm text-muted-foreground">
                          {automation.tools_integrated.length} tools
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="use-cases" className="p-6">
                <ul className="space-y-4">
                  {automation.use_cases.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="setup" className="p-6">
                <SetupWizard
                  steps={setupSteps}
                  onComplete={(data) => {
                    console.log("Setup complete:", data)
                  }}
                  onCancel={() => {
                    console.log("Setup cancelled")
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 sticky top-8 bg-white">
              <div className="text-3xl font-bold mb-4">
                ${automation.price_monthly}
                <span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              
              <Button className="w-full mb-4 bg-black hover:bg-gray-800">Get Started</Button>
              
              <div className="space-y-4">
                <h4 className="font-semibold">What's included:</h4>
                <ul className="space-y-2">
                  {automation.tools_integrated.map((tool, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span className="text-muted-foreground">{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
