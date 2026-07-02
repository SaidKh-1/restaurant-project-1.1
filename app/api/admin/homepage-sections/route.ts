import {
  listHomepageSections,
  reorderHomepageSections,
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

const reorderHomepageSectionsSchema = z
  .object({
    sections: z
      .array(
        z
          .object({
            id: z.string().trim().min(1),
            sortOrder: z.number().int().min(0),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();

    return NextResponse.json({
      data: await listHomepageSections(authorization.user.restaurantId),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load homepage sections.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "homepage.manage")) {
      return jsonError("homepage.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = reorderHomepageSectionsSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid homepage sections payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const sections = await reorderHomepageSections(
      authorization.user.restaurantId,
      parsed.data.sections,
    );

    return NextResponse.json({
      data: sections,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to reorder homepage sections.", 500);
  }
}
