import {
  getHeroSlideRecord,
  listHeroSlides,
  mapTranslationInputToData,
  serializeHeroSlide,
} from "@/lib/api/hero-slides";
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

const heroSlideTranslationFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    subtitle: z.string().trim().max(400).nullable().optional(),
    buttonText: z.string().trim().max(120).nullable().optional(),
    buttonLink: linkSchema.nullable().optional(),
    secondaryButtonText: z.string().trim().max(120).nullable().optional(),
    secondaryButtonLink: linkSchema.nullable().optional(),
  })
  .strict();

const optionalHeroSlideTranslationFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    subtitle: z.string().trim().max(400).nullable().optional(),
    buttonText: z.string().trim().max(120).nullable().optional(),
    buttonLink: linkSchema.nullable().optional(),
    secondaryButtonText: z.string().trim().max(120).nullable().optional(),
    secondaryButtonLink: linkSchema.nullable().optional(),
  })
  .strict();

const dateTimeSchema = z.string().datetime().nullable();

const createHeroSlideSchema = z
  .object({
    imageAssetId: z.string().trim().min(1),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    startsAt: dateTimeSchema.optional(),
    endsAt: dateTimeSchema.optional(),
    translations: z
      .object({
        ar: heroSlideTranslationFieldsSchema,
        en: optionalHeroSlideTranslationFieldsSchema.optional(),
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

type CreateHeroSlideInput = z.infer<typeof createHeroSlideSchema>;

async function createHeroSlide(
  restaurantId: string,
  input: CreateHeroSlideInput,
) {
  await assertMediaAssetBelongsToRestaurant(restaurantId, input.imageAssetId);

  const slide = await prisma.$transaction(async (tx) => {
    const createdSlide = await tx.heroSlide.create({
      data: {
        restaurantId,
        imageAssetId: input.imageAssetId,
        isVisible: input.isVisible ?? true,
        sortOrder: input.sortOrder ?? 0,
        status: input.status ?? "DRAFT",
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        translations: {
          create: [
            {
              locale: "AR",
              ...mapTranslationInputToData(input.translations.ar),
            },
            ...(input.translations.en?.title
              ? [
                  {
                    locale: "EN" as const,
                    ...mapTranslationInputToData(input.translations.en),
                  },
                ]
              : []),
          ],
        },
      },
    });

    return createdSlide;
  });

  const record = await getHeroSlideRecord(restaurantId, slide.id);

  if (!record) {
    throw new Error("Created hero slide could not be loaded.");
  }

  return record;
}

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();

    return NextResponse.json({
      data: await listHeroSlides(authorization.user.restaurantId),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load hero slides.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "hero.manage")) {
      return jsonError("hero.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createHeroSlideSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid hero slide payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const slide = await createHeroSlide(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: serializeHeroSlide(slide),
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

    return jsonError("Unable to create hero slide.", 500);
  }
}
