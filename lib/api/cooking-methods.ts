import { prisma } from "@/lib/db";

const cookingMethodInclude = {
  translations: true,
  _count: {
    select: {
      menuItems: true,
    },
  },
} as const;

type CookingMethodRecord = NonNullable<
  Awaited<ReturnType<typeof getCookingMethodRecord>>
>;

export function serializeCookingMethod(method: CookingMethodRecord) {
  const translationAr =
    method.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    method.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: method.id,
    isEnabled: method.isEnabled,
    isPubliclyVisible: method.isPubliclyVisible,
    sortOrder: method.sortOrder,
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
    menuItemCount: method._count.menuItems,
    createdAt: method.createdAt,
    updatedAt: method.updatedAt,
  };
}

export async function listCookingMethods(restaurantId: string) {
  const methods = await prisma.cookingMethod.findMany({
    where: { restaurantId },
    include: cookingMethodInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return methods.map(serializeCookingMethod);
}

export async function getCookingMethodRecord(
  restaurantId: string,
  cookingMethodId: string,
) {
  return prisma.cookingMethod.findFirst({
    where: {
      id: cookingMethodId,
      restaurantId,
    },
    include: cookingMethodInclude,
  });
}
