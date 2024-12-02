import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AutomationCard } from "@/components/automations/marketplace/AutomationCard"

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: automations } = await supabase
    .from('automations')
    .select(`
      *,
      category:categories(name)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Automation Marketplace</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Pre-built automations from verified creators
            </p>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              All
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Automations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations?.map((automation) => (
              <AutomationCard
                key={automation.id}
                id={automation.id}
                title={automation.title}
                description={automation.description}
                price={automation.price}
                category={automation.category?.name || ""}
                creator={{
                  name: "WhizTask Team",
                  avatar: "/api/avatar?seed=whiztask",
                  rating: 5.0,
                  totalReviews: 50
                }}
                stats={{
                  timeSaved: automation.stats.avg_processing_time || 15,
                  setupTime: 10,
                  totalRuns: automation.stats.documents_processed || 1000
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
