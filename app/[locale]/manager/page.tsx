import type { Metadata } from "next";

import { ManagerPageContent } from "@/components/public/manager/manager-page-content";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type ManagerPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ManagerPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "manager");
}

export default async function PublicManagerPage({ params }: ManagerPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;

  return <ManagerPageContent locale={locale} />;
}
