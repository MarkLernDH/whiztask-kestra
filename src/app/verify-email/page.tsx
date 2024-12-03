'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent you a verification link. Please check your email to verify your account.
        </p>
        
        <div className="mt-8">
          <Link href="/signin">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
