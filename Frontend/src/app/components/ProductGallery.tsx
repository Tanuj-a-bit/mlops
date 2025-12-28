"use client";

import { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'motion/react';
import { useGesture } from '@use-gesture/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from './ui/button';

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const bind = useGesture({
        onDrag: ({ swipe: [swipeX] }) => {
            if (swipeX === -1) handleNext();
            if (swipeX === 1) handlePrev();
        },
    });

    return (
        <div className="space-y-4">
            {/* Main Image with Zoom and Swipe */}
            <div
                ref={containerRef}
                className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-2xl group"
                {...bind()}
            >
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={3}
                    centerOnInit
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <div className="absolute top-4 right-16 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full shadow-lg h-10 w-10"
                                    onClick={() => zoomIn()}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </Button>
                            </div>

                            <TransformComponent
                                wrapperStyle={{ width: '100%', height: '100%' }}
                                contentStyle={{ width: '100%', height: '100%' }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full"
                                    >
                                        <ImageWithFallback
                                            src={images[currentIndex]}
                                            alt={`${name} - Image ${currentIndex + 1}`}
                                            className="w-full h-full object-cover select-none"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>

                {/* Navigation Arrows (Visible on Hover/Desktop) */}
                <div className="absolute inset-y-0 left-4 flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg"
                        onClick={handlePrev}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </div>
                <div className="absolute inset-y-0 right-4 flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg"
                        onClick={handleNext}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentIndex(i)}
                        className={`aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer border-2 transition-colors ${i === currentIndex ? 'border-primary shadow-md' : 'border-transparent'
                            }`}
                    >
                        <ImageWithFallback
                            src={img}
                            alt={`${name} thumbnail ${i + 1}`}
                            className={`w-full h-full object-cover transition-opacity ${i === currentIndex ? 'opacity-100' : 'opacity-60'
                                }`}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
