import type { Metadata } from "next";

import { ContactPageContent } from "@/components/public/contact/contact-page-content";
import { getPublicSeoMetadata } from "@/lib/public/seo-metadata";
import { isPublicLocale, type PublicLocale } from "@/lib/public/locale";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    return {};
  }

  return getPublicSeoMetadata(locale, "contact");
}

export default async function PublicContactPage({ params }: ContactPageProps) {
  const { locale: localeParam } = await params;

  if (!isPublicLocale(localeParam)) {
    return null;
  }

  const locale = localeParam as PublicLocale;

  return <ContactPageContent locale={locale} />;
}
