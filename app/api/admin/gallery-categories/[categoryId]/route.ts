import {
  assertGalleryCategoryCanBeDeleted,
  getGalleryCategoryRecord,
  serializeGalleryCategory,
  upsertGalleryCategoryTranslation,
} from "@/lib/api/gallery-categories";
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

const updateGalleryCategorySchema = z
  .object({
    slug: z.string().trim().min(1).max(160).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    translations: z
      .object({
        ar: z
          .object({
            name: z.string().trim().min(1).max(160).optional(),
            description: z.string().trim().max(4000).nullable().optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            name: z.string().trim().min(1).max(160).nullable().optional(),
            description: z.string().trim().max(4000).nullable().optional(),
          })
          .strict()
          .nullable()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type UpdateGalleryCategoryInput = z.infer<typeof updateGalleryCategorySchema>;

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

async function updateGalleryCategory(
  restaurantId: string,
  categoryId: string,
  input: UpdateGalleryCategoryInput,
) {
  const existingCategory = await getGalleryCategoryRecord(
    restaurantId,
    categoryId,
  );

  if (!existingCategory) {
    return null;
  }

  await prisma.galleryCategory.update({
    where: { id: categoryId },
    data: {
      slug: input.slug,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });

  if (input.translations?.ar) {
    await upsertGalleryCategoryTranslation(
      categoryId,
      "AR",
      input.translations.ar,
      { partial: true },
    );
  }

  if (input.translations?.en === null) {
    await prisma.galleryCategoryTranslation.deleteMany({
      where: {
        galleryCategoryId: categoryId,
        locale: "EN",
      },
    });
  } else if (input.translations?.en) {
    const existingEn = existingCategory.translations.find(
      (translation) => translation.locale === "EN",
    );

    if (existingEn || input.translations.en.name) {
      await upsertGalleryCategoryTranslation(
        categoryId,
        "EN",
        input.translations.en,
        { partial: Boolean(existingEn) },
      );
    }
  }

  return getGalleryCategoryRecord(restaurantId, categoryId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { categoryId } = await context.params;
    const category = await getGalleryCategoryRecord(
      authorization.user.restaurantId,
      categoryId,
    );

    if (!category) {
      return jsonError("Gallery category was not found.", 404);
    }

    return NextResponse.json({
      data: serializeGalleryCategory(category),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load gallery category.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "gallery.manage")) {
      return jsonError("gallery.manage permission required.", 403);
    }

    const { categoryId } = await context.params;
    const body = await request.json();
    const parsed = updateGalleryCategorySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid gallery category payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const category = await updateGalleryCategory(
      authorization.user.restaurantId,
      categoryId,
      parsed.data,
    );

    if (!category) {
      return jsonError("Gallery category was not found.", 404);
    }

    return NextResponse.json({
      data: serializeGalleryCategory(category),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Gallery category was not found.", 404);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("A gallery category with this slug already exists.", 409);
    }

    return jsonError("Unable to update gallery category.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "gallery.manage")) {
      return jsonError("gallery.manage permission required.", 403);
    }

    const { categoryId } = await context.params;
    const deleteCheck = await assertGalleryCategoryCanBeDeleted(
      authorization.user.restaurantId,
      categoryId,
    );

    if (deleteCheck === "not_found") {
      return jsonError("Gallery category was not found.", 404);
    }

    await prisma.galleryCategory.delete({
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

    return jsonError("Unable to delete gallery category.", 500);
  }
}
