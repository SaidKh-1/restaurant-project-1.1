import type { Metadata } from "next";

import { OffersPageContent } from "@/components/public/offers/offers-page-content";
import { loadPublicOffersPageData } from "@/lib/public/offers-data";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type OffersPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: OffersPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "offers");
}

export default async function PublicOffersPage({ params }: OffersPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;
  const offers = await loadPublicOffersPageData();

  return <OffersPageContent locale={locale} offers={offers} />;
}
