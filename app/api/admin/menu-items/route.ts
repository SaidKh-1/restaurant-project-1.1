import {
  assertCookingMethodsBelongToRestaurant,
  assertMediaAssetBelongsToRestaurant,
  assertMenuCategoryBelongsToRestaurant,
  getMenuItemRecord,
  listMenuItems,
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
import { jsonError, isUniqueConstraintError } from "@/lib/api/http";
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

const itemTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).nullable().optional(),
    slug: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

const optionalItemTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    slug: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

const priceVariantTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
  })
  .strict();

const optionalPriceVariantTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160).nullable().optional(),
  })
  .strict();

const createPriceVariantSchema = z
  .object({
    price: z.number().positive().max(99999999.99),
    unit: menuUnitInputSchema,
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    translations: z
      .object({
        ar: priceVariantTranslationFieldsSchema,
        en: optionalPriceVariantTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

const createMenuItemSchema = z
  .object({
    menuCategoryId: z.string().trim().min(1),
    imageAssetId: nullableIdSchema.optional(),
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    cookingMethodIds: z.array(z.string().trim().min(1)).max(20).optional(),
    translations: z
      .object({
        ar: itemTranslationFieldsSchema,
        en: optionalItemTranslationFieldsSchema.optional(),
      })
      .strict(),
    priceVariants: z.array(createPriceVariantSchema).min(1).max(20),
  })
  .strict();

type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

function resolveTranslationSlug(
  translationSlug: string | undefined,
  fallbackText: string,
) {
  return translationSlug?.trim() || slugifyMenuText(fallbackText);
}

async function createPriceVariants(
  menuItemId: string,
  priceVariants: CreateMenuItemInput["priceVariants"],
) {
  for (const [index, variant] of priceVariants.entries()) {
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

async function createCookingMethodAssignments(
  menuItemId: string,
  cookingMethodIds: string[],
) {
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

async function createMenuItem(
  restaurantId: string,
  input: CreateMenuItemInput,
) {
  await assertMenuCategoryBelongsToRestaurant(
    restaurantId,
    input.menuCategoryId,
  );
  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);
  await assertCookingMethodsBelongToRestaurant(
    restaurantId,
    input.cookingMethodIds ?? [],
  );

  const arSlug = resolveTranslationSlug(
    input.translations.ar.slug,
    input.translations.ar.name,
  );

  const item = await prisma.$transaction(async (tx) => {
    const createdItem = await tx.menuItem.create({
      data: {
        restaurantId,
        menuCategoryId: input.menuCategoryId,
        imageAssetId: input.imageAssetId ?? null,
        isAvailable: input.isAvailable ?? true,
        isFeatured: input.isFeatured ?? false,
        isVisible: input.isVisible ?? true,
        sortOrder: input.sortOrder ?? 0,
        status: input.status ?? "DRAFT",
        translations: {
          create: [
            {
              locale: "AR",
              name: input.translations.ar.name,
              description: input.translations.ar.description ?? null,
              slug: arSlug,
            },
            ...(input.translations.en?.name
              ? [
                  {
                    locale: "EN" as const,
                    name: input.translations.en.name,
                    description: input.translations.en.description ?? null,
                    slug: resolveTranslationSlug(
                      input.translations.en.slug,
                      input.translations.en.name,
                    ),
                  },
                ]
              : []),
          ],
        },
      },
    });

    return createdItem;
  });

  await createPriceVariants(item.id, input.priceVariants);
  await createCookingMethodAssignments(
    item.id,
    input.cookingMethodIds ?? [],
  );

  const record = await getMenuItemRecord(restaurantId, item.id);

  if (!record) {
    throw new Error("Created menu item could not be loaded.");
  }

  return record;
}

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const menuCategoryId = searchParams.get("menuCategoryId") ?? undefined;

    if (menuCategoryId !== undefined && menuCategoryId.trim().length === 0) {
      return jsonError("menuCategoryId must not be empty.", 400);
    }

    return NextResponse.json({
      data: await listMenuItems(authorization.user.restaurantId, {
        menuCategoryId,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load menu items.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "menu.manage")) {
      return jsonError("menu.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid menu item payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const item = await createMenuItem(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: serializeMenuItem(item),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("A related menu item record already exists.", 409);
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Menu category") ||
        error.message.includes("Media asset") ||
        error.message.includes("cooking methods")
      ) {
        return jsonError(error.message, 400);
      }
    }

    return jsonError("Unable to create menu item.", 500);
  }
}
