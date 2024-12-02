export type AutomationUIComponentType =
  | "form"
  | "table"
  | "chart"
  | "calendar"
  | "kanban"
  | "timeline"
  | "stats"
  | "fileUpload"
  | "dataGrid"
  | "wizard"
  | "dashboard"

export interface AutomationUIConfig {
  id: string
  version: string
  layout: {
    type: "single" | "split" | "tabs" | "dashboard"
    components: AutomationUIComponent[]
  }
  theme?: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface AutomationUIComponent {
  id: string
  type: AutomationUIComponentType
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
  config: {
    title?: string
    description?: string
    [key: string]: any
  }
  data?: {
    source: "api" | "state" | "static"
    endpoint?: string
    stateKey?: string
    value?: any
    refreshInterval?: number
  }
  actions?: AutomationUIAction[]
  visibility?: {
    roles?: string[]
    conditions?: AutomationUICondition[]
  }
}

export interface AutomationUIAction {
  id: string
  type: "button" | "link" | "submit" | "custom"
  label: string
  style?: "primary" | "secondary" | "destructive" | "ghost"
  handler: {
    type: "api" | "navigation" | "state" | "custom"
    config: {
      method?: string
      url?: string
      stateUpdate?: Record<string, any>
      customFunction?: string
    }
  }
}

export interface AutomationUICondition {
  field: string
  operator: "eq" | "neq" | "gt" | "lt" | "contains" | "exists"
  value: any
}
