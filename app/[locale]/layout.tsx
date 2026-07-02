import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { getPublicSiteShell } from "@/lib/api/public-site-shell";
import { isPublicLocale, PUBLIC_LOCALES } from "@/lib/public/locale";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return PUBLIC_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    notFound();
  }

  const shell = await getPublicSiteShell(locale);

  if (locale === "en" && !shell.isEnglishEnabled) {
    notFound();
  }

  return <PublicShell shell={shell}>{children}</PublicShell>;
}
