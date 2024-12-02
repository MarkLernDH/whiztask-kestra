'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@supabase/supabase-js'

interface NavbarProps {
  user?: User | null
}

export function Navbar({ user }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    {
      name: 'Browse the Marketplace',
      href: '/marketplace',
    },
    {
      name: 'About Us',
      href: '/about',
    },
    {
      name: 'How it Works',
      href: '/how-it-works',
    },
    {
      name: 'Resources',
      href: '/resources',
    },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
        {
          'bg-white/95 backdrop-blur-sm border-b border-gray-200': isScrolled,
          'bg-transparent': !isScrolled
        }
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/whiztask-logo.svg"
              alt="WhizTask"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-gray-900',
                  pathname === item.href
                    ? 'text-gray-900'
                    : 'text-gray-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/become-seller" className="hidden md:block">
            <Button
              variant="outline"
              className="h-9 rounded-full border-gray-300 px-4 text-sm font-medium hover:bg-gray-50"
            >
              Become a Seller
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name}
                    />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name
                        ?.split(' ')
                        ?.map((n: string) => n[0])
                        ?.join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="ghost"
                  className="h-9 px-4 text-sm font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="hidden md:block">
                <Button
                  variant="default"
                  className="h-9 rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-gray-900"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
