import type { PublicLocale } from "@/lib/public/locale";

export const REVIEWS_PAGE_LABELS = {
  ar: {
    title: "التقييمات",
    subtitle: "آراء عملائنا",
    featured: "مميز",
    emptyReviews: "لا توجد تقييمات متاحة حالياً.",
    openImage: "عرض صورة التقييم",
    closePreview: "إغلاق",
  },
  en: {
    title: "Reviews",
    subtitle: "Customer testimonials",
    featured: "Featured",
    emptyReviews: "No reviews are available right now.",
    openImage: "View review image",
    closePreview: "Close",
  },
} as const;

export function getReviewsPageLabels(locale: PublicLocale) {
  return REVIEWS_PAGE_LABELS[locale];
}

export function formatReviewDate(locale: PublicLocale, isoDate: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

export function sortPublicReviews<T extends { isFeatured: boolean; createdAt: string }>(
  reviews: T[],
) {
  return [...reviews].sort((left, right) => {
    if (left.isFeatured !== right.isFeatured) {
      return left.isFeatured ? -1 : 1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}
