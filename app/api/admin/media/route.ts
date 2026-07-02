import {
  buildMediaRecordPaths,
  getMediaLibraryRecord,
  listMediaAssets,
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
import { jsonError } from "@/lib/api/http";
import {
  MediaValidationError,
  processUploadedImage,
} from "@/lib/media/process-image";
import {
  deleteAssetFiles,
  sanitizeOriginalFilename,
  writeOptimizedImage,
  writeThumbnailImage,
} from "@/lib/media/storage";
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

const uploadMetadataSchema = z
  .object({
    usageType: mediaUsageTypeSchema.optional(),
    originalFilename: z.string().trim().max(255).nullable().optional(),
    translations: z
      .object({
        ar: mediaTranslationInputSchema.optional(),
        en: mediaTranslationInputSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

function parseUploadMetadata(formData: FormData) {
  const rawMetadata = formData.get("metadata");

  if (rawMetadata === null || rawMetadata === "") {
    return uploadMetadataSchema.safeParse({});
  }

  if (typeof rawMetadata !== "string") {
    return {
      success: false as const,
      message: "metadata must be a JSON string.",
    };
  }

  try {
    return uploadMetadataSchema.safeParse(JSON.parse(rawMetadata));
  } catch {
    return {
      success: false as const,
      message: "metadata must be valid JSON.",
    };
  }
}

async function createMediaAssetFromUpload(
  restaurantId: string,
  uploadedById: string,
  file: File,
  metadata: z.infer<typeof uploadMetadataSchema>,
) {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const processed = await processUploadedImage(fileBuffer, file.type || null);
  const asset = await prisma.mediaAsset.create({
    data: {
      restaurantId,
      storageKey: "pending",
      publicUrl: "pending",
      mimeType: processed.mimeType,
      fileSize: processed.fileSize,
      width: processed.width,
      height: processed.height,
      originalFilename:
        sanitizeOriginalFilename(metadata.originalFilename ?? file.name) ??
        sanitizeOriginalFilename(file.name),
      usageType: metadata.usageType ?? "OTHER",
      uploadedById,
      status: "ACTIVE",
    },
  });

  const paths = buildMediaRecordPaths(restaurantId, asset.id);

  try {
    await writeOptimizedImage(
      restaurantId,
      asset.id,
      processed.optimizedBuffer,
    );
    await writeThumbnailImage(
      restaurantId,
      asset.id,
      processed.thumbnailBuffer,
    );

    await upsertMediaTranslations(asset.id, metadata.translations);

    const updatedAsset = await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        storageKey: paths.storageKey,
        publicUrl: paths.publicUrl,
      },
    });

    const record = await getMediaLibraryRecord(restaurantId, updatedAsset.id);

    if (!record) {
      throw new Error("Uploaded media asset could not be loaded.");
    }

    return record;
  } catch (error) {
    await deleteAssetFiles(restaurantId, asset.id).catch(() => undefined);
    await prisma.mediaAsset.delete({ where: { id: asset.id } }).catch(() => undefined);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const usageTypeParam = searchParams.get("usageType");
    const statusParam = searchParams.get("status");

    const usageTypeResult = usageTypeParam
      ? mediaUsageTypeSchema.safeParse(usageTypeParam)
      : null;

    if (usageTypeResult && !usageTypeResult.success) {
      return jsonError("Invalid usageType filter.", 400);
    }

    if (statusParam && statusParam !== "ACTIVE" && statusParam !== "ARCHIVED") {
      return jsonError("Invalid status filter.", 400);
    }

    return NextResponse.json({
      data: await listMediaAssets(authorization.user.restaurantId, {
        usageType: usageTypeResult?.success ? usageTypeResult.data : undefined,
        status:
          statusParam === "ACTIVE" || statusParam === "ARCHIVED"
            ? statusParam
            : undefined,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load media library.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "media.manage")) {
      return jsonError("media.manage permission required.", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("An image file is required.", 400);
    }

    const metadataResult = parseUploadMetadata(formData);

    if (!metadataResult.success) {
      return jsonError(
        "message" in metadataResult
          ? metadataResult.message
          : "Invalid metadata payload.",
        400,
        "error" in metadataResult
          ? { issues: metadataResult.error.issues }
          : undefined,
      );
    }

    const asset = await createMediaAssetFromUpload(
      authorization.user.restaurantId,
      authorization.user.id,
      file,
      metadataResult.data,
    );

    return NextResponse.json(
      {
        data: serializeMediaLibraryAsset(asset),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof MediaValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to upload media asset.", 500);
  }
}
