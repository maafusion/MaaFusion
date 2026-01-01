import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageHoverCarouselProps {
    images: string[];
    alt: string;
    className?: string;
}

export function ImageHoverCarousel({ images, alt, className }: ImageHoverCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Start from the second image immediately
        let index = 0;
        setCurrentIndex(1 % images.length);

        // Start cycling through images
        intervalRef.current = setInterval(() => {
            index = (index + 1) % images.length;
            setCurrentIndex((index + 1) % images.length);
        }, 500); // Change image every 500ms
    };

    const handleMouseLeave = () => {
        // Stop cycling and reset to first image
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setCurrentIndex(0);
    };

    return (
        <div
            className={cn("relative overflow-hidden w-full h-full", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {images.map((image, index) => (
                <img
                    key={image}
                    src={image}
                    alt={`${alt} ${index + 1}`}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        index === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0"
                    )}
                />
            ))}
        </div>
    );
}
