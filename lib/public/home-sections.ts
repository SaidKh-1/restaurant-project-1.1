import type { PublicLocale } from "@/lib/public/locale";

export const HOME_SECTION_LABELS = {
  ar: {
    hero: "مرحباً بكم",
    about: "عن المطعم",
    featuredMenu: "أطباق مميزة",
    featuredGallery: "من المعرض",
    offers: "العروض",
    testimonials: "آراء عملائنا",
    contactCta: "تواصل معنا",
    viewAll: "عرض الكل",
    reserve: "احجز الآن",
    whatsapp: "واتساب",
    contact: "رسالة",
    explore: "استكشف",
    menu: "المنيو",
    gallery: "المعرض",
    reviews: "التقييمات",
  },
  en: {
    hero: "Welcome",
    about: "About the restaurant",
    featuredMenu: "Featured dishes",
    featuredGallery: "From the gallery",
    offers: "Offers",
    testimonials: "Customer reviews",
    contactCta: "Get in touch",
    viewAll: "View all",
    reserve: "Reserve now",
    whatsapp: "WhatsApp",
    contact: "Message",
    explore: "Explore",
    menu: "Menu",
    gallery: "Gallery",
    reviews: "Reviews",
  },
} as const;

export function getHomeSectionLabels(locale: PublicLocale) {
  return HOME_SECTION_LABELS[locale];
}
