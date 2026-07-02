import {
  assertOfferCanBeDeleted,
  getOfferRecord,
  upsertOfferTranslation,
} from "@/lib/api/offers";
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

const linkSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value.startsWith("/") ||
      value.startsWith("http://") ||
      value.startsWith("https://"),
    {
      message: "Link must be a relative path or absolute URL.",
    },
  );

const updateOfferSchema = z
  .object({
    imageAssetId: nullableIdSchema.optional(),
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    translations: z
      .object({
        ar: z
          .object({
            title: z.string().trim().min(1).max(200).optional(),
            description: z.string().trim().max(4000).nullable().optional(),
            discountText: z.string().trim().max(160).nullable().optional(),
            ctaUrl: linkSchema.nullable().optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            title: z.string().trim().min(1).max(200).nullable().optional(),
            description: z.string().trim().max(4000).nullable().optional(),
            discountText: z.string().trim().max(160).nullable().optional(),
            ctaUrl: linkSchema.nullable().optional(),
          })
          .strict()
          .nullable()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.startsAt && value.endsAt) {
      const startsAt = new Date(value.startsAt);
      const endsAt = new Date(value.endsAt);

      if (endsAt <= startsAt) {
        context.addIssue({
          code: "custom",
          message: "endsAt must be after startsAt.",
          path: ["endsAt"],
        });
      }
    }
  });

type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

type RouteContext = {
  params: Promise<{ offerId: string }>;
};

async function updateOffer(
  restaurantId: string,
  offerId: string,
  input: UpdateOfferInput,
) {
  const existingOffer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      restaurantId,
    },
    include: {
      translations: true,
    },
  });

  if (!existingOffer) {
    return null;
  }

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  await prisma.offer.update({
    where: { id: offerId },
    data: {
      imageAssetId: input.imageAssetId,
      startsAt:
        input.startsAt === undefined
          ? undefined
          : input.startsAt
            ? new Date(input.startsAt)
            : null,
      endsAt:
        input.endsAt === undefined
          ? undefined
          : input.endsAt
            ? new Date(input.endsAt)
            : null,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
      status: input.status,
    },
  });

  if (input.translations?.ar) {
    await upsertOfferTranslation(offerId, "AR", input.translations.ar, {
      partial: true,
    });
  }

  if (input.translations?.en === null) {
    await prisma.offerTranslation.deleteMany({
      where: {
        offerId,
        locale: "EN",
      },
    });
  } else if (input.translations?.en) {
    const existingEn = existingOffer.translations.find(
      (translation) => translation.locale === "EN",
    );

    if (existingEn || input.translations.en.title) {
      await upsertOfferTranslation(offerId, "EN", input.translations.en, {
        partial: Boolean(existingEn),
      });
    }
  }

  return getOfferRecord(restaurantId, offerId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { offerId } = await context.params;
    const offer = await getOfferRecord(
      authorization.user.restaurantId,
      offerId,
    );

    if (!offer) {
      return jsonError("Offer was not found.", 404);
    }

    return NextResponse.json({
      data: offer,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load offer.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "offers.manage")) {
      return jsonError("offers.manage permission required.", 403);
    }

    const { offerId } = await context.params;
    const body = await request.json();
    const parsed = updateOfferSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid offer payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const offer = await updateOffer(
      authorization.user.restaurantId,
      offerId,
      parsed.data,
    );

    if (!offer) {
      return jsonError("Offer was not found.", 404);
    }

    return NextResponse.json({
      data: offer,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Offer was not found.", 404);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update offer.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "offers.manage")) {
      return jsonError("offers.manage permission required.", 403);
    }

    const { offerId } = await context.params;
    const deleteCheck = await assertOfferCanBeDeleted(
      authorization.user.restaurantId,
      offerId,
    );

    if (deleteCheck === "not_found") {
      return jsonError("Offer was not found.", 404);
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({
      data: {
        id: offerId,
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

    return jsonError("Unable to delete offer.", 500);
  }
}
