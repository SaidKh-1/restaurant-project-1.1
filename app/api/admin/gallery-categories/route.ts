import {
  getGalleryCategoryRecord,
  listGalleryCategories,
  serializeGalleryCategory,
} from "@/lib/api/gallery-categories";
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

const categoryTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).nullable().optional(),
  })
  .strict();

const optionalCategoryTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
  })
  .strict();

const createGalleryCategorySchema = z
  .object({
    slug: z.string().trim().min(1).max(160),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    translations: z
      .object({
        ar: categoryTranslationFieldsSchema,
        en: optionalCategoryTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

type CreateGalleryCategoryInput = z.infer<typeof createGalleryCategorySchema>;

async function createGalleryCategory(
  restaurantId: string,
  input: CreateGalleryCategoryInput,
) {
  const category = await prisma.$transaction(async (tx) => {
    return tx.galleryCategory.create({
      data: {
        restaurantId,
        slug: input.slug,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
        translations: {
          create: [
            {
              locale: "AR",
              name: input.translations.ar.name,
              description: input.translations.ar.description ?? null,
            },
            ...(input.translations.en?.name
              ? [
                  {
                    locale: "EN" as const,
                    name: input.translations.en.name,
                    description: input.translations.en.description ?? null,
                  },
                ]
              : []),
          ],
        },
      },
    });
  });

  const record = await getGalleryCategoryRecord(restaurantId, category.id);

  if (!record) {
    throw new Error("Created gallery category could not be loaded.");
  }

  return record;
}

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();

    return NextResponse.json({
      data: await listGalleryCategories(authorization.user.restaurantId),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load gallery categories.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "gallery.manage")) {
      return jsonError("gallery.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createGalleryCategorySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid gallery category payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const category = await createGalleryCategory(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: serializeGalleryCategory(category),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("A gallery category with this slug already exists.", 409);
    }

    return jsonError("Unable to create gallery category.", 500);
  }
}
