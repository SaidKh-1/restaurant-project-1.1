import {
  getAdminThemeSettings,
  updateAdminThemeSettings,
} from "@/lib/api/admin-theme";
import { revalidatePublicSiteShellCache } from "@/lib/api/public-cache";
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

const colorSchema = z.string().trim().max(40).nullable();

const themePresetKeySchema = z.enum([
  "ocean-blue",
  "navy-dark",
  "emerald",
  "sunset",
  "luxury-dark",
  "golden",
  "ramadan",
  "eid-al-fitr",
  "eid-al-adha",
]);

const updateThemeSchema = z
  .object({
    isActive: z.boolean().optional(),
    presetKey: themePresetKeySchema.optional(),
    colors: z
      .object({
        primaryColor: colorSchema.optional(),
        secondaryColor: colorSchema.optional(),
        buttonColor: colorSchema.optional(),
        headerColor: colorSchema.optional(),
        footerColor: colorSchema.optional(),
        backgroundColor: colorSchema.optional(),
        textColor: colorSchema.optional(),
      })
      .strict()
      .optional(),
    coverImageAssetId: z.string().trim().min(1).nullable().optional(),
    seasonalGreeting: z
      .object({
        ar: z.string().trim().max(200).nullable().optional(),
        en: z.string().trim().max(200).nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();
    const theme = await getAdminThemeSettings(authorization.user.restaurantId);

    if (!theme) {
      return jsonError("Theme settings were not found.", 404);
    }

    return NextResponse.json({
      data: theme,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load theme settings.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "theme.manage")) {
      return jsonError("theme.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = updateThemeSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid theme settings payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const theme = await updateAdminThemeSettings(
      authorization.user.restaurantId,
      parsed.data,
    );

    if (!theme) {
      return jsonError("Theme settings were not found.", 404);
    }

    revalidatePublicSiteShellCache();

    return NextResponse.json({
      data: theme,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message.includes("Media asset")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update theme settings.", 500);
  }
}
