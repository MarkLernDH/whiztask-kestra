import { NextRequest, NextResponse } from 'next/server';

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;

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
