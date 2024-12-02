import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

export interface BillingEvent {
  userId: string;
  type: 'subscription_renewal' | 'usage_excess';
  amount: number;
  details: {
    tier?: string;
    usage?: {
      executions: number;
      apiCalls: number;
      dataProcessed: number;
      recordsProcessed: number;
    };
  };
}

export class BillingService {
  private stripe: Stripe;
  private supabase;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async createCustomer(userId: string, email: string) {
    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        user_id: userId,
      },
    });

    // Store customer ID in Supabase
    const { error } = await this.supabase
      .from('billing_customers')
      .insert({
        user_id: userId,
        stripe_customer_id: customer.id,
      });

    if (error) {
      throw new Error(`Failed to store customer: ${error.message}`);
    }

    return customer;
  }

  async createSubscription(userId: string, priceId: string) {
    // Get customer ID
    const { data: customer, error } = await this.supabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (error || !customer) {
      throw new Error('Customer not found');
    }

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customer.stripe_customer_id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription in Supabase
    await this.supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

    return subscription;
  }

  async recordUsage(event: BillingEvent) {
    // Get subscription info
    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .select('stripe_subscription_id, usage_item_id')
      .eq('user_id', event.userId)
      .single();

    if (error || !subscription) {
      throw new Error('Subscription not found');
    }

    // Record usage in Stripe
    await this.stripe.subscriptionItems.createUsageRecord(
      subscription.usage_item_id,
      {
        quantity: event.details.usage?.executions || 0,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      }
    );

    // Store usage record in Supabase
    await this.supabase.from('usage_records').insert({
      user_id: event.userId,
      type: event.type,
      amount: event.amount,
      details: event.details,
    });
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handleSuccessfulPayment(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    await this.supabase
      .from('subscriptions')
      .update({ status: 'active', last_payment_status: 'succeeded' })
      .eq('stripe_subscription_id', invoice.subscription);
  }

  private async handleFailedPayment(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    await this.supabase
      .from('subscriptions')
      .update({ status: 'past_due', last_payment_status: 'failed' })
      .eq('stripe_subscription_id', invoice.subscription);
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    await this.supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id);
  }
}
