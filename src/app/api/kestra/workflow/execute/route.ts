import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflowId, namespace, inputs } = body;

    // Call Kestra API without authentication for local development
    const response = await fetch(`${process.env.KESTRA_API_URL}/api/v1/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace,
        flowId: workflowId,
        inputs,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      executionId: data.id,
      status: 'started',
    });
  } catch (error) {
    console.error('Failed to execute workflow:', error);
    return NextResponse.json(
      { error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}
