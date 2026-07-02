import { swapLocaleInPathname } from "@/lib/public/locale";
import type { PublicLocale } from "@/lib/public/locale";

export const OFFERS_PAGE_LABELS = {
  ar: {
    title: "العروض",
    subtitle: "عروض وخصومات المطعم",
    featured: "مميز",
    emptyOffers: "لا توجد عروض متاحة حالياً.",
    validFrom: "يبدأ من",
    validUntil: "ينتهي في",
    defaultCta: "اطلب الآن",
    offerPeriod: "مدة العرض",
  },
  en: {
    title: "Offers",
    subtitle: "Restaurant deals and promotions",
    featured: "Featured",
    emptyOffers: "No offers are available right now.",
    validFrom: "Starts",
    validUntil: "Ends",
    defaultCta: "Order now",
    offerPeriod: "Offer period",
  },
} as const;

export function getOffersPageLabels(locale: PublicLocale) {
  return OFFERS_PAGE_LABELS[locale];
}

export function formatOfferDate(
  locale: PublicLocale,
  isoDate: string,
) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: locale === "ar" ? "short" : undefined,
  }).format(new Date(isoDate));
}

export function resolveOfferCtaHref(
  locale: PublicLocale,
  ctaUrl: string | null | undefined,
) {
  if (!ctaUrl?.trim()) {
    return null;
  }

  const trimmed = ctaUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/ar/") || trimmed.startsWith("/en/")) {
    return swapLocaleInPathname(trimmed, locale);
  }

  return trimmed;
}

export function getOfferPeriodLabel(
  locale: PublicLocale,
  startsAt: string | null,
  endsAt: string | null,
) {
  const labels = getOffersPageLabels(locale);

  if (startsAt && endsAt) {
    return `${labels.validFrom} ${formatOfferDate(locale, startsAt)} · ${labels.validUntil} ${formatOfferDate(locale, endsAt)}`;
  }

  if (startsAt) {
    return `${labels.validFrom} ${formatOfferDate(locale, startsAt)}`;
  }

  if (endsAt) {
    return `${labels.validUntil} ${formatOfferDate(locale, endsAt)}`;
  }

  return null;
}
