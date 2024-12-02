import axios from 'axios';

export interface KestraExecutionParams {
  namespace: string;
  flowId: string;
  inputs: Record<string, any>;
}

export class KestraService {
  private baseUrl: string;
  private auth: { username: string; password: string };

  constructor() {
    this.baseUrl = process.env.KESTRA_URL || 'http://localhost:8080';
    this.auth = {
      username: process.env.KESTRA_USERNAME || 'admin',
      password: process.env.KESTRA_PASSWORD || 'admin123'
    };
  }

  async startExecution(params: KestraExecutionParams) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/executions`, 
        {
          namespace: params.namespace,
          flowId: params.flowId,
          inputs: params.inputs
        },
        { 
          auth: this.auth,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Kestra Execution Error:', error);
      throw error;
    }
  }

  async getExecutionStatus(executionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/executions/${executionId}`,
        { 
          auth: this.auth,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Kestra Execution Status Error:', error);
      throw error;
    }
  }
}
