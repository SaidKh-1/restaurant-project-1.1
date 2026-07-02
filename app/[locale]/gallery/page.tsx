import type { Metadata } from "next";

import { GalleryPageContent } from "@/components/public/gallery/gallery-page-content";
import { loadPublicGalleryPageData } from "@/lib/public/gallery-data";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type GalleryPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "gallery");
}

export default async function PublicGalleryPage({ params }: GalleryPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;
  const data = await loadPublicGalleryPageData();

  return <GalleryPageContent locale={locale} data={data} />;
}
