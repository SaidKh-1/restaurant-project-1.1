import {
  assertGalleryCategoryBelongsToRestaurant,
} from "@/lib/api/gallery-categories";
import {
  assertGalleryImageCanBeDeleted,
  getGalleryImageRecord,
  serializeGalleryImage,
  upsertGalleryImageTranslation,
} from "@/lib/api/gallery-images";
import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError, isRecordNotFoundError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const cmsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const nullableIdSchema = z.string().min(1).nullable();

const updateGalleryImageSchema = z
  .object({
    mediaAssetId: z.string().trim().min(1).optional(),
    galleryCategoryId: nullableIdSchema.optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    translations: z
      .object({
        ar: z
          .object({
            altText: z.string().trim().min(1).max(500).optional(),
            caption: z.string().trim().max(1000).nullable().optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            altText: z.string().trim().min(1).max(500).nullable().optional(),
            caption: z.string().trim().max(1000).nullable().optional(),
          })
          .strict()
          .nullable()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

async function updateGalleryImage(
  restaurantId: string,
  galleryImageId: string,
  input: UpdateGalleryImageInput,
) {
  const existingImage = await getGalleryImageRecord(
    restaurantId,
    galleryImageId,
  );

  if (!existingImage) {
    return null;
  }

  if (input.mediaAssetId) {
    await assertMediaAssetBelongsToRestaurant(restaurantId, input.mediaAssetId);
  }

  if (input.galleryCategoryId !== undefined) {
    await assertGalleryCategoryBelongsToRestaurant(
      restaurantId,
      input.galleryCategoryId,
    );
  }

  await prisma.galleryImage.update({
    where: { id: galleryImageId },
    data: {
      mediaAssetId: input.mediaAssetId,
      galleryCategoryId: input.galleryCategoryId,
      isFeatured: input.isFeatured,
      isVisible: input.isVisible,
      sortOrder: input.sortOrder,
      status: input.status,
    },
  });

  if (input.translations?.ar) {
    await upsertGalleryImageTranslation(
      galleryImageId,
      "AR",
      input.translations.ar,
      { partial: true },
    );
  }

  if (input.translations?.en === null) {
    await prisma.galleryImageTranslation.deleteMany({
      where: {
        galleryImageId,
        locale: "EN",
      },
    });
  } else if (input.translations?.en) {
    const existingEn = existingImage.translations.find(
      (translation) => translation.locale === "EN",
    );

    if (existingEn || input.translations.en.altText) {
      await upsertGalleryImageTranslation(
        galleryImageId,
        "EN",
        input.translations.en,
        { partial: Boolean(existingEn) },
      );
    }
  }

  return getGalleryImageRecord(restaurantId, galleryImageId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { imageId } = await context.params;
    const image = await getGalleryImageRecord(
      authorization.user.restaurantId,
      imageId,
    );

    if (!image) {
      return jsonError("Gallery image was not found.", 404);
    }

    return NextResponse.json({
      data: serializeGalleryImage(image),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load gallery image.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "gallery.manage")) {
      return jsonError("gallery.manage permission required.", 403);
    }

    const { imageId } = await context.params;
    const body = await request.json();
    const parsed = updateGalleryImageSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid gallery image payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const image = await updateGalleryImage(
      authorization.user.restaurantId,
      imageId,
      parsed.data,
    );

    if (!image) {
      return jsonError("Gallery image was not found.", 404);
    }

    return NextResponse.json({
      data: serializeGalleryImage(image),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Gallery image was not found.", 404);
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Media asset") ||
        error.message.includes("Gallery category")
      ) {
        return jsonError(error.message, 400);
      }
    }

    return jsonError("Unable to update gallery image.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "gallery.manage")) {
      return jsonError("gallery.manage permission required.", 403);
    }

    const { imageId } = await context.params;
    const deleteCheck = await assertGalleryImageCanBeDeleted(
      authorization.user.restaurantId,
      imageId,
    );

    if (deleteCheck === "not_found") {
      return jsonError("Gallery image was not found.", 404);
    }

    await prisma.galleryImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      data: {
        id: imageId,
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

    return jsonError("Unable to delete gallery image.", 500);
  }
}
