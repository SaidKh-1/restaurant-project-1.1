import type { Metadata } from "next";

import { HomePageSections } from "@/components/public/home/home-page-sections";
import { getPublicSiteShell } from "@/lib/api/public-site-shell";
import { loadPublicHomePageData } from "@/lib/public/home-data";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "home");
}

export default async function PublicHomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;
  const [shell, data] = await Promise.all([
    getPublicSiteShell(locale),
    loadPublicHomePageData(),
  ]);

  return <HomePageSections locale={locale} shell={shell} data={data} />;
}
