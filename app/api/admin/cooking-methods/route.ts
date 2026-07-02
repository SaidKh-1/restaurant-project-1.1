import {
  getCookingMethodRecord,
  listCookingMethods,
  serializeCookingMethod,
} from "@/lib/api/cooking-methods";
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

const cookingMethodTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).nullable().optional(),
  })
  .strict();

const optionalCookingMethodTranslationFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
  })
  .strict();

const createCookingMethodSchema = z
  .object({
    isEnabled: z.boolean().optional(),
    isPubliclyVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    translations: z
      .object({
        ar: cookingMethodTranslationFieldsSchema,
        en: optionalCookingMethodTranslationFieldsSchema.optional(),
      })
      .strict(),
  })
  .strict();

type CreateCookingMethodInput = z.infer<typeof createCookingMethodSchema>;

async function createCookingMethod(
  restaurantId: string,
  input: CreateCookingMethodInput,
) {
  const method = await prisma.$transaction(async (tx) => {
    const createdMethod = await tx.cookingMethod.create({
      data: {
        restaurantId,
        isEnabled: input.isEnabled ?? true,
        isPubliclyVisible: input.isPubliclyVisible ?? true,
        sortOrder: input.sortOrder ?? 0,
        translations: {
          create: [
            {
              locale: "AR",
              name: input.translations.ar.name,
              description: input.translations.ar.description ?? null,
            },
            ...(input.translations.en?.name
              ? [
                  {
                    locale: "EN" as const,
                    name: input.translations.en.name,
                    description: input.translations.en.description ?? null,
                  },
                ]
              : []),
          ],
        },
      },
    });

    return createdMethod;
  });

  const record = await getCookingMethodRecord(restaurantId, method.id);

  if (!record) {
    throw new Error("Created cooking method could not be loaded.");
  }

  return record;
}

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();

    return NextResponse.json({
      data: await listCookingMethods(authorization.user.restaurantId),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load cooking methods.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "cooking_methods.manage")) {
      return jsonError("cooking_methods.manage permission required.", 403);
    }

    const body = await request.json();
    const parsed = createCookingMethodSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid cooking method payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const method = await createCookingMethod(
      authorization.user.restaurantId,
      parsed.data,
    );

    return NextResponse.json(
      {
        data: serializeCookingMethod(method),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to create cooking method.", 500);
  }
}
