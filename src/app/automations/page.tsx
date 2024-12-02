import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { AutomationCard } from "@/components/ui/automation-card"

interface Category {
  name: string
  slug: string
}

interface Automation {
  id: string
  name: string
  description: string
  business_problem: string
  tools_integrated: string[]
  estimated_time_saved_hours: number
  featured_image: string
  category: string
  subcategory: string
  setup_time_minutes: number
  price_monthly: number
  price_yearly: number
  complexity_level: string
  categories: Category[]
}

export const metadata: Metadata = {
  title: "TaskWhiz - Ready-to-Use Automations",
  description: "Pre-built automations that just work. No coding required.",
}

export const revalidate = 3600 // Revalidate every hour

async function getAutomations(): Promise<Automation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('automations')
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `)
    .order('name')
  if (error) {
    console.error('Error fetching automations:', error)
    throw error
  }
  console.log('Fetched automations:', data)

  // Manually transform the data
  const transformedData: Automation[] = data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    business_problem: item.business_problem || '',
    tools_integrated: item.tools_integrated || [],
    estimated_time_saved_hours: item.estimated_time_saved_hours || 0,
    featured_image: item.featured_image || '',
    category: item.category || '',
    subcategory: item.subcategory || '',
    setup_time_minutes: item.setup_time_minutes || 0,
    price_monthly: item.price_monthly || 0,
    price_yearly: item.price_yearly || 0,
    complexity_level: item.complexity_level || '',
    categories: Array.isArray(item.categories) 
      ? item.categories.map(cat => ({
          name: (cat as any)?.name || 'Uncategorized',
          slug: (cat as any)?.slug || 'uncategorized'
        }))
      : []
  }))

  return transformedData
}

export default async function AutomationsPage() {
  const automations = await getAutomations()
  console.log('Automations before grouping:', automations)
  
  const byCategory = automations.reduce((acc, automation) => {
    const categoryName = (() => {
      if (Array.isArray(automation.categories) && automation.categories.length > 0) {
        const firstCategory = automation.categories[0]
        return (typeof firstCategory === 'object' && firstCategory !== null && 'name' in firstCategory) 
          ? firstCategory.name 
          : 'Uncategorized'
      }
      return 'Uncategorized'
    })()

    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(automation)
    return acc
  }, {} as Record<string, Automation[]>)
  
  console.log('Grouped automations:', byCategory)

  return (
    <div className="container py-8">
      <div className="space-y-12">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
              <p className="text-muted-foreground">
                Explore our {category.toLowerCase()} automations
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((automation) => (
                <AutomationCard 
                  key={automation.id} 
                  id={automation.id}
                  name={automation.name}
                  description={automation.description}
                  businessProblem={automation.business_problem}
                  toolsIntegrated={automation.tools_integrated}
                  estimatedTimeSavedHours={automation.estimated_time_saved_hours}
                  featuredImage={automation.featured_image}
                  category={automation.category}
                  subcategory={automation.subcategory}
                  setupTimeMinutes={automation.setup_time_minutes}
                  priceMonthly={automation.price_monthly}
                  priceYearly={automation.price_yearly}
                  complexityLevel={automation.complexity_level}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
