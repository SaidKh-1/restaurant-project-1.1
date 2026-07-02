import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOfferContent, sortFeaturedFirst } from "@/lib/public/content";
import { getHomeSectionLabels } from "@/lib/public/home-sections";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicOffer } from "@/lib/public/types";

type HomeOffersSectionProps = {
  locale: PublicLocale;
  offers: PublicOffer[];
};

export function HomeOffersSection({ locale, offers }: HomeOffersSectionProps) {
  const labels = getHomeSectionLabels(locale);
  const visibleOffers = sortFeaturedFirst(offers).slice(0, 6);

  if (visibleOffers.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--public-secondary)]/35 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--public-primary)]">
              {labels.offers}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">{labels.offers}</h2>
          </div>
          <Button asChild variant="outline">
            <Link href={`/${locale}/offers`} prefetch>
              {labels.viewAll}
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleOffers.map((offer) => {
            const content = getOfferContent(offer, locale);

            if (!content?.title) {
              return null;
            }

            const ctaLabel =
              content.discountText?.trim() ||
              (locale === "ar" ? "عرض" : "Offer");

            return (
              <article
                key={offer.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {offer.image?.publicUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={offer.image.publicUrl}
                      alt={content.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                      {content.title}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="text-xl font-semibold">{content.title}</h3>
                  {content.description ? (
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
                      {content.description}
                    </p>
                  ) : null}
                  {content.ctaUrl ? (
                    <Button
                      asChild
                      size="sm"
                      className="bg-[var(--public-button)] text-white hover:bg-[var(--public-button)]/90"
                    >
                      <Link href={content.ctaUrl} prefetch>
                        {ctaLabel}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
