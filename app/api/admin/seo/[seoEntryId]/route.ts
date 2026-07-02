import {
  getSeoEntryRecord,
  upsertSeoTranslation,
} from "@/lib/api/seo-entries";
import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError, isRecordNotFoundError, isUniqueConstraintError } from "@/lib/api/http";
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

const updateSeoEntrySchema = z
  .object({
    pageKey: z.string().trim().min(1).max(160).optional(),
    entityType: seoEntityTypeSchema.optional(),
    routePath: pathSchema.optional(),
    canonicalUrl: pathSchema.nullable().optional(),
    noIndex: z.boolean().optional(),
    robotsFollow: z.boolean().optional(),
    isSitemapIncluded: z.boolean().optional(),
    ogImageAssetId: nullableIdSchema.optional(),
    translations: z
      .object({
        ar: z
          .object({
            seoTitle: z.string().trim().min(1).max(200).optional(),
            seoDescription: z.string().trim().max(500).nullable().optional(),
            keywords: z.string().trim().max(500).nullable().optional(),
            ogTitle: z.string().trim().max(200).nullable().optional(),
            ogDescription: z.string().trim().max(500).nullable().optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            seoTitle: z.string().trim().min(1).max(200).nullable().optional(),
            seoDescription: z.string().trim().max(500).nullable().optional(),
            keywords: z.string().trim().max(500).nullable().optional(),
            ogTitle: z.string().trim().max(200).nullable().optional(),
            ogDescription: z.string().trim().max(500).nullable().optional(),
          })
          .strict()
          .nullable()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type UpdateSeoEntryInput = z.infer<typeof updateSeoEntrySchema>;

type RouteContext = {
  params: Promise<{ seoEntryId: string }>;
};

async function updateSeoEntry(
  restaurantId: string,
  seoEntryId: string,
  input: UpdateSeoEntryInput,
) {
  const existingEntry = await prisma.seoEntry.findFirst({
    where: {
      id: seoEntryId,
      restaurantId,
    },
    include: {
      translations: true,
    },
  });

  if (!existingEntry) {
    return null;
  }

  await assertMediaAssetBelongsToRestaurant(restaurantId, input.ogImageAssetId);

  await prisma.seoEntry.update({
    where: { id: seoEntryId },
    data: {
      entityType: input.entityType,
      entityId: input.pageKey,
      routePath: input.routePath,
      canonicalPath: input.canonicalUrl,
      ogImageAssetId: input.ogImageAssetId,
      robotsIndex:
        input.noIndex !== undefined ? !input.noIndex : undefined,
      robotsFollow: input.robotsFollow,
      isSitemapIncluded: input.isSitemapIncluded,
    },
  });

  if (input.translations?.ar) {
    await upsertSeoTranslation(seoEntryId, "AR", input.translations.ar, {
      partial: true,
    });
  }

  if (input.translations?.en === null) {
    await prisma.seoEntryTranslation.deleteMany({
      where: {
        seoEntryId,
        locale: "EN",
      },
    });
  } else if (input.translations?.en) {
    const existingEn = existingEntry.translations.find(
      (translation) => translation.locale === "EN",
    );

    if (existingEn || input.translations.en.seoTitle) {
      await upsertSeoTranslation(seoEntryId, "EN", input.translations.en, {
        partial: Boolean(existingEn),
      });
    }
  }

  return getSeoEntryRecord(restaurantId, seoEntryId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { seoEntryId } = await context.params;
    const entry = await getSeoEntryRecord(
      authorization.user.restaurantId,
      seoEntryId,
    );

    if (!entry) {
      return jsonError("SEO entry was not found.", 404);
    }

    return NextResponse.json({
      data: entry,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load SEO entry.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "seo.manage")) {
      return jsonError("seo.manage permission required.", 403);
    }

    const { seoEntryId } = await context.params;
    const body = await request.json();
    const parsed = updateSeoEntrySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid SEO entry payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const entry = await updateSeoEntry(
      authorization.user.restaurantId,
      seoEntryId,
      parsed.data,
    );

    if (!entry) {
      return jsonError("SEO entry was not found.", 404);
    }

    return NextResponse.json({
      data: entry,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("SEO entry was not found.", 404);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError("An SEO entry for this route already exists.", 409);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update SEO entry.", 500);
  }
}
