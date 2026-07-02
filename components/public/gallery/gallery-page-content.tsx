"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  filterGalleryImages,
  getGalleryCategoryTranslation,
  getGalleryImageAlt,
  getGalleryImageCaption,
  getGalleryPageLabels,
  getVisibleGalleryCategories,
  groupGalleryImagesByCategory,
} from "@/lib/public/gallery-content";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicGalleryImage, PublicGalleryPageData } from "@/lib/public/types";
import { cn } from "@/lib/utils";

type GalleryPageContentProps = {
  locale: PublicLocale;
  data: PublicGalleryPageData;
};

function GalleryImageTile({
  locale,
  image,
  labels,
  onOpen,
}: {
  locale: PublicLocale;
  image: PublicGalleryImage;
  labels: ReturnType<typeof getGalleryPageLabels>;
  onOpen: () => void;
}) {
  const alt = getGalleryImageAlt(locale, image, labels.openImage);
  const caption = getGalleryImageCaption(locale, image);
  const imageUrl = image.image?.publicUrl;

  if (!imageUrl) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border bg-card text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-primary)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-end justify-between gap-2">
          {caption ? (
            <p className="line-clamp-2 text-sm font-medium text-white">{caption}</p>
          ) : (
            <span className="sr-only">{alt}</span>
          )}
          {image.isFeatured ? (
            <Badge className="shrink-0 bg-[var(--public-primary)] text-white">
              {labels.featured}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function GalleryImageGrid({
  locale,
  images,
  labels,
  onOpenImage,
}: {
  locale: PublicLocale;
  images: PublicGalleryImage[];
  labels: ReturnType<typeof getGalleryPageLabels>;
  onOpenImage: (imageId: string) => void;
}) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
        <p className="text-muted-foreground">{labels.emptyCategory}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <GalleryImageTile
          key={image.id}
          locale={locale}
          image={image}
          labels={labels}
          onOpen={() => onOpenImage(image.id)}
        />
      ))}
    </div>
  );
}

export function GalleryPageContent({ locale, data }: GalleryPageContentProps) {
  const labels = getGalleryPageLabels(locale);
  const visibleCategories = useMemo(
    () => getVisibleGalleryCategories(data.categories, data.images),
    [data.categories, data.images],
  );
  const sections = useMemo(
    () => groupGalleryImagesByCategory(visibleCategories, data.images),
    [visibleCategories, data.images],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all",
  );
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  const filteredImages = useMemo(
    () => filterGalleryImages(data.images, selectedCategoryId),
    [data.images, selectedCategoryId],
  );

  const lightboxImages = filteredImages.filter((image) => image.image?.publicUrl);
  const lightboxIndex = lightboxImageId
    ? lightboxImages.findIndex((image) => image.id === lightboxImageId)
    : -1;
  const activeLightboxImage =
    lightboxIndex >= 0 ? lightboxImages[lightboxIndex] : null;

  if (sections.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
          <p className="text-muted-foreground">{labels.emptyGallery}</p>
        </div>
      </section>
    );
  }

  function openLightbox(imageId: string) {
    setLightboxImageId(imageId);
  }

  function showPreviousImage() {
    if (lightboxIndex <= 0) {
      return;
    }

    setLightboxImageId(lightboxImages[lightboxIndex - 1]?.id ?? null);
  }

  function showNextImage() {
    if (lightboxIndex < 0 || lightboxIndex >= lightboxImages.length - 1) {
      return;
    }

    setLightboxImageId(lightboxImages[lightboxIndex + 1]?.id ?? null);
  }

  return (
    <div className="pb-16">
      <section className="border-b bg-[var(--public-secondary)]/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.subtitle}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {labels.title}
          </h1>
        </div>
      </section>

      {visibleCategories.length > 0 ? (
        <section className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                selectedCategoryId === "all"
                  ? "border-[var(--public-primary)] bg-[var(--public-primary)] text-white"
                  : "hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]",
              )}
            >
              {labels.allCategories}
            </button>
            {visibleCategories.map((category) => {
              const name = getGalleryCategoryTranslation(
                locale,
                category.translations,
              )?.name;

              if (!name) {
                return null;
              }

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                    selectedCategoryId === category.id
                      ? "border-[var(--public-primary)] bg-[var(--public-primary)] text-white"
                      : "hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        {selectedCategoryId === "all" ? (
          sections.map(({ category, images }) => {
            const categoryContent = getGalleryCategoryTranslation(
              locale,
              category.translations,
            );
            const categoryName = categoryContent?.name?.trim();

            if (!categoryName) {
              return null;
            }

            return (
              <section key={category.id} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {categoryName}
                  </h2>
                  {categoryContent?.description ? (
                    <p className="text-muted-foreground max-w-3xl text-sm leading-7">
                      {categoryContent.description}
                    </p>
                  ) : null}
                </div>
                <GalleryImageGrid
                  locale={locale}
                  images={images}
                  labels={labels}
                  onOpenImage={openLightbox}
                />
              </section>
            );
          })
        ) : (
          <GalleryImageGrid
            locale={locale}
            images={filteredImages}
            labels={labels}
            onOpenImage={openLightbox}
          />
        )}
      </div>

      <Dialog
        open={activeLightboxImage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLightboxImageId(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl border-none bg-black/95 p-0 text-white sm:max-w-5xl">
          {activeLightboxImage?.image?.publicUrl ? (
            <>
              <DialogTitle className="sr-only">
                {getGalleryImageAlt(locale, activeLightboxImage, labels.openImage)}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {getGalleryImageCaption(locale, activeLightboxImage) ??
                  labels.openImage}
              </DialogDescription>

              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeLightboxImage.image.publicUrl}
                  alt={getGalleryImageAlt(
                    locale,
                    activeLightboxImage,
                    labels.openImage,
                  )}
                  className="max-h-[80vh] w-full object-contain"
                />

                {lightboxIndex > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 start-3 -translate-y-1/2 rounded-full"
                    onClick={showPreviousImage}
                    aria-label={labels.previousImage}
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                ) : null}

                {lightboxIndex >= 0 && lightboxIndex < lightboxImages.length - 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 end-3 -translate-y-1/2 rounded-full"
                    onClick={showNextImage}
                    aria-label={labels.nextImage}
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                ) : null}
              </div>

              {getGalleryImageCaption(locale, activeLightboxImage) ? (
                <div className="border-t border-white/10 px-6 py-4">
                  <p className="text-sm leading-7 text-white/90">
                    {getGalleryImageCaption(locale, activeLightboxImage)}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
