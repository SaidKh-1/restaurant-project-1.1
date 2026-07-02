import { prisma } from "@/lib/db";
import { MENU_UNIT_ARABIC_LABELS } from "@/lib/api/menu-items";
import { serializeMediaAsset, mediaAssetInclude } from "@/lib/api/media";
import type { Prisma } from "@/lib/generated/prisma/client";

const publicMenuCategoryInclude = {
  translations: true,
  imageAsset: {
    include: mediaAssetInclude,
  },
} as const;

const publicMenuItemInclude = {
  menuCategory: {
    include: {
      translations: true,
    },
  },
  imageAsset: {
    include: mediaAssetInclude,
  },
  translations: true,
  priceVariants: {
    where: { isActive: true },
    include: {
      translations: true,
    },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  cookingMethods: {
    include: {
      cookingMethod: {
        include: {
          translations: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" as const }],
  },
};

type PublicMenuCategoryRecord = Prisma.MenuCategoryGetPayload<{
  include: typeof publicMenuCategoryInclude;
}>;

type PublicMenuItemRecord = Prisma.MenuItemGetPayload<{
  include: typeof publicMenuItemInclude;
}>;

function serializeTranslationPair<
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

export function serializePublicMenuCategory(category: PublicMenuCategoryRecord) {
  return {
    id: category.id,
    slug: category.slug,
    parentCategoryId: category.parentCategoryId,
    sortOrder: category.sortOrder,
    defaultLocale: "ar" as const,
    translations: serializeTranslationPair(category.translations),
    image: serializeMediaAsset(category.imageAsset),
  };
}

function serializePublicPriceVariant(
  variant: PublicMenuItemRecord["priceVariants"][number],
) {
  return {
    id: variant.id,
    price: Number(variant.price),
    unit: variant.unit,
    unitLabel: {
      ar: MENU_UNIT_ARABIC_LABELS[variant.unit],
    },
    sortOrder: variant.sortOrder,
    defaultLocale: "ar" as const,
    translations: serializeTranslationPair(variant.translations),
  };
}

function serializePublicCookingMethodAssignment(
  assignment: PublicMenuItemRecord["cookingMethods"][number],
) {
  const method = assignment.cookingMethod;

  if (!method.isEnabled || !method.isPubliclyVisible) {
    return null;
  }

  return {
    id: assignment.id,
    cookingMethodId: method.id,
    sortOrder: assignment.sortOrder,
    defaultLocale: "ar" as const,
    translations: serializeTranslationPair(method.translations),
  };
}

export function serializePublicMenuItem(item: PublicMenuItemRecord) {
  return {
    id: item.id,
    menuCategoryId: item.menuCategoryId,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    defaultLocale: "ar" as const,
    translations: serializeTranslationPair(item.translations),
    image: serializeMediaAsset(item.imageAsset),
    priceVariants: item.priceVariants.map(serializePublicPriceVariant),
    cookingMethods: item.cookingMethods
      .map(serializePublicCookingMethodAssignment)
      .filter(
        (
          method,
        ): method is NonNullable<
          ReturnType<typeof serializePublicCookingMethodAssignment>
        > => method !== null,
      ),
  };
}

export async function listPublicMenuCategories(restaurantId: string) {
  const categories = await prisma.menuCategory.findMany({
    where: {
      restaurantId,
      status: "PUBLISHED",
      isVisible: true,
    },
    include: publicMenuCategoryInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return categories.map(serializePublicMenuCategory);
}

export async function listPublicMenuItems(
  restaurantId: string,
  filters?: { menuCategoryId?: string },
) {
  const items = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      status: "PUBLISHED",
      isVisible: true,
      isAvailable: true,
      menuCategory: {
        status: "PUBLISHED",
        isVisible: true,
      },
      ...(filters?.menuCategoryId
        ? { menuCategoryId: filters.menuCategoryId }
        : {}),
    },
    include: publicMenuItemInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return items.map(serializePublicMenuItem);
}
