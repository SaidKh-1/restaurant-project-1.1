import {
  getOfferRecord,
  listOffers,
  mapOfferTranslationInput,
} from "@/lib/api/offers";
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

const offerTranslationFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(4000).nullable().optional(),
    discountText: z.string().trim().max(160).nullable().optional(),
    ctaUrl: linkSchema.nullable().optional(),
  })
  .strict();

const optionalOfferTranslationFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    discountText: z.string().trim().max(160).nullable().optional(),
    ctaUrl: linkSchema.nullable().optional(),
  })
  .strict();

const dateTimeSchema = z.string().datetime().nullable();

const createOfferSchema = z
  .object({
    imageAssetId: nullableIdSchema.optional(),
    startsAt: dateTimeSchema.optional(),
    endsAt: dateTimeSchema.optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    translations: z
      .object({
        ar: offerTranslationFieldsSchema,
        en: optionalOfferTranslationFieldsSchema.optional(),
      })
      .strict(),
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

type CreateOfferInput = z.infer<typeof createOfferSchema>;

async function createOffer(restaurantId: string, input: CreateOfferInput) {
  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  const offer = await prisma.$transaction(async (tx) => {
    return tx.offer.create({
      data: {
        restaurantId,
        imageAssetId: input.imageAssetId ?? null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        sortOrder: input.sortOrder ?? 0,
        status: input.status ?? "DRAFT",
        translations: {
          create: [
            {
              locale: "AR",
              ...mapOfferTranslationInput(input.translations.ar),
            },
            ...(input.translations.en?.title
              ? [
                  {
                    locale: "EN" as const,
                    ...mapOfferTranslationInput(input.translations.en),
                  },
                ]
              : []),
          ],
        },
      },
    });
  });

  const record = await getOfferRecord(restaurantId, offer.id);

  if (!record) {
    throw new Error("Created offer could not be loaded.");
  }

  return record;
}

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const isActiveParam = searchParams.get("isActive");
    const isFeaturedParam = searchParams.get("isFeatured");

    const statusResult = statusParam
      ? cmsStatusSchema.safeParse(statusParam)
      : null;

    if (statusResult && !statusResult.success) {
      return jsonError("Invalid status filter.", 400);
    }

    let isActive: boolean | undefined;
    let isFeatured: boolean | undefined;

    if (isActiveParam !== null) {
      if (isActiveParam !== "true" && isActiveParam !== "false") {
        return jsonError("isActive filter must be true or false.", 400);
      }

      isActive = isActiveParam === "true";
    }

    if (isFeaturedParam !== null) {
      if (isFeaturedParam !== "true" && isFeaturedParam !== "false") {
        return jsonError("isFeatured filter must be true or false.", 400);
      }

      isFeatured = isFeaturedParam === "true";
    }

    return NextResponse.json({
      data: await listOffers(authorization.user.restaurantId, {
        status: statusResult?.success ? statusResult.data : undefined,
        isActive,
        isFeatured,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load offers.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "offers.manage")) {
      return jsonError("offers.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createOfferSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid offer payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const offer = await createOffer(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: offer,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to create offer.", 500);
  }
}
