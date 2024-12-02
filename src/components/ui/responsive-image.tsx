import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResponsiveImageProps {
  src: string
  alt: string
  aspectRatio?: "square" | "video" | "wide"
  className?: string
}

export function ResponsiveImage({ 
  src, 
  alt, 
  aspectRatio = "video",
  className 
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[2/1]"
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg bg-muted",
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-all hover:scale-105"
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
      />
    </div>
  )
}
