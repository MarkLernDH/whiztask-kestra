import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'

export interface AutomationCardProps {
  id: string
  name: string
  description: string
  businessProblem: string
  toolsIntegrated: string[]
  estimatedTimeSavedHours: number
  featuredImage?: string | null
  category: string
  subcategory: string
  setupTimeMinutes: number
  priceMonthly: number
  priceYearly: number
  complexityLevel: string
  rating?: number
  reviewCount?: number
  author?: {
    name: string
    avatar: string
  }
  isFeatured?: boolean
}

export function AutomationCard({
  id,
  name,
  description,
  featuredImage,
  category,
  rating = 0,
  reviewCount = 0,
  priceMonthly,
  author,
  isFeatured = false,
}: AutomationCardProps) {
  const defaultImage = '/images/automation-placeholder.jpg'

  return (
    <Link href={`/automations/${id}`} className="group h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md">
        {isFeatured && (
          <div className="absolute left-0 top-4 z-10 bg-emerald-500 px-3 py-1 text-sm font-medium text-white">
            Featured
          </div>
        )}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={featuredImage || defaultImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div className="space-y-2">
            <span className="text-sm text-gray-600">{category}</span>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {name}
            </h3>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-gray-600">({reviewCount} Reviews)</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            {author && (
              <div className="flex items-center gap-2">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm text-gray-700">{author.name}</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-sm text-gray-600">Starting at:</span>
              <p className="text-lg font-semibold text-gray-900">${priceMonthly}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
