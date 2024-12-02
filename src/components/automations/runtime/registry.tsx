import dynamic from 'next/dynamic'
import { AutomationUIComponentType } from '@/types/automation-ui'

// Dynamically import components to reduce initial bundle size
const components: Record<AutomationUIComponentType, React.ComponentType<any>> = {
  form: dynamic(() => import('./components/form').then(mod => mod.AutomationForm)),
  table: dynamic(() => import('./components/table').then(mod => mod.AutomationTable)),
  chart: dynamic(() => import('./components/chart').then(mod => mod.AutomationChart)),
  calendar: dynamic(() => import('./components/calendar').then(mod => mod.AutomationCalendar)),
  kanban: dynamic(() => import('./components/kanban').then(mod => mod.AutomationKanban)),
  timeline: dynamic(() => import('./components/timeline').then(mod => mod.AutomationTimeline)),
  stats: dynamic(() => import('./components/stats').then(mod => mod.AutomationStats)),
  fileUpload: dynamic(() => import('./components/file-upload').then(mod => mod.AutomationFileUpload)),
  dataGrid: dynamic(() => import('./components/data-grid').then(mod => mod.AutomationDataGrid)),
  wizard: dynamic(() => import('./components/wizard').then(mod => mod.AutomationWizard)),
  dashboard: dynamic(() => import('./components/dashboard').then(mod => mod.AutomationDashboard))
}

export function getComponent(type: AutomationUIComponentType) {
  return components[type]
}
