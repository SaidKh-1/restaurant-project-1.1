import {
  getCookingMethodRecord,
  serializeCookingMethod,
} from "@/lib/api/cooking-methods";
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

const updateCookingMethodSchema = z
  .object({
    isEnabled: z.boolean().optional(),
    isPubliclyVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    translations: z
      .object({
        ar: z
          .object({
            name: z.string().trim().min(1).max(160).optional(),
            description: z.string().trim().max(4000).nullable().optional(),
          })
          .strict()
          .optional(),
        en: z
          .object({
            name: z.string().trim().min(1).max(160).nullable().optional(),
            description: z.string().trim().max(4000).nullable().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

type UpdateCookingMethodInput = z.infer<typeof updateCookingMethodSchema>;

type RouteContext = {
  params: Promise<{ cookingMethodId: string }>;
};

async function updateCookingMethod(
  restaurantId: string,
  cookingMethodId: string,
  input: UpdateCookingMethodInput,
) {
  const existingMethod = await getCookingMethodRecord(
    restaurantId,
    cookingMethodId,
  );

  if (!existingMethod) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.cookingMethod.update({
      where: { id: cookingMethodId },
      data: {
        isEnabled: input.isEnabled,
        isPubliclyVisible: input.isPubliclyVisible,
        sortOrder: input.sortOrder,
      },
    });

    if (input.translations?.ar) {
      const arTranslation = input.translations.ar;

      await tx.cookingMethodTranslation.upsert({
        where: {
          cookingMethodId_locale: {
            cookingMethodId,
            locale: "AR",
          },
        },
        create: {
          cookingMethodId,
          locale: "AR",
          name: arTranslation.name ?? "",
          description: arTranslation.description ?? null,
        },
        update: {
          name: arTranslation.name,
          description: arTranslation.description,
        },
      });
    }

    if (input.translations?.en) {
      const enTranslation = input.translations.en;

      if (enTranslation.name === null) {
        await tx.cookingMethodTranslation.deleteMany({
          where: {
            cookingMethodId,
            locale: "EN",
          },
        });
      } else {
        await tx.cookingMethodTranslation.upsert({
          where: {
            cookingMethodId_locale: {
              cookingMethodId,
              locale: "EN",
            },
          },
          create: {
            cookingMethodId,
            locale: "EN",
            name: enTranslation.name ?? "",
            description: enTranslation.description ?? null,
          },
          update: {
            name: enTranslation.name,
            description: enTranslation.description,
          },
        });
      }
    }
  });

  return getCookingMethodRecord(restaurantId, cookingMethodId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { cookingMethodId } = await context.params;
    const method = await getCookingMethodRecord(
      authorization.user.restaurantId,
      cookingMethodId,
    );

    if (!method) {
      return jsonError("Cooking method was not found.", 404);
    }

    return NextResponse.json({
      data: serializeCookingMethod(method),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load cooking method.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "cooking_methods.manage")) {
      return jsonError("cooking_methods.manage permission required.", 403);
    }

    const { cookingMethodId } = await context.params;
    const body = await request.json();
    const parsed = updateCookingMethodSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid cooking method payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const method = await updateCookingMethod(
      authorization.user.restaurantId,
      cookingMethodId,
      parsed.data,
    );

    if (!method) {
      return jsonError("Cooking method was not found.", 404);
    }

    return NextResponse.json({
      data: serializeCookingMethod(method),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Cooking method was not found.", 404);
    }

    return jsonError("Unable to update cooking method.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "cooking_methods.manage")) {
      return jsonError("cooking_methods.manage permission required.", 403);
    }

    const { cookingMethodId } = await context.params;
    const existingMethod = await getCookingMethodRecord(
      authorization.user.restaurantId,
      cookingMethodId,
    );

    if (!existingMethod) {
      return jsonError("Cooking method was not found.", 404);
    }

    await prisma.cookingMethod.delete({
      where: { id: cookingMethodId },
    });

    return NextResponse.json({
      data: {
        id: cookingMethodId,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to delete cooking method.", 500);
  }
}
