import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getReviewContent, sortFeaturedFirst } from "@/lib/public/content";
import { getHomeSectionLabels } from "@/lib/public/home-sections";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicReview } from "@/lib/public/types";

type HomeTestimonialsSectionProps = {
  locale: PublicLocale;
  reviews: PublicReview[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

export function HomeTestimonialsSection({
  locale,
  reviews,
}: HomeTestimonialsSectionProps) {
  const labels = getHomeSectionLabels(locale);
  const visibleReviews = sortFeaturedFirst(reviews).slice(0, 6);

  if (visibleReviews.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.testimonials}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">{labels.reviews}</h2>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${locale}/reviews`} prefetch>
            {labels.viewAll}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleReviews.map((review) => {
          const content = getReviewContent(review, locale);

          if (!content?.comment) {
            return null;
          }

          return (
            <article
              key={review.id}
              className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm"
            >
              <StarRating rating={review.rating} />
              {content.title ? (
                <h3 className="mt-3 text-lg font-semibold">{content.title}</h3>
              ) : null}
              <p className="text-muted-foreground mt-3 flex-1 text-sm leading-7">
                {content.comment}
              </p>
              <p className="mt-4 text-sm font-medium">{review.displayedName}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
