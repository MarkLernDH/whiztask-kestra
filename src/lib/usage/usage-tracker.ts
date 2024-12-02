import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

export interface UsageMetrics {
  workflow_id: string;
  user_id: string;
  execution_id: string;
  api_calls: number;
  data_processed: number;
  records_processed: number;
}

export interface UsageLimits {
  executions: number;
  api_calls: number;
  data_processed: number;
  records_processed: number;
}

export class UsageTracker {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async trackExecution(metrics: UsageMetrics) {
    const { data, error } = await this.supabase
      .from('usage_metrics')
      .insert({
        workflow_id: metrics.workflow_id,
        user_id: metrics.user_id,
        execution_id: metrics.execution_id,
        api_calls: metrics.api_calls,
        data_processed: metrics.data_processed,
        records_processed: metrics.records_processed,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to track usage: ${error.message}`);
    }

    return data;
  }

  async updateExecutionMetrics(executionId: string, metrics: Partial<UsageMetrics>) {
    const { data, error } = await this.supabase
      .from('usage_metrics')
      .update({
        ...metrics,
        end_time: new Date().toISOString(),
      })
      .eq('execution_id', executionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update usage metrics: ${error.message}`);
    }

    return data;
  }

  async getCurrentUsage(userId: string, period: 'day' | 'month' = 'month') {
    const startDate = new Date();
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 1);
    }

    const { data, error } = await this.supabase
      .from('usage_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString());

    if (error) {
      throw new Error(`Failed to get current usage: ${error.message}`);
    }

    return data.reduce(
      (acc, metric) => ({
        executions: acc.executions + 1,
        api_calls: acc.api_calls + (metric.api_calls || 0),
        data_processed: acc.data_processed + (metric.data_processed || 0),
        records_processed: acc.records_processed + (metric.records_processed || 0),
      }),
      { executions: 0, api_calls: 0, data_processed: 0, records_processed: 0 }
    );
  }

  async checkUsageLimits(userId: string, workflowId: string): Promise<boolean> {
    // Get user's subscription
    const { data: subscription, error: subError } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      throw new Error('No active subscription found');
    }

    // Get current usage
    const currentUsage = await this.getCurrentUsage(userId);
    const limits = subscription.usage_limits as UsageLimits;

    // Check if any limits are exceeded
    if (
      currentUsage.executions >= limits.executions ||
      currentUsage.api_calls >= limits.api_calls ||
      currentUsage.data_processed >= limits.data_processed ||
      currentUsage.records_processed >= limits.records_processed
    ) {
      return false;
    }

    return true;
  }
}
