import type { Metadata } from "next";

import { ReviewsPageContent } from "@/components/public/reviews/reviews-page-content";
import { loadPublicReviewsPageData } from "@/lib/public/reviews-data";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type ReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ReviewsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "reviews");
}

export default async function PublicReviewsPage({ params }: ReviewsPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;
  const reviews = await loadPublicReviewsPageData();

  return <ReviewsPageContent locale={locale} reviews={reviews} />;
}
