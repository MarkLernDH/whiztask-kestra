export class KestraClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-Kestra-Api-Key': this.apiKey }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Kestra API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createFlow(namespace: string, template: string, inputs: Record<string, any>) {
    return this.fetch('/api/v1/flows', {
      method: 'POST',
      body: JSON.stringify({
        namespace,
        template,
        inputs,
      }),
    });
  }

  async getFlowStatus(namespace: string, flowId: string) {
    return this.fetch(`/api/v1/flows/${namespace}/${flowId}/status`);
  }

  async listTemplates(namespace: string) {
    return this.fetch(`/api/v1/templates/${namespace}`);
  }

  async getTemplate(namespace: string, templateId: string) {
    return this.fetch(`/api/v1/templates/${namespace}/${templateId}`);
  }
}

// Create a singleton instance
export const kestraClient = new KestraClient(
  process.env.NEXT_PUBLIC_KESTRA_URL || 'http://localhost:8080',
  process.env.KESTRA_API_KEY
);
