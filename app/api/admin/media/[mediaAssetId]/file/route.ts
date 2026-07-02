import {
  getMediaLibraryRecord,
  serializeMediaLibraryAsset,
} from "@/lib/api/media-library";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api/http";
import {
  MediaValidationError,
  processUploadedImage,
} from "@/lib/media/process-image";
import { writeOptimizedImage, writeThumbnailImage } from "@/lib/media/storage";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ mediaAssetId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("An image file is required.", 400);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processUploadedImage(fileBuffer, file.type || null);

    await writeOptimizedImage(
      authorization.user.restaurantId,
      mediaAssetId,
      processed.optimizedBuffer,
    );
    await writeThumbnailImage(
      authorization.user.restaurantId,
      mediaAssetId,
      processed.thumbnailBuffer,
    );

    await prisma.mediaAsset.update({
      where: { id: mediaAssetId },
      data: {
        mimeType: processed.mimeType,
        fileSize: processed.fileSize,
        width: processed.width,
        height: processed.height,
      },
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

    if (error instanceof MediaValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to replace media asset.", 500);
  }
}
