"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PublicHeroSlide } from "@/lib/public/types";
import { cn } from "@/lib/utils";

type HomeHeroSliderProps = {
  slides: PublicHeroSlide[];
  dir: "rtl" | "ltr";
};

export function HomeHeroSlider({ slides, dir }: HomeHeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const PreviousIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  function goTo(index: number) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="relative aspect-[16/9] max-h-[78vh] w-full sm:aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSlide.imageUrl}
          alt={activeSlide.imageAlt}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {activeSlide.title}
            </h1>
            {activeSlide.subtitle ? (
              <p className="text-base leading-7 text-white/85 sm:text-lg">
                {activeSlide.subtitle}
              </p>
            ) : null}
            {activeSlide.primaryHref && activeSlide.primaryLabel ? (
              <Button
                asChild
                size="lg"
                className="bg-[var(--public-button)] text-white hover:bg-[var(--public-button)]/90"
              >
                <Link href={activeSlide.primaryHref} prefetch>
                  {activeSlide.primaryLabel}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              className="absolute top-1/2 start-4 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/65"
              onClick={() => goTo(activeIndex - 1)}
            >
              <PreviousIcon className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="absolute top-1/2 end-4 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/65"
              onClick={() => goTo(activeIndex + 1)}
            >
              <NextIcon className="size-5" />
            </button>

            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  className={cn(
                    "size-2.5 rounded-full transition",
                    index === activeIndex ? "bg-white" : "bg-white/45",
                  )}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
