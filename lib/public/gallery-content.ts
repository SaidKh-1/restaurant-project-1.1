import { pickLocalizedTranslation } from "@/lib/public/content";
import type { PublicLocale } from "@/lib/public/locale";
import type {
  PublicGalleryCategory,
  PublicGalleryCategoryTranslation,
  PublicGalleryImage,
  PublicGalleryImageTranslation,
} from "@/lib/public/types";

export const GALLERY_PAGE_LABELS = {
  ar: {
    title: "معرض الصور",
    subtitle: "لقطات من مطبخنا وأطباقنا",
    allCategories: "الكل",
    featured: "مميز",
    emptyGallery: "معرض الصور غير متاح حالياً.",
    emptyCategory: "لا توجد صور في هذا القسم.",
    closePreview: "إغلاق",
    previousImage: "الصورة السابقة",
    nextImage: "الصورة التالية",
    openImage: "عرض الصورة",
  },
  en: {
    title: "Photo gallery",
    subtitle: "Moments from our kitchen and dishes",
    allCategories: "All",
    featured: "Featured",
    emptyGallery: "The gallery is not available right now.",
    emptyCategory: "No images in this category yet.",
    closePreview: "Close",
    previousImage: "Previous image",
    nextImage: "Next image",
    openImage: "View image",
  },
} as const;

export function getGalleryPageLabels(locale: PublicLocale) {
  return GALLERY_PAGE_LABELS[locale];
}

export function getGalleryCategoryTranslation(
  locale: PublicLocale,
  translations: {
    ar: PublicGalleryCategoryTranslation | null;
    en: PublicGalleryCategoryTranslation | null;
  },
) {
  return pickLocalizedTranslation(locale, translations);
}

export function getGalleryImageTranslation(
  locale: PublicLocale,
  translations: {
    ar: PublicGalleryImageTranslation | null;
    en: PublicGalleryImageTranslation | null;
  },
) {
  return pickLocalizedTranslation(locale, translations);
}

export function getGalleryImageAlt(
  locale: PublicLocale,
  image: PublicGalleryImage,
  fallback: string,
) {
  const translation = getGalleryImageTranslation(locale, image.translations);
  const alt =
    translation?.altText?.trim() ||
    translation?.caption?.trim() ||
    (locale === "en"
      ? (image.image?.altText.en ??
        image.image?.altText.ar ??
        image.image?.caption.en ??
        image.image?.caption.ar)
      : (image.image?.altText.ar ??
        image.image?.altText.en ??
        image.image?.caption.ar ??
        image.image?.caption.en));

  return alt?.trim() || fallback;
}

export function getGalleryImageCaption(
  locale: PublicLocale,
  image: PublicGalleryImage,
) {
  return getGalleryImageTranslation(locale, image.translations)?.caption?.trim() || null;
}

export function groupGalleryImagesByCategory(
  categories: PublicGalleryCategory[],
  images: PublicGalleryImage[],
) {
  const imagesByCategory = new Map<string, PublicGalleryImage[]>();

  for (const image of images) {
    if (!image.galleryCategoryId) {
      continue;
    }

    const bucket = imagesByCategory.get(image.galleryCategoryId) ?? [];
    bucket.push(image);
    imagesByCategory.set(image.galleryCategoryId, bucket);
  }

  return categories
    .map((category) => ({
      category,
      images: (imagesByCategory.get(category.id) ?? []).sort(
        (left, right) => left.sortOrder - right.sortOrder,
      ),
    }))
    .filter((section) => section.images.length > 0);
}

export function filterGalleryImages(
  images: PublicGalleryImage[],
  categoryId: string | "all",
) {
  const sorted = [...images].sort((left, right) => left.sortOrder - right.sortOrder);

  if (categoryId === "all") {
    return sorted;
  }

  return sorted.filter((image) => image.galleryCategoryId === categoryId);
}

export function getVisibleGalleryCategories(
  categories: PublicGalleryCategory[],
  images: PublicGalleryImage[],
) {
  const categoryIdsWithImages = new Set(
    images
      .map((image) => image.galleryCategoryId)
      .filter((categoryId): categoryId is string => Boolean(categoryId)),
  );

  return categories.filter((category) => categoryIdsWithImages.has(category.id));
}
