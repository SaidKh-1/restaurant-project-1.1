import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "./media";

const menuCategoryInclude = {
  translations: true,
  imageAsset: {
    include: mediaAssetInclude,
  },
  _count: {
    select: {
      menuItems: true,
      childCategories: true,
    },
  },
} as const;

type MenuCategoryRecord = NonNullable<
  Awaited<ReturnType<typeof getMenuCategoryRecord>>
>;

export function serializeMenuCategory(category: MenuCategoryRecord) {
  const translationAr =
    category.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    category.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: category.id,
    slug: category.slug,
    parentCategoryId: category.parentCategoryId,
    isVisible: category.isVisible,
    sortOrder: category.sortOrder,
    status: category.status,
    defaultLocale: "ar" as const,
    translations: {
      ar: translationAr
        ? {
            name: translationAr.name,
            description: translationAr.description,
            slug: translationAr.slug,
          }
        : null,
      en: translationEn
        ? {
            name: translationEn.name,
            description: translationEn.description,
            slug: translationEn.slug,
          }
        : null,
    },
    image: serializeMediaAsset(category.imageAsset),
    menuItemCount: category._count.menuItems,
    childCategoryCount: category._count.childCategories,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function listMenuCategories(restaurantId: string) {
  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId },
    include: menuCategoryInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return categories.map(serializeMenuCategory);
}

export async function getMenuCategoryRecord(
  restaurantId: string,
  categoryId: string,
) {
  return prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    include: menuCategoryInclude,
  });
}

export async function assertMediaAssetBelongsToRestaurant(
  restaurantId: string,
  assetId: string | null | undefined,
) {
  if (!assetId) {
    return;
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: {
      id: assetId,
      restaurantId,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (!asset) {
    throw new Error("Media asset was not found.");
  }
}

export async function assertParentCategoryBelongsToRestaurant(
  restaurantId: string,
  parentCategoryId: string | null | undefined,
  categoryId?: string,
) {
  if (!parentCategoryId) {
    return;
  }

  if (categoryId && parentCategoryId === categoryId) {
    throw new Error("A category cannot be its own parent.");
  }

  const parentCategory = await prisma.menuCategory.findFirst({
    where: {
      id: parentCategoryId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!parentCategory) {
    throw new Error("Parent category was not found.");
  }
}

export async function assertMenuCategoryCanBeDeleted(
  restaurantId: string,
  categoryId: string,
) {
  const category = await prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    select: {
      _count: {
        select: {
          menuItems: true,
          childCategories: true,
        },
      },
    },
  });

  if (!category) {
    return "not_found" as const;
  }

  if (category._count.menuItems > 0) {
    throw new Error(
      "Cannot delete a category that still has menu items assigned.",
    );
  }

  if (category._count.childCategories > 0) {
    throw new Error(
      "Cannot delete a category that still has child categories.",
    );
  }

  return "ok" as const;
}
