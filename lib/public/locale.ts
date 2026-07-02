export const PUBLIC_LOCALES = ["ar", "en"] as const;

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

export function isPublicLocale(value: string): value is PublicLocale {
  return PUBLIC_LOCALES.includes(value as PublicLocale);
}

export function getPublicDir(locale: PublicLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getAlternateLocale(locale: PublicLocale): PublicLocale {
  return locale === "ar" ? "en" : "ar";
}

export function swapLocaleInPathname(pathname: string, locale: PublicLocale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}`;
  }

  if (isPublicLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return `/${locale}/${segments.join("/")}`;
}

export function getLocalizedRestaurantName(
  locale: PublicLocale,
  names: { ar: string | null; en: string | null },
) {
  if (locale === "en") {
    return names.en?.trim() || names.ar?.trim() || "";
  }

  return names.ar?.trim() || names.en?.trim() || "";
}
