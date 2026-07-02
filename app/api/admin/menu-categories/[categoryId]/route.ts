import {
  assertMediaAssetBelongsToRestaurant,
  assertMenuCategoryCanBeDeleted,
  assertParentCategoryBelongsToRestaurant,
  getMenuCategoryRecord,
  serializeMenuCategory,
} from "@/lib/api/menu-categories";
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

const updateMenuCategorySchema = z
  .object({
    slug: z.string().trim().min(1).max(160).optional(),
    parentCategoryId: nullableIdSchema.optional(),
    imageAssetId: nullableIdSchema.optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
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
  })
  .strict();

type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>;

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

function resolveTranslationSlug(
  translationSlug: string | null | undefined,
  fallbackSlug: string,
) {
  if (translationSlug === null || translationSlug === undefined) {
    return fallbackSlug;
  }

  return translationSlug.trim() || fallbackSlug;
}

async function updateMenuCategory(
  restaurantId: string,
  categoryId: string,
  input: UpdateMenuCategoryInput,
) {
  const existingCategory = await getMenuCategoryRecord(restaurantId, categoryId);

  if (!existingCategory) {
    return null;
  }

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  if (input.parentCategoryId !== undefined) {
    await assertParentCategoryBelongsToRestaurant(
      restaurantId,
      input.parentCategoryId,
      categoryId,
    );
  }

  const fallbackSlug = input.slug ?? existingCategory.slug;

  await prisma.$transaction(async (tx) => {
    await tx.menuCategory.update({
      where: { id: categoryId },
      data: {
        slug: input.slug,
        parentCategoryId: input.parentCategoryId,
        imageAssetId: input.imageAssetId,
        isVisible: input.isVisible,
        sortOrder: input.sortOrder,
        status: input.status,
      },
    });

    if (input.translations?.ar) {
      const arTranslation = input.translations.ar;

      await tx.menuCategoryTranslation.upsert({
        where: {
          menuCategoryId_locale: {
            menuCategoryId: categoryId,
            locale: "AR",
          },
        },
        create: {
          menuCategoryId: categoryId,
          locale: "AR",
          name: arTranslation.name ?? "",
          description: arTranslation.description ?? null,
          slug: resolveTranslationSlug(arTranslation.slug, fallbackSlug),
        },
        update: {
          name: arTranslation.name,
          description: arTranslation.description,
          slug:
            arTranslation.slug !== undefined
              ? resolveTranslationSlug(arTranslation.slug, fallbackSlug)
              : undefined,
        },
      });
    }

    if (input.translations?.en) {
      const enTranslation = input.translations.en;

      if (enTranslation.name === null) {
        await tx.menuCategoryTranslation.deleteMany({
          where: {
            menuCategoryId: categoryId,
            locale: "EN",
          },
        });
      } else {
        await tx.menuCategoryTranslation.upsert({
          where: {
            menuCategoryId_locale: {
              menuCategoryId: categoryId,
              locale: "EN",
            },
          },
          create: {
            menuCategoryId: categoryId,
            locale: "EN",
            name: enTranslation.name ?? "",
            description: enTranslation.description ?? null,
            slug: resolveTranslationSlug(enTranslation.slug, fallbackSlug),
          },
          update: {
            name: enTranslation.name,
            description: enTranslation.description,
            slug:
              enTranslation.slug !== undefined
                ? resolveTranslationSlug(enTranslation.slug, fallbackSlug)
                : undefined,
          },
        });
      }
    }
  });

  return getMenuCategoryRecord(restaurantId, categoryId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { categoryId } = await context.params;
    const category = await getMenuCategoryRecord(
      authorization.user.restaurantId,
      categoryId,
    );

    if (!category) {
      return jsonError("Menu category was not found.", 404);
    }

    return NextResponse.json({
      data: serializeMenuCategory(category),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load menu category.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "menu.manage")) {
      return jsonError("menu.manage permission required.", 403);
    }

    const { categoryId } = await context.params;
    const body = await request.json();
    const parsed = updateMenuCategorySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid menu category payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const category = await updateMenuCategory(
      authorization.user.restaurantId,
      categoryId,
      parsed.data,
    );

    if (!category) {
      return jsonError("Menu category was not found.", 404);
    }

    return NextResponse.json({
      data: serializeMenuCategory(category),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Menu category was not found.", 404);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("A menu category with this slug already exists.", 409);
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Media asset") ||
        error.message.includes("Parent category") ||
        error.message.includes("cannot be its own parent")
      ) {
        return jsonError(error.message, 400);
      }
    }

    return jsonError("Unable to update menu category.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "menu.manage")) {
      return jsonError("menu.manage permission required.", 403);
    }

    const { categoryId } = await context.params;
    const deleteCheck = await assertMenuCategoryCanBeDeleted(
      authorization.user.restaurantId,
      categoryId,
    );

    if (deleteCheck === "not_found") {
      return jsonError("Menu category was not found.", 404);
    }

    await prisma.menuCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      data: {
        id: categoryId,
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

    return jsonError("Unable to delete menu category.", 500);
  }
}
