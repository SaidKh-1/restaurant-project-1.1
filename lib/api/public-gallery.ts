import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "@/lib/api/media";
import type { Prisma } from "@/lib/generated/prisma/client";

const publicGalleryCategoryInclude = {
  translations: true,
  _count: {
    select: {
      images: {
        where: {
          status: "PUBLISHED" as const,
          isVisible: true,
        },
      },
    },
  },
};

const publicGalleryImageInclude = {
  galleryCategory: {
    include: {
      translations: true,
    },
  },
  mediaAsset: {
    include: mediaAssetInclude,
  },
  translations: true,
};

type PublicGalleryCategoryRecord = Prisma.GalleryCategoryGetPayload<{
  include: typeof publicGalleryCategoryInclude;
}>;

type PublicGalleryImageRecord = Prisma.GalleryImageGetPayload<{
  include: typeof publicGalleryImageInclude;
}>;

function serializeGalleryTranslationPair<
  T extends { locale: "AR" | "EN"; name: string; description?: string | null },
>(translations: T[]) {
  const translationAr =
    translations.find((translation) => translation.locale === "AR") ?? null;
  const translationEn =
    translations.find((translation) => translation.locale === "EN") ?? null;

  return {
    ar: translationAr
      ? {
          name: translationAr.name,
          description: translationAr.description ?? null,
        }
      : null,
    en: translationEn
      ? {
          name: translationEn.name,
          description: translationEn.description ?? null,
        }
      : null,
  };
}

function serializeGalleryImageTranslationPair(
  translations: PublicGalleryImageRecord["translations"],
) {
  const translationAr =
    translations.find((translation) => translation.locale === "AR") ?? null;
  const translationEn =
    translations.find((translation) => translation.locale === "EN") ?? null;

  return {
    ar: translationAr
      ? {
          caption: translationAr.caption,
          altText: translationAr.altText,
        }
      : null,
    en: translationEn
      ? {
          caption: translationEn.caption,
          altText: translationEn.altText,
        }
      : null,
  };
}

export function serializePublicGalleryCategory(
  category: PublicGalleryCategoryRecord,
) {
  return {
    id: category.id,
    slug: category.slug,
    sortOrder: category.sortOrder,
    defaultLocale: "ar" as const,
    translations: serializeGalleryTranslationPair(category.translations),
    imageCount: category._count.images,
  };
}

export function serializePublicGalleryImage(image: PublicGalleryImageRecord) {
  return {
    id: image.id,
    galleryCategoryId: image.galleryCategoryId,
    isFeatured: image.isFeatured,
    sortOrder: image.sortOrder,
    defaultLocale: "ar" as const,
    image: serializeMediaAsset(image.mediaAsset),
    translations: serializeGalleryImageTranslationPair(image.translations),
    galleryCategory: image.galleryCategory
      ? {
          id: image.galleryCategory.id,
          slug: image.galleryCategory.slug,
          translations: serializeGalleryTranslationPair(
            image.galleryCategory.translations,
          ),
        }
      : null,
  };
}

const publicGalleryImageWhere = {
  status: "PUBLISHED" as const,
  isVisible: true,
  OR: [
    { galleryCategoryId: null },
    {
      galleryCategory: {
        isActive: true,
      },
    },
  ],
};

export async function listPublicGalleryCategories(restaurantId: string) {
  const categories = await prisma.galleryCategory.findMany({
    where: {
      restaurantId,
      isActive: true,
      images: {
        some: publicGalleryImageWhere,
      },
    },
    include: publicGalleryCategoryInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return categories.map(serializePublicGalleryCategory);
}

export async function listPublicGalleryImages(
  restaurantId: string,
  filters?: { galleryCategoryId?: string },
) {
  const images = await prisma.galleryImage.findMany({
    where: {
      restaurantId,
      ...publicGalleryImageWhere,
      ...(filters?.galleryCategoryId
        ? { galleryCategoryId: filters.galleryCategoryId }
        : {}),
    },
    include: publicGalleryImageInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return images.map(serializePublicGalleryImage);
}
