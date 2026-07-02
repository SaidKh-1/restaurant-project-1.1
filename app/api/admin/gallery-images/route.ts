import { assertGalleryCategoryBelongsToRestaurant } from "@/lib/api/gallery-categories";
import {
  getGalleryImageRecord,
  listGalleryImages,
  mapGalleryImageTranslationInput,
  serializeGalleryImage,
} from "@/lib/api/gallery-images";
import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const cmsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const nullableIdSchema = z.string().min(1).nullable();

const galleryImageTranslationFieldsSchema = z
  .object({
    altText: z.string().trim().min(1).max(500),
    caption: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

const optionalGalleryImageTranslationFieldsSchema = z
  .object({
    altText: z.string().trim().min(1).max(500).optional(),
    caption: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

const createGalleryImageSchema = z
  .object({
    mediaAssetId: z.string().trim().min(1),
    galleryCategoryId: nullableIdSchema.optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    translations: z
      .object({
        ar: galleryImageTranslationFieldsSchema,
        en: optionalGalleryImageTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;

async function createGalleryImage(
  restaurantId: string,
  input: CreateGalleryImageInput,
) {
  await assertMediaAssetBelongsToRestaurant(restaurantId, input.mediaAssetId);
  await assertGalleryCategoryBelongsToRestaurant(
    restaurantId,
    input.galleryCategoryId,
  );

  const image = await prisma.$transaction(async (tx) => {
    return tx.galleryImage.create({
      data: {
        restaurantId,
        mediaAssetId: input.mediaAssetId,
        galleryCategoryId: input.galleryCategoryId ?? null,
        isFeatured: input.isFeatured ?? false,
        isVisible: input.isVisible ?? true,
        sortOrder: input.sortOrder ?? 0,
        status: input.status ?? "DRAFT",
        translations: {
          create: [
            {
              locale: "AR",
              ...mapGalleryImageTranslationInput(input.translations.ar),
            },
            ...(input.translations.en?.altText
              ? [
                  {
                    locale: "EN" as const,
                    ...mapGalleryImageTranslationInput(input.translations.en),
                  },
                ]
              : []),
          ],
        },
      },
    });
  });

  const record = await getGalleryImageRecord(restaurantId, image.id);

  if (!record) {
    throw new Error("Created gallery image could not be loaded.");
  }

  return record;
}

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const galleryCategoryId = searchParams.get("galleryCategoryId") ?? undefined;
    const statusParam = searchParams.get("status");
    const isVisibleParam = searchParams.get("isVisible");

    if (
      galleryCategoryId !== undefined &&
      galleryCategoryId.trim().length === 0
    ) {
      return jsonError("galleryCategoryId must not be empty.", 400);
    }

    const statusResult = statusParam
      ? cmsStatusSchema.safeParse(statusParam)
      : null;

    if (statusResult && !statusResult.success) {
      return jsonError("Invalid status filter.", 400);
    }

    let isVisible: boolean | undefined;

    if (isVisibleParam !== null) {
      if (isVisibleParam !== "true" && isVisibleParam !== "false") {
        return jsonError("isVisible filter must be true or false.", 400);
      }

      isVisible = isVisibleParam === "true";
    }

    return NextResponse.json({
      data: await listGalleryImages(authorization.user.restaurantId, {
        galleryCategoryId,
        status: statusResult?.success ? statusResult.data : undefined,
        isVisible,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load gallery images.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "gallery.manage")) {
      return jsonError("gallery.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createGalleryImageSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid gallery image payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const image = await createGalleryImage(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: serializeGalleryImage(image),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Media asset") ||
        error.message.includes("Gallery category")
      ) {
        return jsonError(error.message, 400);
      }
    }

    return jsonError("Unable to create gallery image.", 500);
  }
}
