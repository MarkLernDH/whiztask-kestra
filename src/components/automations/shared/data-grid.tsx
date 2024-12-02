import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface DataGridProps {
  config: {
    title: string
    columns: Array<{
      field: string
      header: string
      type: 'text' | 'number' | 'date' | 'status' | 'actions'
      width?: number
    }>
    actions?: Array<{
      label: string
      handler: string
      style?: 'primary' | 'secondary' | 'destructive'
    }>
    filters?: Array<{
      field: string
      type: 'text' | 'select' | 'date'
      label: string
    }>
  }
  data: any[]
  onAction: (action: any) => void
  loading?: boolean
  error?: Error | null
}

export function AutomationDataGrid({
  config,
  data,
  onAction,
  loading,
  error,
}: DataGridProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const filteredData = data.filter((row) => {
    return Object.entries(filters).every(([field, value]) => {
      if (!value) return true
      const rowValue = row[field]?.toString().toLowerCase()
      return rowValue?.includes(value.toString().toLowerCase())
    })
  })

  const renderCell = (row: any, column: any) => {
    switch (column.type) {
      case 'status':
        return (
          <Badge
            variant={
              row[column.field] === 'active'
                ? 'success'
                : row[column.field] === 'error'
                ? 'destructive'
                : 'secondary'
            }
          >
            {row[column.field]}
          </Badge>
        )
      case 'actions':
        return config.actions?.map((action) => (
          <Button
            key={action.label}
            variant={action.style || 'secondary'}
            size="sm"
            onClick={() => onAction({ type: action.handler, data: row })}
          >
            {action.label}
          </Button>
        ))
      default:
        return row[column.field]
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{config.title}</h3>

      {config.filters && (
        <div className="flex gap-4 mb-4">
          {config.filters.map((filter) => (
            <div key={filter.field}>
              <Input
                placeholder={filter.label}
                onChange={(e) =>
                  handleFilterChange(filter.field, e.target.value)
                }
                value={filters[filter.field] || ''}
              />
            </div>
          ))}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {config.columns.map((column) => (
              <TableHead
                key={column.field}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((row, i) => (
            <TableRow key={i}>
              {config.columns.map((column) => (
                <TableCell key={column.field}>
                  {renderCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
