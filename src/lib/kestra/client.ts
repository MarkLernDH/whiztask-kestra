import { z } from 'zod'

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080/api/v1'

export const KestraTaskType = {
  PYTHON_SCRIPT: 'io.kestra.plugin.scripts.python.Script',
  NOTIFICATION: 'io.kestra.core.tasks.notifications.Teams',
} as const

export interface KestraTask {
  id: string
  type: string
  [key: string]: any
}

export interface KestraFlow {
  id: string
  namespace: string
  tasks: KestraTask[]
  inputs?: {
    name: string
    type: string
    required: boolean
    description?: string
  }[]
  [key: string]: any
}

export class KestraClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor(baseUrl = KESTRA_API_URL) {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  async createFlow(flow: KestraFlow): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/flows`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(flow),
    })

    if (!response.ok) {
      throw new Error(`Failed to create flow: ${await response.text()}`)
    }

    return response.json()
  }

  async updateFlow(flow: KestraFlow): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/flows/${flow.id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(flow),
    })

    if (!response.ok) {
      throw new Error(`Failed to update flow: ${await response.text()}`)
    }

    return response.json()
  }

  async deleteFlow(namespace: string, id: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/flows/${namespace}/${id}`,
      {
        method: 'DELETE',
        headers: this.headers,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete flow: ${await response.text()}`)
    }
  }

  async executeFlow(
    namespace: string,
    flowId: string,
    inputs?: Record<string, any>
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/executions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        namespace,
        flowId,
        inputs,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to execute flow: ${await response.text()}`)
    }

    return response.json()
  }

  async getExecution(id: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/executions/${id}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to get execution: ${await response.text()}`)
    }

    return response.json()
  }
}
