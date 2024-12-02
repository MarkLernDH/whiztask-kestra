import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleAuthProvider } from '@/components/providers/google-auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WhizTask - Automation Marketplace',
  description: 'Discover and implement powerful automation workflows for your business',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAuthProvider>
          <Navbar user={session?.user} />
          <main className="min-h-screen bg-white">
            {children}
          </main>
        </GoogleAuthProvider>
      </body>
    </html>
  )
}
