import {
  assertMediaAssetCanBeDeleted,
  getMediaLibraryRecord,
  serializeMediaLibraryAsset,
  upsertMediaTranslations,
} from "@/lib/api/media-library";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError, isRecordNotFoundError } from "@/lib/api/http";
import { deleteAssetFiles, sanitizeOriginalFilename } from "@/lib/media/storage";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const mediaUsageTypeSchema = z.enum([
  "LOGO",
  "FAVICON",
  "HERO",
  "MENU_ITEM",
  "OFFER",
  "GALLERY",
  "MANAGER",
  "REVIEW",
  "OPEN_GRAPH",
  "OTHER",
]);

const mediaTranslationInputSchema = z
  .object({
    altText: z.string().trim().max(500).nullable().optional(),
    caption: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

const updateMediaAssetSchema = z
  .object({
    originalFilename: z.string().trim().min(1).max(255).nullable().optional(),
    usageType: mediaUsageTypeSchema.optional(),
    translations: z
      .object({
        ar: mediaTranslationInputSchema.optional(),
        en: mediaTranslationInputSchema.nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type RouteContext = {
  params: Promise<{ mediaAssetId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { mediaAssetId } = await context.params;
    const asset = await getMediaLibraryRecord(
      authorization.user.restaurantId,
      mediaAssetId,
    );

    if (!asset) {
      return jsonError("Media asset was not found.", 404);
    }

    return NextResponse.json({
      data: serializeMediaLibraryAsset(asset),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load media asset.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "media.manage")) {
      return jsonError("media.manage permission required.", 403);
    }

    const { mediaAssetId } = await context.params;
    const existingAsset = await getMediaLibraryRecord(
      authorization.user.restaurantId,
      mediaAssetId,
    );

    if (!existingAsset) {
      return jsonError("Media asset was not found.", 404);
    }

    const body = await request.json();
    const parsed = updateMediaAssetSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid media asset payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    await prisma.mediaAsset.update({
      where: { id: mediaAssetId },
      data: {
        originalFilename:
          parsed.data.originalFilename === undefined
            ? undefined
            : parsed.data.originalFilename === null
              ? null
              : sanitizeOriginalFilename(parsed.data.originalFilename),
        usageType: parsed.data.usageType,
      },
    });

    await upsertMediaTranslations(mediaAssetId, {
      ar: parsed.data.translations?.ar,
      en:
        parsed.data.translations?.en === null
          ? null
          : parsed.data.translations?.en,
    });

    const asset = await getMediaLibraryRecord(
      authorization.user.restaurantId,
      mediaAssetId,
    );

    if (!asset) {
      return jsonError("Media asset was not found.", 404);
    }

    return NextResponse.json({
      data: serializeMediaLibraryAsset(asset),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Media asset was not found.", 404);
    }

    return jsonError("Unable to update media asset.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "media.manage")) {
      return jsonError("media.manage permission required.", 403);
    }

    const { mediaAssetId } = await context.params;
    const deleteCheck = await assertMediaAssetCanBeDeleted(
      authorization.user.restaurantId,
      mediaAssetId,
    );

    if (deleteCheck.status === "not_found") {
      return jsonError("Media asset was not found.", 404);
    }

    if (deleteCheck.status === "in_use") {
      return jsonError(
        "Cannot delete a media asset that is currently in use.",
        409,
        {
          usage: deleteCheck.usage,
        },
      );
    }

    await deleteAssetFiles(
      authorization.user.restaurantId,
      mediaAssetId,
    );

    await prisma.mediaAsset.delete({
      where: { id: mediaAssetId },
    });

    return NextResponse.json({
      data: {
        id: mediaAssetId,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to delete media asset.", 500);
  }
}
