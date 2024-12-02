import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seed = searchParams.get('seed');
  
  if (!seed) {
    return new NextResponse('Seed parameter is required', { status: 400 });
  }

  const response = await fetch(
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  );

  const svg = await response.text();
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
