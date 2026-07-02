import {
  getHomepageSectionRecord,
  updateHomepageSection,
} from "@/lib/api/homepage-sections";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const cmsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const translationFieldsSchema = z
  .object({
    title: z.string().trim().max(200).nullable().optional(),
    subtitle: z.string().trim().max(400).nullable().optional(),
  })
  .strict();

const updateHomepageSectionSchema = z
  .object({
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: cmsStatusSchema.optional(),
    translations: z
      .object({
        ar: translationFieldsSchema.optional(),
        en: translationFieldsSchema.nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type RouteContext = {
  params: Promise<{ sectionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { sectionId } = await context.params;
    const section = await getHomepageSectionRecord(
      authorization.user.restaurantId,
      sectionId,
    );

    if (!section) {
      return jsonError("Homepage section was not found.", 404);
    }

    return NextResponse.json({
      data: section,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load homepage section.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "homepage.manage")) {
      return jsonError("homepage.manage permission required.", 403);
    }

    const { sectionId } = await context.params;
    const body = await request.json();
    const parsed = updateHomepageSectionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid homepage section payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const section = await updateHomepageSection(
      authorization.user.restaurantId,
      sectionId,
      parsed.data,
    );

    if (!section) {
      return jsonError("Homepage section was not found.", 404);
    }

    return NextResponse.json({
      data: section,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to update homepage section.", 500);
  }
}
