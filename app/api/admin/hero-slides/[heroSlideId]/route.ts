import {
  getHeroSlideRecord,
  serializeHeroSlide,
  upsertHeroSlideTranslation,
} from "@/lib/api/hero-slides";
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

const updateHeroSlideSchema = z
  .object({
    imageAssetId: nullableIdSchema.optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
    translations: z
      .object({
        ar: z
          .object({
            title: z.string().trim().min(1).max(200).optional(),
            subtitle: z.string().trim().max(400).nullable().optional(),
            buttonText: z.string().trim().max(120).nullable().optional(),
            buttonLink: linkSchema.nullable().optional(),
            secondaryButtonText: z.string().trim().max(120).nullable().optional(),
            secondaryButtonLink: linkSchema.nullable().optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            title: z.string().trim().min(1).max(200).nullable().optional(),
            subtitle: z.string().trim().max(400).nullable().optional(),
            buttonText: z.string().trim().max(120).nullable().optional(),
            buttonLink: linkSchema.nullable().optional(),
            secondaryButtonText: z.string().trim().max(120).nullable().optional(),
            secondaryButtonLink: linkSchema.nullable().optional(),
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

type UpdateHeroSlideInput = z.infer<typeof updateHeroSlideSchema>;

type RouteContext = {
  params: Promise<{ heroSlideId: string }>;
};

async function updateHeroSlide(
  restaurantId: string,
  heroSlideId: string,
  input: UpdateHeroSlideInput,
) {
  const existingSlide = await getHeroSlideRecord(restaurantId, heroSlideId);

  if (!existingSlide) {
    return null;
  }

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  await prisma.heroSlide.update({
    where: { id: heroSlideId },
    data: {
      imageAssetId: input.imageAssetId,
      isVisible: input.isVisible,
      sortOrder: input.sortOrder,
      status: input.status,
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
    },
  });

  if (input.translations?.ar) {
    await upsertHeroSlideTranslation(
      heroSlideId,
      "AR",
      input.translations.ar,
      { partial: true },
    );
  }

  if (input.translations?.en === null) {
    await prisma.heroSlideTranslation.deleteMany({
      where: {
        heroSlideId,
        locale: "EN",
      },
    });
  } else if (input.translations?.en) {
    const existingEn = existingSlide.translations.find(
      (translation) => translation.locale === "EN",
    );

    if (existingEn || input.translations.en.title) {
      await upsertHeroSlideTranslation(
        heroSlideId,
        "EN",
        input.translations.en,
        { partial: Boolean(existingEn) },
      );
    }
  }

  return getHeroSlideRecord(restaurantId, heroSlideId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { heroSlideId } = await context.params;
    const slide = await getHeroSlideRecord(
      authorization.user.restaurantId,
      heroSlideId,
    );

    if (!slide) {
      return jsonError("Hero slide was not found.", 404);
    }

    return NextResponse.json({
      data: serializeHeroSlide(slide),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load hero slide.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "hero.manage")) {
      return jsonError("hero.manage permission required.", 403);
    }

    const { heroSlideId } = await context.params;
    const body = await request.json();
    const parsed = updateHeroSlideSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid hero slide payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const slide = await updateHeroSlide(
      authorization.user.restaurantId,
      heroSlideId,
      parsed.data,
    );

    if (!slide) {
      return jsonError("Hero slide was not found.", 404);
    }

    return NextResponse.json({
      data: serializeHeroSlide(slide),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Hero slide was not found.", 404);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update hero slide.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "hero.manage")) {
      return jsonError("hero.manage permission required.", 403);
    }

    const { heroSlideId } = await context.params;
    const existingSlide = await getHeroSlideRecord(
      authorization.user.restaurantId,
      heroSlideId,
    );

    if (!existingSlide) {
      return jsonError("Hero slide was not found.", 404);
    }

    await prisma.heroSlide.delete({
      where: { id: heroSlideId },
    });

    return NextResponse.json({
      data: {
        id: heroSlideId,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to delete hero slide.", 500);
  }
}
