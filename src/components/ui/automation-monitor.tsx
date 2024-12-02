import { useEffect, useState } from "react"
import { Card } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"
import { createClient } from "@supabase/supabase-js"

interface AutomationStatus {
  id: string
  status: "running" | "paused" | "error" | "completed"
  lastRun: string
  nextRun: string
  metrics: {
    successCount: number
    errorCount: number
    totalRuns: number
  }
}

interface AutomationMonitorProps {
  automationId: string
  name: string
  description: string
}

export function AutomationMonitor({
  automationId,
  name,
  description,
}: AutomationMonitorProps) {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch initial status
        const response = await fetch(`/api/automations/${automationId}/status`)
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error fetching automation status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up real-time updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`automation-${automationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "automation_runs",
          filter: `automation_id=eq.${automationId}`,
        },
        (payload) => {
          // Update status when new data comes in
          setStatus((prev) => ({
            ...prev!,
            ...payload.new,
          }))
        }
      )
      .subscribe()

    fetchStatus()

    return () => {
      channel.unsubscribe()
    }
  }, [automationId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "paused":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Badge className={getStatusColor(status?.status || "unknown")}>
          {status?.status || "Unknown"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {status?.metrics.successCount || 0}
          </div>
          <div className="text-sm text-gray-500">Successful Runs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {status?.metrics.errorCount || 0}
          </div>
          <div className="text-sm text-gray-500">Errors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {status?.metrics.totalRuns || 0}
          </div>
          <div className="text-sm text-gray-500">Total Runs</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last Run</span>
          <span>{status?.lastRun || "Never"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Next Run</span>
          <span>{status?.nextRun || "Not scheduled"}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" size="sm">
          View Logs
        </Button>
        <Button variant="outline" size="sm">
          Configure
        </Button>
        {status?.status === "running" ? (
          <Button variant="destructive" size="sm">
            Pause
          </Button>
        ) : (
          <Button variant="default" size="sm">
            Start
          </Button>
        )}
      </div>
    </Card>
  )
}
