import {
  assertMediaAssetBelongsToRestaurant,
  assertParentCategoryBelongsToRestaurant,
  getMenuCategoryRecord,
  listMenuCategories,
  serializeMenuCategory,
} from "@/lib/api/menu-categories";
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

const categoryTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).nullable().optional(),
    slug: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

const optionalCategoryTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    slug: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

const createMenuCategorySchema = z
  .object({
    slug: z.string().trim().min(1).max(160),
    parentCategoryId: nullableIdSchema.optional(),
    imageAssetId: nullableIdSchema.optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    translations: z
      .object({
        ar: categoryTranslationFieldsSchema,
        en: optionalCategoryTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>;

function resolveTranslationSlug(
  translationSlug: string | undefined,
  fallbackSlug: string,
) {
  return translationSlug?.trim() || fallbackSlug;
}

async function createMenuCategory(
  restaurantId: string,
  input: CreateMenuCategoryInput,
) {
  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);
  await assertParentCategoryBelongsToRestaurant(
    restaurantId,
    input.parentCategoryId,
  );

  const arSlug = resolveTranslationSlug(
    input.translations.ar.slug,
    input.slug,
  );

  const category = await prisma.$transaction(async (tx) => {
    const createdCategory = await tx.menuCategory.create({
      data: {
        restaurantId,
        slug: input.slug,
        parentCategoryId: input.parentCategoryId ?? null,
        imageAssetId: input.imageAssetId ?? null,
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
                      input.slug,
                    ),
                  },
                ]
              : []),
          ],
        },
      },
    });

    return createdCategory;
  });

  const record = await getMenuCategoryRecord(restaurantId, category.id);

  if (!record) {
    throw new Error("Created menu category could not be loaded.");
  }

  return record;
}

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();

    return NextResponse.json({
      data: await listMenuCategories(authorization.user.restaurantId),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load menu categories.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "menu.manage")) {
      return jsonError("menu.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createMenuCategorySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid menu category payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const category = await createMenuCategory(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: serializeMenuCategory(category),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("A menu category with this slug already exists.", 409);
    }

    if (error instanceof Error) {
      if (error.message.includes("Media asset")) {
        return jsonError(error.message, 400);
      }

      if (error.message.includes("Parent category")) {
        return jsonError(error.message, 400);
      }
    }

    return jsonError("Unable to create menu category.", 500);
  }
}
