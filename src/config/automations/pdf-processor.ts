import { AutomationUIConfig } from '@/types/automation-ui'

export const pdfProcessorConfig: AutomationUIConfig = {
  id: 'pdf-processor',
  version: '1.0',
  layout: {
    type: 'dashboard',
    components: [
      // Stats Component
      {
        id: 'processing-stats',
        type: 'stats',
        position: { x: 0, y: 0, width: 12, height: 1 },
        config: {
          title: 'Processing Statistics',
          stats: [
            { label: 'PDFs Processed', key: 'processed_count' },
            { label: 'Success Rate', key: 'success_rate' },
            { label: 'Average Processing Time', key: 'avg_processing_time' }
          ]
        },
        data: {
          source: 'api',
          endpoint: '/api/automations/pdf-processor/stats',
          refreshInterval: 30000
        }
      },
      
      // File Upload Component
      {
        id: 'file-input',
        type: 'form',
        position: { x: 0, y: 1, width: 4, height: 2 },
        config: {
          title: 'Process New PDF',
          description: 'Upload a PDF or connect to cloud storage',
          fields: [
            {
              id: 'source_type',
              type: 'select',
              label: 'Source Type',
              options: [
                { value: 'upload', label: 'Upload File' },
                { value: 'gdrive', label: 'Google Drive' },
                { value: 'dropbox', label: 'Dropbox' }
              ],
              required: true
            },
            {
              id: 'file_upload',
              type: 'fileUpload',
              label: 'Upload PDF',
              accept: '.pdf',
              maxSize: 10485760, // 10MB
              visibility: {
                conditions: [
                  { field: 'source_type', operator: 'eq', value: 'upload' }
                ]
              }
            },
            {
              id: 'cloud_path',
              type: 'text',
              label: 'File Path/ID',
              visibility: {
                conditions: [
                  { field: 'source_type', operator: 'neq', value: 'upload' }
                ]
              }
            },
            {
              id: 'destination_type',
              type: 'select',
              label: 'Output Format',
              options: [
                { value: 'gsheets', label: 'Google Sheets' },
                { value: 'excel', label: 'Excel File' }
              ],
              required: true
            },
            {
              id: 'destination_path',
              type: 'text',
              label: 'Destination Path/ID',
              required: true
            }
          ],
          actions: [
            {
              id: 'process',
              label: 'Process PDF',
              style: 'primary',
              handler: {
                type: 'api',
                config: {
                  method: 'POST',
                  url: '/api/automations/pdf-processor/process'
                }
              }
            }
          ]
        }
      },

      // Recent Processes Table
      {
        id: 'recent-processes',
        type: 'dataGrid',
        position: { x: 4, y: 1, width: 8, height: 2 },
        config: {
          title: 'Recent Processes',
          columns: [
            { field: 'filename', header: 'File Name', type: 'text' },
            { field: 'source_type', header: 'Source', type: 'text' },
            { field: 'destination_type', header: 'Output', type: 'text' },
            { field: 'status', header: 'Status', type: 'status' },
            { field: 'processed_at', header: 'Processed', type: 'date' },
            { field: 'actions', header: 'Actions', type: 'actions' }
          ],
          actions: [
            { label: 'View Output', handler: 'viewOutput', style: 'secondary' },
            { label: 'Retry', handler: 'retryProcess', style: 'secondary' }
          ],
          filters: [
            { field: 'status', type: 'select', label: 'Status' },
            { field: 'filename', type: 'text', label: 'Search Files' }
          ]
        },
        data: {
          source: 'api',
          endpoint: '/api/automations/pdf-processor/history',
          refreshInterval: 10000
        }
      }
    ]
  },
  theme: {
    primary: '#0099FF',
    secondary: '#6B7280',
    accent: '#10B981'
  }
}
