import type { Metadata } from "next";

import { getSeoEntryByPageKey } from "@/lib/api/seo-entries";
import { getDefaultPublicRestaurantRecord } from "@/lib/api/public-site-shell";
import {
  getLocalizedRestaurantName,
  type PublicLocale,
} from "@/lib/public/locale";

export async function getPublicSeoMetadata(
  locale: PublicLocale,
  pageKey: string,
): Promise<Metadata> {
  const restaurant = await getDefaultPublicRestaurantRecord();

  if (!restaurant) {
    return {};
  }

  const entry = await getSeoEntryByPageKey(restaurant.id, pageKey, {
    indexableOnly: true,
  });

  const fallbackTitle = getLocalizedRestaurantName(locale, {
    ar:
      restaurant.translations.find((translation) => translation.locale === "AR")
        ?.name ?? null,
    en:
      restaurant.translations.find((translation) => translation.locale === "EN")
        ?.name ?? null,
  });

  const translation =
    locale === "en"
      ? (entry?.translations.en ?? entry?.translations.ar)
      : (entry?.translations.ar ?? entry?.translations.en);

  const title = translation?.seoTitle?.trim() || fallbackTitle || undefined;
  const description = translation?.seoDescription?.trim() || undefined;
  const keywords = translation?.keywords?.trim() || undefined;
  const ogImageUrl =
    entry?.ogImage?.publicUrl ??
    restaurant.themeSettings?.defaultOgImageAsset?.publicUrl ??
    null;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: entry?.canonicalUrl ?? undefined,
      languages: restaurant.isEnglishEnabled
        ? {
            ar: "/ar",
            en: "/en",
          }
        : {
            ar: "/ar",
          },
    },
    robots: entry?.noIndex
      ? {
          index: false,
          follow: entry.robotsFollow,
        }
      : undefined,
    openGraph: {
      title: title ?? undefined,
      description: description ?? undefined,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    icons: restaurant.themeSettings?.faviconAsset?.publicUrl
      ? {
          icon: restaurant.themeSettings.faviconAsset.publicUrl,
        }
      : undefined,
  };
}
