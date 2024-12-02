import { Star, StarHalf } from "lucide-react"

interface StarRatingProps {
  rating: number
  reviewCount: number
  className?: string
}

export function StarRating({ rating, reviewCount, className = "" }: StarRatingProps) {
  // Convert rating to nearest half star
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            )
          } else if (i === fullStars && hasHalfStar) {
            return (
              <StarHalf
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            )
          }
          return (
            <Star
              key={i}
              className="w-4 h-4 text-gray-300"
            />
          )
        })}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  )
}
