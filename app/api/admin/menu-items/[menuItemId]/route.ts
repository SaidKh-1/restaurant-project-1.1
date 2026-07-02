import {
  assertCookingMethodsBelongToRestaurant,
  assertMediaAssetBelongsToRestaurant,
  assertMenuCategoryBelongsToRestaurant,
  assertMenuItemCanBeDeleted,
  getMenuItemRecord,
  parseMenuUnit,
  serializeMenuItem,
  slugifyMenuText,
} from "@/lib/api/menu-items";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import {
  jsonError,
  isRecordNotFoundError,
  isUniqueConstraintError,
} from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const cmsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const nullableIdSchema = z.string().min(1).nullable();
const menuUnitInputSchema = z.enum([
  "KILOGRAM",
  "PIECE",
  "PLATE",
  "SMALL",
  "LARGE",
  "كجم",
  "حبة",
  "طبق",
  "صغير",
  "كبير",
]);

const updatePriceVariantSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    price: z.number().positive().max(99999999.99).optional(),
    unit: menuUnitInputSchema.optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    translations: z
      .object({
        ar: z
          .object({
            name: z.string().trim().min(1).max(160).optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            name: z.string().trim().min(1).max(160).nullable().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

const updateMenuItemSchema = z
  .object({
    menuCategoryId: z.string().trim().min(1).optional(),
    imageAssetId: nullableIdSchema.optional(),
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    cookingMethodIds: z.array(z.string().trim().min(1)).max(20).optional(),
    translations: z
      .object({
        ar: z
          .object({
            name: z.string().trim().min(1).max(160).optional(),
            description: z.string().trim().max(4000).nullable().optional(),
            slug: z.string().trim().min(1).max(160).optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            name: z.string().trim().min(1).max(160).nullable().optional(),
            description: z.string().trim().max(4000).nullable().optional(),
            slug: z.string().trim().min(1).max(160).nullable().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    priceVariants: z.array(updatePriceVariantSchema).min(1).max(20).optional(),
  })
  .strict();

type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

type RouteContext = {
  params: Promise<{ menuItemId: string }>;
};

function resolveTranslationSlug(
  translationSlug: string | null | undefined,
  fallbackText: string,
) {
  if (translationSlug === null || translationSlug === undefined) {
    return slugifyMenuText(fallbackText);
  }

  return translationSlug.trim() || slugifyMenuText(fallbackText);
}

async function syncPriceVariants(
  menuItemId: string,
  priceVariants: NonNullable<UpdateMenuItemInput["priceVariants"]>,
) {
  const existingVariants = await prisma.menuItemPriceVariant.findMany({
    where: { menuItemId },
    select: { id: true },
  });
  const existingIds = new Set(existingVariants.map((variant) => variant.id));
  const incomingIds = new Set(
    priceVariants
      .map((variant) => variant.id)
      .filter((id): id is string => typeof id === "string"),
  );

  const idsToDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));

  if (idsToDelete.length > 0) {
    await prisma.menuItemPriceVariant.deleteMany({
      where: {
        id: { in: idsToDelete },
        menuItemId,
      },
    });
  }

  for (const [index, variant] of priceVariants.entries()) {
    if (variant.id && existingIds.has(variant.id)) {
      await prisma.menuItemPriceVariant.update({
        where: { id: variant.id },
        data: {
          price: variant.price,
          unit: variant.unit ? parseMenuUnit(variant.unit) : undefined,
          isActive: variant.isActive,
          sortOrder: variant.sortOrder ?? index,
        },
      });

      if (variant.translations?.ar?.name !== undefined) {
        await prisma.menuItemPriceVariantTranslation.upsert({
          where: {
            priceVariantId_locale: {
              priceVariantId: variant.id,
              locale: "AR",
            },
          },
          create: {
            priceVariantId: variant.id,
            locale: "AR",
            name: variant.translations.ar.name,
          },
          update: {
            name: variant.translations.ar.name,
          },
        });
      }

      if (variant.translations?.en) {
        if (variant.translations.en.name === null) {
          await prisma.menuItemPriceVariantTranslation.deleteMany({
            where: {
              priceVariantId: variant.id,
              locale: "EN",
            },
          });
        } else if (variant.translations.en.name !== undefined) {
          await prisma.menuItemPriceVariantTranslation.upsert({
            where: {
              priceVariantId_locale: {
                priceVariantId: variant.id,
                locale: "EN",
              },
            },
            create: {
              priceVariantId: variant.id,
              locale: "EN",
              name: variant.translations.en.name,
            },
            update: {
              name: variant.translations.en.name,
            },
          });
        }
      }

      continue;
    }

    if (!variant.price || !variant.unit || !variant.translations?.ar?.name) {
      throw new Error(
        "New price variants require price, unit, and Arabic translation name.",
      );
    }

    await prisma.menuItemPriceVariant.create({
      data: {
        menuItemId,
        price: variant.price,
        unit: parseMenuUnit(variant.unit),
        isActive: variant.isActive ?? true,
        sortOrder: variant.sortOrder ?? index,
        translations: {
          create: [
            {
              locale: "AR",
              name: variant.translations.ar.name,
            },
            ...(variant.translations.en?.name
              ? [
                  {
                    locale: "EN" as const,
                    name: variant.translations.en.name,
                  },
                ]
              : []),
          ],
        },
      },
    });
  }
}

async function syncCookingMethodAssignments(
  menuItemId: string,
  cookingMethodIds: string[],
) {
  await prisma.menuItemCookingMethod.deleteMany({
    where: { menuItemId },
  });

  if (cookingMethodIds.length === 0) {
    return;
  }

  await prisma.menuItemCookingMethod.createMany({
    data: cookingMethodIds.map((cookingMethodId, index) => ({
      menuItemId,
      cookingMethodId,
      sortOrder: index,
    })),
  });
}

async function updateMenuItem(
  restaurantId: string,
  menuItemId: string,
  input: UpdateMenuItemInput,
) {
  const existingItem = await getMenuItemRecord(restaurantId, menuItemId);

  if (!existingItem) {
    return null;
  }

  if (input.menuCategoryId) {
    await assertMenuCategoryBelongsToRestaurant(
      restaurantId,
      input.menuCategoryId,
    );
  }

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  if (input.cookingMethodIds) {
    await assertCookingMethodsBelongToRestaurant(
      restaurantId,
      input.cookingMethodIds,
    );
  }

  const existingArName =
    existingItem.translations.find((translation) => translation.locale === "AR")
      ?.name ?? "menu-item";

  await prisma.$transaction(async (tx) => {
    await tx.menuItem.update({
      where: { id: menuItemId },
      data: {
        menuCategoryId: input.menuCategoryId,
        imageAssetId: input.imageAssetId,
        isAvailable: input.isAvailable,
        isFeatured: input.isFeatured,
        isVisible: input.isVisible,
        sortOrder: input.sortOrder,
        status: input.status,
      },
    });

    if (input.translations?.ar) {
      const arTranslation = input.translations.ar;

      await tx.menuItemTranslation.upsert({
        where: {
          menuItemId_locale: {
            menuItemId,
            locale: "AR",
          },
        },
        create: {
          menuItemId,
          locale: "AR",
          name: arTranslation.name ?? "",
          description: arTranslation.description ?? null,
          slug: resolveTranslationSlug(
            arTranslation.slug,
            arTranslation.name ?? existingArName,
          ),
        },
        update: {
          name: arTranslation.name,
          description: arTranslation.description,
          slug:
            arTranslation.slug !== undefined
              ? resolveTranslationSlug(
                  arTranslation.slug,
                  arTranslation.name ?? existingArName,
                )
              : undefined,
        },
      });
    }

    if (input.translations?.en) {
      const enTranslation = input.translations.en;

      if (enTranslation.name === null) {
        await tx.menuItemTranslation.deleteMany({
          where: {
            menuItemId,
            locale: "EN",
          },
        });
      } else {
        await tx.menuItemTranslation.upsert({
          where: {
            menuItemId_locale: {
              menuItemId,
              locale: "EN",
            },
          },
          create: {
            menuItemId,
            locale: "EN",
            name: enTranslation.name ?? "",
            description: enTranslation.description ?? null,
            slug: resolveTranslationSlug(
              enTranslation.slug,
              enTranslation.name ?? existingArName,
            ),
          },
          update: {
            name: enTranslation.name,
            description: enTranslation.description,
            slug:
              enTranslation.slug !== undefined
                ? resolveTranslationSlug(
                    enTranslation.slug,
                    enTranslation.name ?? existingArName,
                  )
                : undefined,
          },
        });
      }
    }
  });

  if (input.priceVariants) {
    await syncPriceVariants(menuItemId, input.priceVariants);
  }

  if (input.cookingMethodIds) {
    await syncCookingMethodAssignments(menuItemId, input.cookingMethodIds);
  }

  return getMenuItemRecord(restaurantId, menuItemId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { menuItemId } = await context.params;
    const item = await getMenuItemRecord(
      authorization.user.restaurantId,
      menuItemId,
    );

    if (!item) {
      return jsonError("Menu item was not found.", 404);
    }

    return NextResponse.json({
      data: serializeMenuItem(item),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load menu item.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "menu.manage")) {
      return jsonError("menu.manage permission required.", 403);
    }

    const { menuItemId } = await context.params;
    const body = await request.json();
    const parsed = updateMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid menu item payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const item = await updateMenuItem(
      authorization.user.restaurantId,
      menuItemId,
      parsed.data,
    );

    if (!item) {
      return jsonError("Menu item was not found.", 404);
    }

    return NextResponse.json({
      data: serializeMenuItem(item),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Menu item was not found.", 404);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("A related menu item record already exists.", 409);
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Menu category") ||
        error.message.includes("Media asset") ||
        error.message.includes("cooking methods") ||
        error.message.includes("price variants")
      ) {
        return jsonError(error.message, 400);
      }
    }

    return jsonError("Unable to update menu item.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "menu.manage")) {
      return jsonError("menu.manage permission required.", 403);
    }

    const { menuItemId } = await context.params;
    const deleteCheck = await assertMenuItemCanBeDeleted(
      authorization.user.restaurantId,
      menuItemId,
    );

    if (deleteCheck === "not_found") {
      return jsonError("Menu item was not found.", 404);
    }

    await prisma.menuItem.delete({
      where: { id: menuItemId },
    });

    return NextResponse.json({
      data: {
        id: menuItemId,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message.startsWith("Cannot delete")) {
      return jsonError(error.message, 409);
    }

    return jsonError("Unable to delete menu item.", 500);
  }
}
