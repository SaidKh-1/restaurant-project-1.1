import type { PublicLocale } from "@/lib/public/locale";

export type PublicNavLink = {
  href: string;
  label: string;
};

type BuildPublicNavLinksOptions = {
  reservationsEnabled: boolean;
  reviewsEnabled: boolean;
  messagesEnabled: boolean;
  managerProfileVisible?: boolean;
};

const NAV_LABELS = {
  ar: {
    home: "الرئيسية",
    menu: "المنيو",
    offers: "العروض",
    gallery: "معرض الصور",
    reviews: "التقييمات",
    reservations: "الحجز",
    contact: "تواصل معنا",
    about: "عن المطعم",
    manager: "مدير المطعم",
  },
  en: {
    home: "Home",
    menu: "Menu",
    offers: "Offers",
    gallery: "Gallery",
    reviews: "Reviews",
    reservations: "Reservations",
    contact: "Contact",
    about: "About",
    manager: "Manager",
  },
} as const;

export function buildPublicNavLinks(
  locale: PublicLocale,
  options: BuildPublicNavLinksOptions,
): PublicNavLink[] {
  const base = `/${locale}`;
  const labels = NAV_LABELS[locale];

  const links: PublicNavLink[] = [
    { href: base, label: labels.home },
    { href: `${base}/menu`, label: labels.menu },
    { href: `${base}/offers`, label: labels.offers },
    { href: `${base}/gallery`, label: labels.gallery },
  ];

  if (options.reviewsEnabled) {
    links.push({ href: `${base}/reviews`, label: labels.reviews });
  }

  links.push({ href: `${base}/about`, label: labels.about });

  if (options.managerProfileVisible ?? true) {
    links.push({ href: `${base}/manager`, label: labels.manager });
  }

  if (options.reservationsEnabled) {
    links.push({ href: `${base}/reservations`, label: labels.reservations });
  }

  if (options.messagesEnabled) {
    links.push({ href: `${base}/contact`, label: labels.contact });
  }

  return links;
}

export function buildPublicFooterLinks(
  locale: PublicLocale,
  options: BuildPublicNavLinksOptions,
) {
  return buildPublicNavLinks(locale, options);
}
