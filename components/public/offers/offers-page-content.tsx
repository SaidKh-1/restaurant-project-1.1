import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOfferContent, sortFeaturedFirst } from "@/lib/public/content";
import {
  getOfferPeriodLabel,
  getOffersPageLabels,
  resolveOfferCtaHref,
} from "@/lib/public/offers-content";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicOffer } from "@/lib/public/types";

type OffersPageContentProps = {
  locale: PublicLocale;
  offers: PublicOffer[];
};

function OfferCard({
  locale,
  offer,
}: {
  locale: PublicLocale;
  offer: PublicOffer;
}) {
  const labels = getOffersPageLabels(locale);
  const content = getOfferContent(offer, locale);
  const title = content?.title?.trim();

  if (!title) {
    return null;
  }

  const description = content?.description?.trim() || null;
  const discountLabel = content?.discountText?.trim() || null;
  const ctaHref = resolveOfferCtaHref(locale, content?.ctaUrl);
  const ctaLabel = discountLabel || labels.defaultCta;
  const periodLabel = getOfferPeriodLabel(locale, offer.startsAt, offer.endsAt);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {offer.image?.publicUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={offer.image.publicUrl}
            alt={title}
            className="size-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center px-4 text-center text-sm">
            {title}
          </div>
        )}
        {discountLabel ? (
          <Badge className="absolute start-4 top-4 bg-[var(--public-primary)] text-white">
            {discountLabel}
          </Badge>
        ) : null}
        {offer.isFeatured ? (
          <Badge
            variant="secondary"
            className="absolute end-4 top-4 bg-background/90"
          >
            {labels.featured}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm leading-7">{description}</p>
          ) : null}
        </div>

        {periodLabel ? (
          <p className="text-muted-foreground text-sm">{periodLabel}</p>
        ) : null}

        {ctaHref ? (
          <Button
            asChild
            className="mt-auto w-full bg-[var(--public-button)] text-white hover:bg-[var(--public-button)]/90 sm:w-auto"
          >
            <Link href={ctaHref} prefetch>
              {ctaLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function OffersPageContent({ locale, offers }: OffersPageContentProps) {
  const labels = getOffersPageLabels(locale);
  const visibleOffers = sortFeaturedFirst(offers).filter((offer) => {
    const content = getOfferContent(offer, locale);
    return Boolean(content?.title?.trim());
  });

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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {visibleOffers.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
            <p className="text-muted-foreground">{labels.emptyOffers}</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleOffers.map((offer) => (
              <OfferCard key={offer.id} locale={locale} offer={offer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
