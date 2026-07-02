"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { ReviewSubmissionForm } from "@/components/public/reviews/review-submission-form";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLocalizedMediaAlt, getReviewContent } from "@/lib/public/content";
import type { PublicLocale } from "@/lib/public/locale";
import {
  formatReviewDate,
  getReviewsPageLabels,
  sortPublicReviews,
} from "@/lib/public/reviews-content";
import type { PublicReview } from "@/lib/public/types";

type ReviewsPageContentProps = {
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

function ReviewCard({
  locale,
  review,
  labels,
  onOpenImage,
}: {
  locale: PublicLocale;
  review: PublicReview;
  labels: ReturnType<typeof getReviewsPageLabels>;
  onOpenImage: () => void;
}) {
  const content = getReviewContent(review, locale);

  if (!content?.comment) {
    return null;
  }

  const imageUrl = review.image?.publicUrl;
  const imageAlt = getLocalizedMediaAlt(
    locale,
    review.image,
    review.displayedName,
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      {imageUrl ? (
        <button
          type="button"
          onClick={onOpenImage}
          className="group relative aspect-[16/10] overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-primary)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="sr-only">{labels.openImage}</span>
        </button>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StarRating rating={review.rating} />
          {review.isFeatured ? (
            <Badge className="bg-[var(--public-primary)] text-white">
              {labels.featured}
            </Badge>
          ) : null}
        </div>

        {content.title ? (
          <h2 className="text-lg font-semibold">{content.title}</h2>
        ) : null}

        <p className="text-muted-foreground flex-1 text-sm leading-7">
          {content.comment}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <p className="text-sm font-medium">{review.displayedName}</p>
          <time
            dateTime={review.createdAt}
            className="text-muted-foreground text-xs"
          >
            {formatReviewDate(locale, review.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
}

export function ReviewsPageContent({ locale, reviews }: ReviewsPageContentProps) {
  const labels = getReviewsPageLabels(locale);
  const visibleReviews = sortPublicReviews(reviews).filter((review) => {
    const content = getReviewContent(review, locale);
    return Boolean(content?.comment);
  });
  const [previewReviewId, setPreviewReviewId] = useState<string | null>(null);

  const previewReview = visibleReviews.find(
    (review) => review.id === previewReviewId,
  );
  const previewImageUrl = previewReview?.image?.publicUrl;

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

      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
        <ReviewSubmissionForm locale={locale} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {visibleReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
            <p className="text-muted-foreground">{labels.emptyReviews}</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleReviews.map((review) => (
              <ReviewCard
                key={review.id}
                locale={locale}
                review={review}
                labels={labels}
                onOpenImage={() => setPreviewReviewId(review.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(previewReview && previewImageUrl)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewReviewId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl border-none bg-black/95 p-0 text-white sm:max-w-4xl">
          {previewReview && previewImageUrl ? (
            <>
              <DialogTitle className="sr-only">
                {getLocalizedMediaAlt(
                  locale,
                  previewReview.image,
                  previewReview.displayedName,
                )}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {labels.openImage}
              </DialogDescription>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt={getLocalizedMediaAlt(
                  locale,
                  previewReview.image,
                  previewReview.displayedName,
                )}
                className="max-h-[80vh] w-full object-contain"
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
