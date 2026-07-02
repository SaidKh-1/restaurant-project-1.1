import type { PublicLocale } from "@/lib/public/locale";
import type {
  PublicHeroSlide,
  PublicHomePageData,
  PublicOffer,
  PublicReview,
  PublicSeoEntry,
} from "@/lib/public/types";

type LocalizedRecord<T> = {
  ar: T | null;
  en: T | null;
};

export function pickLocalizedTranslation<T>(
  locale: PublicLocale,
  translations: LocalizedRecord<T>,
): T | null {
  if (locale === "en") {
    return translations.en ?? translations.ar;
  }

  return translations.ar ?? translations.en;
}

export function getLocalizedMediaAlt(
  locale: PublicLocale,
  asset: {
    altText: { ar: string | null; en: string | null };
    caption: { ar: string | null; en: string | null };
  } | null,
  fallback: string,
) {
  if (!asset) {
    return fallback;
  }

  const alt =
    locale === "en"
      ? (asset.altText.en ?? asset.altText.ar ?? asset.caption.en ?? asset.caption.ar)
      : (asset.altText.ar ?? asset.altText.en ?? asset.caption.ar ?? asset.caption.en);

  return alt?.trim() || fallback;
}

function mapSeoEntryToHeroSlide(
  entry: PublicSeoEntry,
  locale: PublicLocale,
): PublicHeroSlide | null {
  if (!entry.ogImage?.publicUrl) {
    return null;
  }

  const translation = pickLocalizedTranslation(locale, entry.translations);
  const title = translation?.seoTitle?.trim();

  if (!title) {
    return null;
  }

  return {
    id: entry.id,
    imageUrl: entry.ogImage.publicUrl,
    imageAlt: getLocalizedMediaAlt(locale, entry.ogImage, title),
    title,
    subtitle: translation?.seoDescription?.trim() || null,
    primaryLabel: locale === "ar" ? "استكشف" : "Explore",
    primaryHref: entry.routePath,
  };
}

export function buildHeroSlides(
  seoEntries: PublicSeoEntry[],
  locale: PublicLocale,
): PublicHeroSlide[] {
  const heroEntries = seoEntries.filter(
    (entry) => entry.entityType === "PAGE" || entry.pageKey === "home",
  );

  const sortedEntries = [...heroEntries].sort((left, right) => {
    if (left.pageKey === "home") {
      return -1;
    }

    if (right.pageKey === "home") {
      return 1;
    }

    return left.routePath.localeCompare(right.routePath);
  });

  return sortedEntries
    .map((entry) => mapSeoEntryToHeroSlide(entry, locale))
    .filter((slide): slide is PublicHeroSlide => slide !== null);
}

export function findSeoEntry(
  seoEntries: PublicSeoEntry[],
  matcher: (entry: PublicSeoEntry) => boolean,
) {
  return seoEntries.find(matcher) ?? null;
}

export function filterSeoEntriesByEntityType(
  seoEntries: PublicSeoEntry[],
  entityType: PublicSeoEntry["entityType"],
) {
  return seoEntries.filter((entry) => entry.entityType === entityType);
}

export function sortFeaturedFirst<T extends { isFeatured: boolean; sortOrder?: number }>(
  items: T[],
) {
  return [...items].sort((left, right) => {
    if (left.isFeatured !== right.isFeatured) {
      return left.isFeatured ? -1 : 1;
    }

    return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
  });
}

export function getOfferContent(offer: PublicOffer, locale: PublicLocale) {
  return pickLocalizedTranslation(locale, offer.translations);
}

export function getReviewContent(review: PublicReview, locale: PublicLocale) {
  return pickLocalizedTranslation(locale, review.translations);
}

export function getSeoEntryContent(entry: PublicSeoEntry, locale: PublicLocale) {
  return pickLocalizedTranslation(locale, entry.translations);
}

export function normalizeHomePageData(data: PublicHomePageData): PublicHomePageData {
  return {
    offers: data.offers ?? [],
    reviews: data.reviews ?? [],
    seoEntries: data.seoEntries ?? [],
  };
}
