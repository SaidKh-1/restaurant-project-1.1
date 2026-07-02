import {
  assertReviewCanBeDeleted,
  extractPartialReviewContent,
  getAdminReviewRecord,
} from "@/lib/api/reviews";
import { revalidatePublicReviewsCache } from "@/lib/api/public-cache";
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

const reviewStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
  "DELETED",
]);

const publicReviewNameModeSchema = z.enum(["FULL", "FIRST_NAME", "SHORTENED"]);
const nullableIdSchema = z.string().min(1).nullable();

const updateReviewSchema = z
  .object({
    status: reviewStatusSchema.optional(),
    isFeatured: z.boolean().optional(),
    publicNameMode: publicReviewNameModeSchema.optional(),
    imageAssetId: nullableIdSchema.optional(),
    translations: z
      .object({
        ar: z
          .object({
            title: z.string().trim().max(200).nullable().optional(),
            comment: z.string().trim().min(1).max(4000).optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            title: z.string().trim().max(200).nullable().optional(),
            comment: z.string().trim().min(1).max(4000).nullable().optional(),
          })
          .strict()
          .nullable()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

async function updateReview(
  restaurantId: string,
  reviewId: string,
  userId: string,
  input: UpdateReviewInput,
) {
  const existingReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      restaurantId,
    },
  });

  if (!existingReview) {
    return null;
  }

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  const contentUpdates = extractPartialReviewContent(input.translations);
  const statusChangedToApproved =
    input.status === "APPROVED" && existingReview.status !== "APPROVED";
  const statusChanged =
    input.status !== undefined && input.status !== existingReview.status;
  const affectsPublicVisibility =
    statusChanged &&
    (existingReview.status === "APPROVED" ||
      input.status === "APPROVED");

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: input.status,
      isFeatured: input.isFeatured,
      publicNameMode: input.publicNameMode,
      imageAssetId: input.imageAssetId,
      ...contentUpdates,
      ...(statusChangedToApproved
        ? {
            approvedById: userId,
            approvedAt: new Date(),
          }
        : input.status && input.status !== "APPROVED"
          ? {
              approvedById: null,
              approvedAt: null,
            }
          : {}),
    },
  });

  if (affectsPublicVisibility) {
    revalidatePublicReviewsCache();
  }

  return getAdminReviewRecord(restaurantId, reviewId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { reviewId } = await context.params;
    const review = await getAdminReviewRecord(
      authorization.user.restaurantId,
      reviewId,
    );

    if (!review) {
      return jsonError("Review was not found.", 404);
    }

    return NextResponse.json({
      data: review,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load review.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "reviews.manage")) {
      return jsonError("reviews.manage permission required.", 403);
    }

    const { reviewId } = await context.params;
    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid review payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const review = await updateReview(
      authorization.user.restaurantId,
      reviewId,
      authorization.user.id,
      parsed.data,
    );

    if (!review) {
      return jsonError("Review was not found.", 404);
    }

    return NextResponse.json({
      data: review,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Review was not found.", 404);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update review.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "reviews.manage")) {
      return jsonError("reviews.manage permission required.", 403);
    }

    const { reviewId } = await context.params;
    const deleteCheck = await assertReviewCanBeDeleted(
      authorization.user.restaurantId,
      reviewId,
    );

    if (deleteCheck === "not_found") {
      return jsonError("Review was not found.", 404);
    }

    const reviewBeforeDelete = await prisma.review.findFirst({
      where: {
        id: reviewId,
        restaurantId: authorization.user.restaurantId,
      },
      select: { status: true },
    });

    await prisma.review.delete({
      where: { id: reviewId },
    });

    if (reviewBeforeDelete?.status === "APPROVED") {
      revalidatePublicReviewsCache();
    }

    return NextResponse.json({
      data: {
        id: reviewId,
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

    return jsonError("Unable to delete review.", 500);
  }
}
