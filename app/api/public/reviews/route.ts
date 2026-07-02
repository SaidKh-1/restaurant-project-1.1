import {
  extractReviewContent,
  getDefaultRestaurantWithSettings,
  listPublicReviews,
} from "@/lib/api/reviews";
import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const reviewTranslationFieldsSchema = z
  .object({
    title: z.string().trim().max(200).nullable().optional(),
    comment: z.string().trim().min(1).max(4000),
  })
  .strict();

const optionalReviewTranslationFieldsSchema = z
  .object({
    title: z.string().trim().max(200).nullable().optional(),
    comment: z.string().trim().min(1).max(4000).optional(),
  })
  .strict();

const submitPublicReviewSchema = z
  .object({
    customerName: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(80).nullable().optional(),
    rating: z.number().int().min(1).max(5),
    imageAssetId: z.string().trim().min(1).nullable().optional(),
    translations: z
      .object({
        ar: reviewTranslationFieldsSchema,
        en: optionalReviewTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

type SubmitPublicReviewInput = z.infer<typeof submitPublicReviewSchema>;

function validatePhoneAgainstSettings(
  phone: string | null | undefined,
  reviewPhoneMode: "OPTIONAL" | "REQUIRED" | "HIDDEN",
) {
  if (reviewPhoneMode === "HIDDEN") {
    if (phone) {
      throw new Error("Phone is not accepted for review submissions.");
    }

    return null;
  }

  if (reviewPhoneMode === "REQUIRED" && !phone) {
    throw new Error("Phone is required for review submissions.");
  }

  return phone ?? null;
}

async function createPublicReview(
  restaurantId: string,
  reviewPhoneMode: "OPTIONAL" | "REQUIRED" | "HIDDEN",
  defaultPublicNameMode: "FULL" | "FIRST_NAME" | "SHORTENED",
  input: SubmitPublicReviewInput,
) {
  const phone = validatePhoneAgainstSettings(input.phone, reviewPhoneMode);

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  const content = extractReviewContent(input);

  const review = await prisma.review.create({
    data: {
      restaurantId,
      customerName: input.customerName,
      email: input.email,
      phone,
      rating: input.rating,
      title: content.title,
      comment: content.comment,
      imageAssetId: input.imageAssetId ?? null,
      status: "PENDING",
      publicNameMode: defaultPublicNameMode,
    },
  });

  return {
    id: review.id,
    status: review.status,
    message: "Review submitted successfully and is pending approval.",
  };
}

export async function GET() {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();

    if (!restaurant.settings?.reviewsEnabled) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({
      data: await listPublicReviews(restaurant.id),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("restaurant")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to load public reviews.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();

    if (!restaurant.settings?.reviewsEnabled) {
      return jsonError("Review submissions are currently disabled.", 403);
    }

    const body = await request.json();
    const parsed = submitPublicReviewSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid review submission payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const result = await createPublicReview(
      restaurant.id,
      restaurant.settings.reviewPhoneMode,
      restaurant.settings.publicReviewNameMode,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Phone is") ||
        error.message.includes("Media asset")
      ) {
        return jsonError(error.message, 400);
      }

      if (error.message.includes("restaurant")) {
        return jsonError(error.message, 404);
      }
    }

    return jsonError("Unable to submit review.", 500);
  }
}
