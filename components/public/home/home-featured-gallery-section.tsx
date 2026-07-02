import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSeoEntryContent } from "@/lib/public/content";
import { getHomeSectionLabels } from "@/lib/public/home-sections";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicSeoEntry } from "@/lib/public/types";

type HomeFeaturedGallerySectionProps = {
  locale: PublicLocale;
  entries: PublicSeoEntry[];
};

export function HomeFeaturedGallerySection({
  locale,
  entries,
}: HomeFeaturedGallerySectionProps) {
  const labels = getHomeSectionLabels(locale);
  const images = entries
    .map((entry) => {
      const content = getSeoEntryContent(entry, locale);
      const title = content?.seoTitle?.trim();
      const imageUrl = entry.ogImage?.publicUrl;

      if (!title || !imageUrl) {
        return null;
      }

      return {
        id: entry.id,
        title,
        imageUrl,
        href: entry.routePath,
      };
    })
    .filter((image): image is NonNullable<typeof image> => image !== null)
    .slice(0, 6);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.featuredGallery}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">{labels.gallery}</h2>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${locale}/gallery`} prefetch>
            {labels.viewAll}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Link
            key={image.id}
            href={image.href}
            prefetch
            className="group overflow-hidden rounded-2xl border bg-card shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.imageUrl}
              alt={image.title}
              className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
