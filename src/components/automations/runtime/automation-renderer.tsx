import { useEffect, useState } from 'react'
import { getComponent } from './registry'
import { AutomationUIConfig, AutomationUIComponent } from '@/types/automation-ui'
import { createClient } from '@supabase/supabase-js'

interface AutomationRendererProps {
  automationId: string
  config: AutomationUIConfig
  initialData?: Record<string, any>
}

export function AutomationRenderer({
  automationId,
  config,
  initialData = {},
}: AutomationRendererProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Set up real-time updates if needed
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`automation-${automationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_data',
          filter: `automation_id=eq.${automationId}`,
        },
        (payload) => {
          setData((prev) => ({
            ...prev,
            ...payload.new,
          }))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [automationId])

  // Handle component actions
  const handleAction = async (action: any) => {
    setLoading(true)
    try {
      switch (action.handler.type) {
        case 'api':
          const response = await fetch(action.handler.config.url, {
            method: action.handler.config.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          const result = await response.json()
          setData((prev) => ({ ...prev, ...result }))
          break
        case 'state':
          setData((prev) => ({ ...prev, ...action.handler.config.stateUpdate }))
          break
        case 'custom':
          // Execute custom function from a predefined set of handlers
          break
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Render component based on layout type
  const renderLayout = () => {
    switch (config.layout.type) {
      case 'single':
        return renderComponent(config.layout.components[0])
      case 'split':
        return (
          <div className="grid grid-cols-2 gap-4">
            {config.layout.components.map((component) => (
              <div key={component.id}>{renderComponent(component)}</div>
            ))}
          </div>
        )
      case 'tabs':
        return (
          <div className="tabs">
            {config.layout.components.map((component) => (
              <div key={component.id} className="tab">
                {renderComponent(component)}
              </div>
            ))}
          </div>
        )
      case 'dashboard':
        return (
          <div className="grid grid-cols-12 gap-4">
            {config.layout.components.map((component) => (
              <div
                key={component.id}
                className="col-span-12"
                style={{
                  gridColumn: `span ${component.position?.width || 12}`,
                  gridRow: `span ${component.position?.height || 1}`,
                }}
              >
                {renderComponent(component)}
              </div>
            ))}
          </div>
        )
    }
  }

  // Render individual component
  const renderComponent = (component: AutomationUIComponent) => {
    // Check visibility conditions
    if (component.visibility?.conditions) {
      const visible = component.visibility.conditions.every((condition) => {
        const fieldValue = data[condition.field]
        switch (condition.operator) {
          case 'eq':
            return fieldValue === condition.value
          case 'neq':
            return fieldValue !== condition.value
          case 'gt':
            return fieldValue > condition.value
          case 'lt':
            return fieldValue < condition.value
          case 'contains':
            return fieldValue?.includes(condition.value)
          case 'exists':
            return fieldValue !== undefined
          default:
            return true
        }
      })

      if (!visible) return null
    }

    const Component = getComponent(component.type)
    if (!Component) return null

    return (
      <Component
        key={component.id}
        config={component.config}
        data={component.data?.source === 'state' ? data[component.data.stateKey!] : component.data?.value}
        onAction={handleAction}
        loading={loading}
        error={error}
      />
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div
      className="automation-renderer"
      style={{
        '--primary-color': config.theme?.primary,
        '--secondary-color': config.theme?.secondary,
        '--accent-color': config.theme?.accent,
      } as React.CSSProperties}
    >
      {renderLayout()}
    </div>
  )
}
