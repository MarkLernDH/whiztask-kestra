'use client';

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AutomationCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  creator: {
    name: string
    avatar: string
    rating: number
    totalReviews: number
  }
  stats: {
    timeSaved: number
    setupTime: number
    totalRuns: number
  }
}

export function AutomationCard({
  id,
  title,
  description,
  price,
  category,
  creator,
  stats,
}: AutomationCardProps) {
  return (
    <Link href={`/marketplace/${id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
              {category}
            </span>
            <span>•</span>
            <span>${price}/mo</span>
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground line-clamp-2">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback>
                {creator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{creator.name}</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {creator.rating} ({creator.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="font-medium">{stats.timeSaved}min</p>
              <p className="text-muted-foreground">Time Saved</p>
            </div>
            <div>
              <p className="font-medium">{stats.setupTime}min</p>
              <p className="text-muted-foreground">Setup Time</p>
            </div>
            <div>
              <p className="font-medium">{stats.totalRuns.toLocaleString()}</p>
              <p className="text-muted-foreground">Total Runs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
