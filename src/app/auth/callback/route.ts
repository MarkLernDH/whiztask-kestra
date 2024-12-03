import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      console.error('No code parameter received');
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL(`/?error=${error.message}`, request.url));
    }

    // Successful authentication, redirect to home page with absolute URL
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/?error=unknown', request.url));
  }
}
