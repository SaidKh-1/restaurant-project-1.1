import type { Metadata } from "next";

import { ReservationsPageContent } from "@/components/public/reservations/reservations-page-content";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type ReservationsPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ReservationsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "reservations");
}

export default async function PublicReservationsPage({
  params,
}: ReservationsPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;

  return <ReservationsPageContent locale={locale} />;
}
