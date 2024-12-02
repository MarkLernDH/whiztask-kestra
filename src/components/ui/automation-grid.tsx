import { AutomationCard } from './automation-card'
import type { AutomationCardProps } from './automation-card'

interface AutomationGridProps {
  automations: AutomationCardProps[]
  title?: string
  showingCount?: boolean
  totalCount?: number
}

export function AutomationGrid({
  automations,
  title,
  showingCount = false,
  totalCount,
}: AutomationGridProps) {
  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        {title && <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>}
        {showingCount && (
          <p className="text-sm text-gray-600">
            Showing {1} – {automations.length} of {totalCount || automations.length} results
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {automations.map((automation) => (
          <AutomationCard key={automation.id} {...automation} />
        ))}
      </div>
    </div>
  )
}
