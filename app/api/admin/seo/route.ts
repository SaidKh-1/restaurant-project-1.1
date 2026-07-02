import {
  deriveRoutePath,
  getSeoEntryRecord,
  listSeoEntries,
  mapSeoTranslationInput,
} from "@/lib/api/seo-entries";
import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError, isUniqueConstraintError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const seoEntityTypeSchema = z.enum([
  "PAGE",
  "MENU_CATEGORY",
  "MENU_ITEM",
  "OFFER",
  "GALLERY",
  "REVIEW_PAGE",
  "ABOUT",
  "MANAGER",
  "CONTACT",
]);

const nullableIdSchema = z.string().min(1).nullable();

const pathSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) => value.startsWith("/"),
    "Path must start with /.",
  );

const seoTranslationFieldsSchema = z
  .object({
    seoTitle: z.string().trim().min(1).max(200),
    seoDescription: z.string().trim().max(500).nullable().optional(),
    keywords: z.string().trim().max(500).nullable().optional(),
    ogTitle: z.string().trim().max(200).nullable().optional(),
    ogDescription: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

const optionalSeoTranslationFieldsSchema = z
  .object({
    seoTitle: z.string().trim().min(1).max(200).optional(),
    seoDescription: z.string().trim().max(500).nullable().optional(),
    keywords: z.string().trim().max(500).nullable().optional(),
    ogTitle: z.string().trim().max(200).nullable().optional(),
    ogDescription: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

const createSeoEntrySchema = z
  .object({
    pageKey: z.string().trim().min(1).max(160),
    entityType: seoEntityTypeSchema.optional(),
    routePath: pathSchema.optional(),
    canonicalUrl: pathSchema.nullable().optional(),
    noIndex: z.boolean().optional(),
    robotsFollow: z.boolean().optional(),
    isSitemapIncluded: z.boolean().optional(),
    ogImageAssetId: nullableIdSchema.optional(),
    translations: z
      .object({
        ar: seoTranslationFieldsSchema,
        en: optionalSeoTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

type CreateSeoEntryInput = z.infer<typeof createSeoEntrySchema>;

async function createSeoEntry(
  restaurantId: string,
  input: CreateSeoEntryInput,
) {
  await assertMediaAssetBelongsToRestaurant(restaurantId, input.ogImageAssetId);

  const routePath = input.routePath ?? deriveRoutePath(input.pageKey);

  const entry = await prisma.$transaction(async (tx) => {
    return tx.seoEntry.create({
      data: {
        restaurantId,
        entityType: input.entityType ?? "PAGE",
        entityId: input.pageKey,
        routePath,
        canonicalPath: input.canonicalUrl ?? null,
        ogImageAssetId: input.ogImageAssetId ?? null,
        robotsIndex: input.noIndex !== undefined ? !input.noIndex : true,
        robotsFollow: input.robotsFollow ?? true,
        isSitemapIncluded: input.isSitemapIncluded ?? true,
        translations: {
          create: [
            {
              locale: "AR",
              ...mapSeoTranslationInput(input.translations.ar),
            },
            ...(input.translations.en?.seoTitle
              ? [
                  {
                    locale: "EN" as const,
                    ...mapSeoTranslationInput(input.translations.en),
                  },
                ]
              : []),
          ],
        },
      },
    });
  });

  const record = await getSeoEntryRecord(restaurantId, entry.id);

  if (!record) {
    throw new Error("Created SEO entry could not be loaded.");
  }

  return record;
}

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey") ?? undefined;
    const entityTypeParam = searchParams.get("entityType");

    const entityTypeResult = entityTypeParam
      ? seoEntityTypeSchema.safeParse(entityTypeParam)
      : null;

    if (entityTypeResult && !entityTypeResult.success) {
      return jsonError("Invalid entityType filter.", 400);
    }

    if (pageKey !== undefined && pageKey.trim().length === 0) {
      return jsonError("pageKey must not be empty.", 400);
    }

    return NextResponse.json({
      data: await listSeoEntries(authorization.user.restaurantId, {
        pageKey,
        entityType: entityTypeResult?.success ? entityTypeResult.data : undefined,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load SEO entries.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "seo.manage")) {
      return jsonError("seo.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createSeoEntrySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid SEO entry payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const entry = await createSeoEntry(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: entry,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("An SEO entry for this route already exists.", 409);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to create SEO entry.", 500);
  }
}
