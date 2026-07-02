import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "./media";
import type { CmsStatus, Prisma } from "@/lib/generated/prisma/client";

export const galleryImageInclude = {
  galleryCategory: {
    include: {
      translations: true,
    },
  },
  mediaAsset: {
    include: mediaAssetInclude,
  },
  translations: true,
  _count: {
    select: {
      homepageSections: true,
    },
  },
};

export type GalleryImageRecord = Prisma.GalleryImageGetPayload<{
  include: typeof galleryImageInclude;
}>;

function serializeGalleryCategorySummary(
  category: GalleryImageRecord["galleryCategory"],
) {
  if (!category) {
    return null;
  }

  const translationAr =
    category.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    category.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: category.id,
    slug: category.slug,
    isActive: category.isActive,
    translations: {
      ar: translationAr ? { name: translationAr.name } : null,
      en: translationEn ? { name: translationEn.name } : null,
    },
  };
}

function serializeGalleryImageTranslation(
  translation: GalleryImageRecord["translations"][number] | null,
) {
  if (!translation) {
    return null;
  }

  return {
    caption: translation.caption,
    altText: translation.altText,
  };
}

export function serializeGalleryImage(image: GalleryImageRecord) {
  const translationAr =
    image.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    image.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: image.id,
    galleryCategoryId: image.galleryCategoryId,
    galleryCategory: serializeGalleryCategorySummary(image.galleryCategory),
    mediaAssetId: image.mediaAssetId,
    mediaAsset: serializeMediaAsset(image.mediaAsset),
    isFeatured: image.isFeatured,
    isVisible: image.isVisible,
    isActive: image.isVisible,
    sortOrder: image.sortOrder,
    status: image.status,
    defaultLocale: "ar" as const,
    translations: {
      ar: serializeGalleryImageTranslation(translationAr),
      en: serializeGalleryImageTranslation(translationEn),
    },
    homepageSectionCount: image._count.homepageSections,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };
}

export async function listGalleryImages(
  restaurantId: string,
  filters?: {
    galleryCategoryId?: string;
    status?: CmsStatus;
    isVisible?: boolean;
  },
) {
  const images = await prisma.galleryImage.findMany({
    where: {
      restaurantId,
      ...(filters?.galleryCategoryId
        ? { galleryCategoryId: filters.galleryCategoryId }
        : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.isVisible !== undefined
        ? { isVisible: filters.isVisible }
        : {}),
    },
    include: galleryImageInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return images.map(serializeGalleryImage);
}

export async function getGalleryImageRecord(
  restaurantId: string,
  galleryImageId: string,
) {
  return prisma.galleryImage.findFirst({
    where: {
      id: galleryImageId,
      restaurantId,
    },
    include: galleryImageInclude,
  });
}

export async function assertGalleryImageCanBeDeleted(
  restaurantId: string,
  galleryImageId: string,
) {
  const image = await prisma.galleryImage.findFirst({
    where: {
      id: galleryImageId,
      restaurantId,
    },
    select: {
      _count: {
        select: {
          homepageSections: true,
        },
      },
    },
  });

  if (!image) {
    return "not_found" as const;
  }

  if (image._count.homepageSections > 0) {
    throw new Error(
      "Cannot delete a gallery image that is still assigned to homepage sections.",
    );
  }

  return "ok" as const;
}

export type GalleryImageTranslationInput = {
  caption?: string | null;
  altText?: string | null;
};

export function mapGalleryImageTranslationInput(
  translation: GalleryImageTranslationInput,
) {
  return {
    caption: translation.caption ?? null,
    altText: translation.altText ?? null,
  };
}

function mapPartialGalleryImageTranslationInput(
  translation: GalleryImageTranslationInput,
) {
  return {
    ...(translation.caption !== undefined
      ? { caption: translation.caption }
      : {}),
    ...(translation.altText !== undefined
      ? { altText: translation.altText }
      : {}),
  };
}

export async function upsertGalleryImageTranslation(
  galleryImageId: string,
  locale: "AR" | "EN",
  translation: GalleryImageTranslationInput,
  options?: { partial?: boolean },
) {
  const updateData = options?.partial
    ? mapPartialGalleryImageTranslationInput(translation)
    : mapGalleryImageTranslationInput(translation);

  await prisma.galleryImageTranslation.upsert({
    where: {
      galleryImageId_locale: {
        galleryImageId,
        locale,
      },
    },
    create: {
      galleryImageId,
      locale,
      ...mapGalleryImageTranslationInput(translation),
    },
    update: updateData,
  });
}
