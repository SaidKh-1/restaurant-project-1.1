import { prisma } from "@/lib/db";
import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import { serializeMediaAsset, mediaAssetInclude } from "./media";
import type { MenuUnit, Prisma } from "@/lib/generated/prisma/client";

export const MENU_UNIT_ARABIC_LABELS: Record<MenuUnit, string> = {
  KILOGRAM: "كجم",
  PIECE: "حبة",
  PLATE: "طبق",
  SMALL: "صغير",
  LARGE: "كبير",
};

const ARABIC_UNIT_TO_ENUM: Record<string, MenuUnit> = {
  كجم: "KILOGRAM",
  حبة: "PIECE",
  طبق: "PLATE",
  صغير: "SMALL",
  كبير: "LARGE",
};

export function parseMenuUnit(value: string): MenuUnit {
  if (value in ARABIC_UNIT_TO_ENUM) {
    return ARABIC_UNIT_TO_ENUM[value];
  }

  return value as MenuUnit;
}

export function slugifyMenuText(text: string) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);

  return slug || "menu-item";
}

export const menuItemInclude = {
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
  _count: {
    select: {
      homepageSections: true,
    },
  },
};

export type MenuItemRecord = Prisma.MenuItemGetPayload<{
  include: typeof menuItemInclude;
}>;

function serializeTranslationPair<
  T extends { locale: "AR" | "EN"; name: string; description?: string | null; slug?: string },
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
          ...(translationAr.slug !== undefined
            ? { slug: translationAr.slug }
            : {}),
        }
      : null,
    en: translationEn
      ? {
          name: translationEn.name,
          description: translationEn.description ?? null,
          ...(translationEn.slug !== undefined
            ? { slug: translationEn.slug }
            : {}),
        }
      : null,
  };
}

function serializePriceVariant(
  variant: MenuItemRecord["priceVariants"][number],
) {
  return {
    id: variant.id,
    price: Number(variant.price),
    unit: variant.unit,
    unitLabel: {
      ar: MENU_UNIT_ARABIC_LABELS[variant.unit],
    },
    isActive: variant.isActive,
    sortOrder: variant.sortOrder,
    defaultLocale: "ar" as const,
    translations: serializeTranslationPair(variant.translations),
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };
}

function serializeCookingMethodAssignment(
  assignment: MenuItemRecord["cookingMethods"][number],
) {
  const method = assignment.cookingMethod;
  const translations = serializeTranslationPair(method.translations);

  return {
    id: assignment.id,
    cookingMethodId: method.id,
    sortOrder: assignment.sortOrder,
    defaultLocale: "ar" as const,
    translations,
  };
}

function serializeMenuCategorySummary(
  category: MenuItemRecord["menuCategory"],
) {
  const translationAr =
    category.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    category.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: category.id,
    slug: category.slug,
    translations: {
      ar: translationAr ? { name: translationAr.name } : null,
      en: translationEn ? { name: translationEn.name } : null,
    },
  };
}

export function serializeMenuItem(item: MenuItemRecord) {
  return {
    id: item.id,
    menuCategoryId: item.menuCategoryId,
    menuCategory: serializeMenuCategorySummary(item.menuCategory),
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    isVisible: item.isVisible,
    sortOrder: item.sortOrder,
    status: item.status,
    defaultLocale: "ar" as const,
    translations: serializeTranslationPair(item.translations),
    image: serializeMediaAsset(item.imageAsset),
    priceVariants: item.priceVariants.map(serializePriceVariant),
    cookingMethods: item.cookingMethods.map(serializeCookingMethodAssignment),
    homepageSectionCount: item._count.homepageSections,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listMenuItems(
  restaurantId: string,
  filters?: { menuCategoryId?: string },
) {
  const items = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      ...(filters?.menuCategoryId
        ? { menuCategoryId: filters.menuCategoryId }
        : {}),
    },
    include: menuItemInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return items.map(serializeMenuItem);
}

export async function getMenuItemRecord(
  restaurantId: string,
  menuItemId: string,
): Promise<MenuItemRecord | null> {
  return prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      restaurantId,
    },
    include: menuItemInclude,
  });
}

export async function assertMenuCategoryBelongsToRestaurant(
  restaurantId: string,
  menuCategoryId: string,
) {
  const category = await prisma.menuCategory.findFirst({
    where: {
      id: menuCategoryId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Menu category was not found.");
  }
}

export async function assertCookingMethodsBelongToRestaurant(
  restaurantId: string,
  cookingMethodIds: string[],
) {
  const uniqueIds = Array.from(new Set(cookingMethodIds));

  if (uniqueIds.length === 0) {
    return;
  }

  const methods = await prisma.cookingMethod.findMany({
    where: {
      id: { in: uniqueIds },
      restaurantId,
    },
    select: { id: true },
  });

  if (methods.length !== uniqueIds.length) {
    throw new Error("One or more cooking methods were not found.");
  }
}

export async function assertMenuItemCanBeDeleted(
  restaurantId: string,
  menuItemId: string,
) {
  const item = await prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
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

  if (!item) {
    return "not_found" as const;
  }

  if (item._count.homepageSections > 0) {
    throw new Error(
      "Cannot delete a menu item that is still assigned to homepage sections.",
    );
  }

  return "ok" as const;
}

export { assertMediaAssetBelongsToRestaurant };
