import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export const galleryCategoryInclude = {
  translations: true,
  _count: {
    select: {
      images: true,
    },
  },
};

export type GalleryCategoryRecord = Prisma.GalleryCategoryGetPayload<{
  include: typeof galleryCategoryInclude;
}>;

export function serializeGalleryCategory(category: GalleryCategoryRecord) {
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
    sortOrder: category.sortOrder,
    defaultLocale: "ar" as const,
    translations: {
      ar: translationAr
        ? {
            name: translationAr.name,
            description: translationAr.description,
          }
        : null,
      en: translationEn
        ? {
            name: translationEn.name,
            description: translationEn.description,
          }
        : null,
    },
    imageCount: category._count.images,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function listGalleryCategories(restaurantId: string) {
  const categories = await prisma.galleryCategory.findMany({
    where: { restaurantId },
    include: galleryCategoryInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return categories.map(serializeGalleryCategory);
}

export async function getGalleryCategoryRecord(
  restaurantId: string,
  categoryId: string,
) {
  return prisma.galleryCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    include: galleryCategoryInclude,
  });
}

export async function assertGalleryCategoryBelongsToRestaurant(
  restaurantId: string,
  galleryCategoryId: string | null | undefined,
) {
  if (!galleryCategoryId) {
    return;
  }

  const category = await prisma.galleryCategory.findFirst({
    where: {
      id: galleryCategoryId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Gallery category was not found.");
  }
}

export async function assertGalleryCategoryCanBeDeleted(
  restaurantId: string,
  categoryId: string,
) {
  const category = await prisma.galleryCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    select: {
      _count: {
        select: {
          images: true,
        },
      },
    },
  });

  if (!category) {
    return "not_found" as const;
  }

  if (category._count.images > 0) {
    throw new Error(
      "Cannot delete a gallery category that still has gallery images assigned.",
    );
  }

  return "ok" as const;
}

export type GalleryCategoryTranslationInput = {
  name?: string | null;
  description?: string | null;
};

export async function upsertGalleryCategoryTranslation(
  galleryCategoryId: string,
  locale: "AR" | "EN",
  translation: GalleryCategoryTranslationInput,
  options?: { partial?: boolean },
) {
  const updateData = options?.partial
    ? {
        ...(translation.name !== undefined && translation.name !== null
          ? { name: translation.name }
          : {}),
        ...(translation.description !== undefined
          ? { description: translation.description }
          : {}),
      }
    : {
        name: translation.name ?? "",
        description: translation.description ?? null,
      };

  await prisma.galleryCategoryTranslation.upsert({
    where: {
      galleryCategoryId_locale: {
        galleryCategoryId,
        locale,
      },
    },
    create: {
      galleryCategoryId,
      locale,
      name: translation.name ?? "",
      description: translation.description ?? null,
    },
    update: updateData,
  });
}
