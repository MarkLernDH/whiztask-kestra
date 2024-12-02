"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Play, Maximize2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface AutomationMediaCarouselProps {
  media: {
    type: "image" | "video"
    url: string
    thumbnail?: string
  }[]
}

export function AutomationMediaCarousel({ media }: AutomationMediaCarouselProps) {
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  if (!media?.length) {
    return (
      <Card className="relative aspect-video w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-sm text-muted-foreground">No media available</p>
        </div>
      </Card>
    )
  }

  const handleMediaClick = (index: number) => {
    setSelectedMedia(index)
    if (media[index].type === "video") {
      setIsPlaying(true)
    }
  }

  const handleClose = () => {
    setSelectedMedia(null)
    setIsPlaying(false)
  }

  return (
    <>
      <Carousel className="w-full">
        <CarouselContent>
          {media.map((item, index) => (
            <CarouselItem key={index}>
              <div className="group relative aspect-video w-full overflow-hidden rounded-lg">
                {item.type === "image" ? (
                  <>
                    <Image
                      src={item.url}
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => handleMediaClick(index)}
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative h-full w-full">
                      <Image
                        src={item.thumbnail || item.url}
                        alt={`Video thumbnail ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => handleMediaClick(index)}
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Dialog open={selectedMedia !== null} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-screen-lg p-0 overflow-hidden">
          {selectedMedia !== null && media[selectedMedia].type === "image" ? (
            <div className="relative aspect-[16/9]">
              <Image
                src={media[selectedMedia].url}
                alt={`Media ${selectedMedia + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            selectedMedia !== null && (
              <video
                src={media[selectedMedia].url}
                controls
                autoPlay={isPlaying}
                className="aspect-[16/9] w-full"
                poster={media[selectedMedia].thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
