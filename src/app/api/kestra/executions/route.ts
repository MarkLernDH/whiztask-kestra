import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { namespace, flowId, inputs } = body;

    // Get Google credentials from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: credentials, error: credentialsError } = await supabase
      .from('user_credentials')
      .select('access_token')
      .eq('user_id', inputs.user_id)
      .eq('provider', 'google')
      .single();

    if (credentialsError || !credentials) {
      return NextResponse.json(
        { error: 'Failed to retrieve Google credentials' },
        { status: 400 }
      );
    }

    // Start Kestra workflow execution
    const response = await fetch(`${KESTRA_API_URL}/api/v1/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace,
        flowId,
        inputs: {
          ...inputs,
          google_access_token: credentials.access_token,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start Kestra workflow');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error starting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to start workflow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('id');

    if (!executionId) {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${KESTRA_API_URL}/api/v1/executions/${executionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch execution status');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching execution status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution status' },
      { status: 500 }
    );
  }
}
