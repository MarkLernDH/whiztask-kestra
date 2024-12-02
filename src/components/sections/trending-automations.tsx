'use client'

import { AutomationGrid } from '@/components/ui/automation-grid'
import type { AutomationCardProps } from '@/components/ui/automation-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

// This will be replaced with actual data from Supabase
const SAMPLE_AUTOMATIONS: AutomationCardProps[] = [
  {
    id: '1',
    name: 'Automated Customer Support Workflow',
    description: 'Streamline customer support with AI-powered responses',
    businessProblem: 'Slow customer response times',
    toolsIntegrated: ['Zendesk', 'Slack', 'GPT-4'],
    estimatedTimeSavedHours: 20,
    featuredImage: '/images/automations/customer-support.jpg',
    category: 'Customer Support',
    subcategory: 'Ticket Management',
    setupTimeMinutes: 30,
    priceMonthly: 49,
    priceYearly: 490,
    complexityLevel: 'Medium',
    rating: 4.8,
    reviewCount: 156,
    author: {
      name: 'Sarah Chen',
      avatar: '/images/avatars/sarah.jpg'
    },
    isFeatured: true
  },
  {
    id: '2',
    name: 'Sales Pipeline Automation',
    description: 'Automate lead nurturing and follow-ups',
    businessProblem: 'Manual sales follow-ups',
    toolsIntegrated: ['Salesforce', 'Gmail', 'LinkedIn'],
    estimatedTimeSavedHours: 15,
    featuredImage: '/images/automations/sales-pipeline.jpg',
    category: 'Sales',
    subcategory: 'Lead Management',
    setupTimeMinutes: 45,
    priceMonthly: 59,
    priceYearly: 590,
    complexityLevel: 'Advanced',
    rating: 4.7,
    reviewCount: 98,
    author: {
      name: 'Michael Rodriguez',
      avatar: '/images/avatars/michael.jpg'
    }
  },
  {
    id: '3',
    name: 'Social Media Content Scheduler',
    description: 'Schedule and automate social media posts',
    businessProblem: 'Inconsistent social media presence',
    toolsIntegrated: ['Buffer', 'Canva', 'Instagram'],
    estimatedTimeSavedHours: 10,
    featuredImage: '/images/automations/social-media.jpg',
    category: 'Marketing',
    subcategory: 'Social Media',
    setupTimeMinutes: 20,
    priceMonthly: 39,
    priceYearly: 390,
    complexityLevel: 'Beginner',
    rating: 4.9,
    reviewCount: 234,
    author: {
      name: 'Emma Thompson',
      avatar: '/images/avatars/emma.jpg'
    }
  },
  {
    id: '4',
    name: 'Invoice Processing Automation',
    description: 'Automate invoice processing and approvals',
    businessProblem: 'Slow invoice processing',
    toolsIntegrated: ['QuickBooks', 'DocuSign', 'Gmail'],
    estimatedTimeSavedHours: 25,
    featuredImage: '/images/automations/invoice.jpg',
    category: 'Finance',
    subcategory: 'Accounting',
    setupTimeMinutes: 60,
    priceMonthly: 69,
    priceYearly: 690,
    complexityLevel: 'Medium',
    rating: 4.6,
    reviewCount: 167,
    author: {
      name: 'David Kim',
      avatar: '/images/avatars/david.jpg'
    }
  }
]

const CATEGORIES = [
  'All',
  'Customer Support',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations'
]

export function TrendingAutomations() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredAutomations = selectedCategory === 'All'
    ? SAMPLE_AUTOMATIONS
    : SAMPLE_AUTOMATIONS.filter(automation => automation.category === selectedCategory)

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[90rem] py-16 px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trending Automations and Workflows
          </h2>
          <p className="text-lg text-gray-600">
            Most popular and all-time top-selling automations
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full h-9 px-5 text-sm font-medium"
            >
              {category}
            </Button>
          ))}
        </div>

        <AutomationGrid automations={filteredAutomations} />

        {/* Marketplace button */}
        <div className="mt-12 text-center">
          <Link href="/marketplace">
            <Button
              variant="default"
              className="h-[3.25rem] px-8 text-base font-medium rounded-xl border-2 border-black bg-black text-white hover:bg-gray-900 hover:text-white hover:border-gray-900"
            >
              Explore All Automations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
