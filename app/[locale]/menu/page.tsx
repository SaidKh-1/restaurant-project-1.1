import type { Metadata } from "next";

import { MenuPageContent } from "@/components/public/menu/menu-page-content";
import { loadPublicMenuPageData } from "@/lib/public/menu-data";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type MenuPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "menu");
}

export default async function PublicMenuPage({ params }: MenuPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;
  const data = await loadPublicMenuPageData();

  return <MenuPageContent locale={locale} data={data} />;
}
