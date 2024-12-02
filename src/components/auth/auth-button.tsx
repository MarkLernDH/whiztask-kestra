'use client';

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

function clearSupabaseCookies() {
  const cookieNames = document.cookie.split('; ').map(cookie => cookie.split('=')[0]);
  cookieNames.forEach(name => {
    if (name.includes('supabase') || name.includes('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

export default function AuthButton() {
  const supabase = createClientComponentClient();

  const handleAuth = async () => {
    try {
      // Clear any existing Supabase cookies
      clearSupabaseCookies();
      
      // Clear any existing sessions
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      });

      if (error) {
        console.error('Auth error:', error);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <Button onClick={handleAuth} variant="default">
      Continue with Google
    </Button>
  );
}

export function SignOutButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Button onClick={handleSignOut} variant="outline">
      Sign out
    </Button>
  );
}
