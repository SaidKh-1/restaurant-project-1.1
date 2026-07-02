import { isManagerScopeSettingsPayload } from "@/lib/admin/manager-profile";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { revalidatePublicSiteShellCache } from "@/lib/api/public-cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const dayOfWeekSchema = z.enum([
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
]);

const nullableIdSchema = z.string().min(1).nullable();

const updateRestaurantSettingsSchema = z
  .object({
    restaurantName: z
      .object({
        ar: z.string().trim().min(1).max(160).optional(),
        en: z.string().trim().min(1).max(160).nullable().optional(),
      })
      .strict()
      .optional(),
    logoAssetId: nullableIdSchema.optional(),
    coverImageAssetId: nullableIdSchema.optional(),
    managerProfile: z
      .object({
        imageAssetId: nullableIdSchema.optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().int().min(0).optional(),
        translations: z
          .object({
            ar: z
              .object({
                name: z.string().trim().min(1).max(160).optional(),
                title: z.string().trim().max(160).nullable().optional(),
                bio: z.string().trim().max(4000).nullable().optional(),
              })
              .strict()
              .optional(),
            en: z
              .object({
                name: z.string().trim().min(1).max(160).optional(),
                title: z.string().trim().max(160).nullable().optional(),
                bio: z.string().trim().max(4000).nullable().optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    contactInformation: z
      .object({
        phone: z.string().trim().max(80).nullable().optional(),
        whatsappNumber: z.string().trim().max(80).nullable().optional(),
        email: z.string().trim().email().max(254).nullable().optional(),
        reservationPhone: z.string().trim().max(80).nullable().optional(),
        publicContactEnabled: z.boolean().optional(),
        whatsappEnabled: z.boolean().optional(),
      })
      .strict()
      .optional(),
    openingHours: z
      .array(
        z
          .object({
            dayOfWeek: dayOfWeekSchema,
            opensAt: z.string().trim().max(20).nullable().optional(),
            closesAt: z.string().trim().max(20).nullable().optional(),
            isClosed: z.boolean().optional(),
            notes: z.string().trim().max(500).nullable().optional(),
          })
          .strict(),
      )
      .max(14)
      .optional(),
    socialMediaLinks: z
      .array(
        z
          .object({
            platform: z.string().trim().min(1).max(80),
            url: z.string().trim().url().max(2048),
            label: z.string().trim().max(120).nullable().optional(),
            isActive: z.boolean().optional(),
            sortOrder: z.number().int().min(0).optional(),
          })
          .strict(),
      )
      .max(20)
      .optional(),
    googleMapsLocation: z
      .object({
        label: z.string().trim().max(160).nullable().optional(),
        googleMapsUrl: z.string().trim().url().max(2048).nullable().optional(),
        latitude: z.number().min(-90).max(90).nullable().optional(),
        longitude: z.number().min(-180).max(180).nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .strict()
      .nullable()
      .optional(),
    themeColors: z
      .object({
        primaryColor: z.string().trim().max(40).nullable().optional(),
        secondaryColor: z.string().trim().max(40).nullable().optional(),
        buttonColor: z.string().trim().max(40).nullable().optional(),
        headerColor: z.string().trim().max(40).nullable().optional(),
        footerColor: z.string().trim().max(40).nullable().optional(),
      })
      .strict()
      .optional(),
    defaultLanguage: z.literal("ar").optional(),
    secondaryLanguage: z.literal("en").optional(),
    isEnglishEnabled: z.boolean().optional(),
  })
  .strict();

type UpdateRestaurantSettingsInput = z.infer<
  typeof updateRestaurantSettingsSchema
>;

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

function isRecordNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

function serializeMediaAsset(
  asset:
    | {
        id: string;
        publicUrl: string;
        mimeType: string;
        width: number | null;
        height: number | null;
        translations: {
          locale: "AR" | "EN";
          altText: string | null;
          caption: string | null;
        }[];
      }
    | null
    | undefined,
) {
  if (!asset) {
    return null;
  }

  return {
    id: asset.id,
    publicUrl: asset.publicUrl,
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    altText: {
      ar:
        asset.translations.find((translation) => translation.locale === "AR")
          ?.altText ?? null,
      en:
        asset.translations.find((translation) => translation.locale === "EN")
          ?.altText ?? null,
    },
    caption: {
      ar:
        asset.translations.find((translation) => translation.locale === "AR")
          ?.caption ?? null,
      en:
        asset.translations.find((translation) => translation.locale === "EN")
          ?.caption ?? null,
    },
  };
}

function serializeRestaurantSettings(
  restaurant: NonNullable<
    Awaited<ReturnType<typeof getRestaurantSettingsRecord>>
  >,
) {
  const nameAr =
    restaurant.translations.find((translation) => translation.locale === "AR")
      ?.name ?? null;
  const nameEn =
    restaurant.translations.find((translation) => translation.locale === "EN")
      ?.name ?? null;
  const managerTranslationAr =
    restaurant.managerProfile?.translations.find(
      (translation) => translation.locale === "AR",
    ) ?? null;
  const managerTranslationEn =
    restaurant.managerProfile?.translations.find(
      (translation) => translation.locale === "EN",
    ) ?? null;

  return {
    id: restaurant.id,
    slug: restaurant.slug,
    restaurantName: {
      ar: nameAr,
      en: nameEn,
    },
    defaultLanguage: "ar",
    secondaryLanguage: "en",
    isEnglishEnabled: restaurant.isEnglishEnabled,
    defaultLocale: "ar",
    settings: restaurant.settings
      ? {
          defaultPublicRoute: restaurant.settings.defaultPublicRoute,
          englishPublicRoute: restaurant.settings.englishPublicRoute,
          reviewsRequireApproval: restaurant.settings.reviewsRequireApproval,
          reservationsEnabled: restaurant.settings.reservationsEnabled,
          messagesEnabled: restaurant.settings.messagesEnabled,
          reviewsEnabled: restaurant.settings.reviewsEnabled,
        }
      : null,
    logo: serializeMediaAsset(restaurant.themeSettings?.logoAsset),
    coverImage: serializeMediaAsset(restaurant.themeSettings?.coverImageAsset),
    managerProfile: restaurant.managerProfile
      ? {
          id: restaurant.managerProfile.id,
          isVisible: restaurant.managerProfile.isVisible,
          sortOrder: restaurant.managerProfile.sortOrder,
          image: serializeMediaAsset(restaurant.managerProfile.imageAsset),
          translations: {
            ar: managerTranslationAr
              ? {
                  name: managerTranslationAr.name,
                  title: managerTranslationAr.title,
                  bio: managerTranslationAr.bio,
                }
              : null,
            en: managerTranslationEn
              ? {
                  name: managerTranslationEn.name,
                  title: managerTranslationEn.title,
                  bio: managerTranslationEn.bio,
                }
              : null,
          },
        }
      : null,
    contactInformation: restaurant.contactSettings
      ? {
          phone: restaurant.contactSettings.phone,
          whatsappNumber: restaurant.contactSettings.whatsappNumber,
          email: restaurant.contactSettings.email,
          reservationPhone: restaurant.contactSettings.reservationPhone,
          publicContactEnabled:
            restaurant.contactSettings.publicContactEnabled,
          whatsappEnabled: restaurant.contactSettings.whatsappEnabled,
        }
      : null,
    whatsapp: {
      number: restaurant.contactSettings?.whatsappNumber ?? null,
      enabled: restaurant.contactSettings?.whatsappEnabled ?? false,
    },
    openingHours: restaurant.openingHours.map((openingHour) => ({
      id: openingHour.id,
      dayOfWeek: openingHour.dayOfWeek,
      opensAt: openingHour.opensAt,
      closesAt: openingHour.closesAt,
      isClosed: openingHour.isClosed,
      notes: openingHour.notes,
    })),
    socialMediaLinks: restaurant.socialLinks.map((socialLink) => ({
      id: socialLink.id,
      platform: socialLink.platform,
      url: socialLink.url,
      label: socialLink.label,
      isActive: socialLink.isActive,
      sortOrder: socialLink.sortOrder,
    })),
    googleMapsLocation: restaurant.locations[0]
      ? {
          id: restaurant.locations[0].id,
          label: restaurant.locations[0].label,
          googleMapsUrl: restaurant.locations[0].googleMapsUrl,
          latitude:
            restaurant.locations[0].latitude === null
              ? null
              : Number(restaurant.locations[0].latitude),
          longitude:
            restaurant.locations[0].longitude === null
              ? null
              : Number(restaurant.locations[0].longitude),
          isPrimary: restaurant.locations[0].isPrimary,
          isActive: restaurant.locations[0].isActive,
        }
      : null,
    themeColors: restaurant.themeSettings
      ? {
          primaryColor: restaurant.themeSettings.primaryColor,
          secondaryColor: restaurant.themeSettings.secondaryColor,
          buttonColor: restaurant.themeSettings.buttonColor,
          headerColor: restaurant.themeSettings.headerColor,
          footerColor: restaurant.themeSettings.footerColor,
        }
      : null,
    updatedAt: restaurant.updatedAt,
  };
}

async function getRestaurantSettingsRecord(restaurantId: string) {
  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      translations: true,
      settings: true,
      contactSettings: true,
      openingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      socialLinks: {
        orderBy: [{ sortOrder: "asc" }, { platform: "asc" }],
      },
      locations: {
        where: { isPrimary: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      managerProfile: {
        include: {
          translations: true,
          imageAsset: {
            include: { translations: true },
          },
        },
      },
      themeSettings: {
        include: {
          logoAsset: {
            include: { translations: true },
          },
          coverImageAsset: {
            include: { translations: true },
          },
        },
      },
    },
  });
}

async function assertMediaAssetsBelongToRestaurant(
  restaurantId: string,
  assetIds: string[],
) {
  const uniqueAssetIds = Array.from(new Set(assetIds));

  if (uniqueAssetIds.length === 0) {
    return;
  }

  const assets = await prisma.mediaAsset.findMany({
    where: {
      id: { in: uniqueAssetIds },
      restaurantId,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (assets.length !== uniqueAssetIds.length) {
    throw new Error("One or more media assets were not found.");
  }
}

function getReferencedMediaAssetIds(input: UpdateRestaurantSettingsInput) {
  return [
    input.logoAssetId,
    input.coverImageAssetId,
    input.managerProfile?.imageAssetId,
  ].filter((assetId): assetId is string => typeof assetId === "string");
}

async function updateRestaurantSettings(
  restaurantId: string,
  input: UpdateRestaurantSettingsInput,
) {
  await assertMediaAssetsBelongToRestaurant(
    restaurantId,
    getReferencedMediaAssetIds(input),
  );

  await prisma.$transaction(async (tx) => {
    const languageData: {
      defaultLocale: "AR";
      isEnglishEnabled?: boolean;
    } = {
      defaultLocale: "AR",
    };

    if (input.isEnglishEnabled !== undefined) {
      languageData.isEnglishEnabled = input.isEnglishEnabled;
    } else if (input.secondaryLanguage === "en") {
      languageData.isEnglishEnabled = true;
    }

    await tx.restaurant.update({
      where: { id: restaurantId },
      data: languageData,
    });

    if (input.restaurantName?.ar !== undefined) {
      await tx.restaurantTranslation.upsert({
        where: {
          restaurantId_locale: {
            restaurantId,
            locale: "AR",
          },
        },
        create: {
          restaurantId,
          locale: "AR",
          name: input.restaurantName.ar,
        },
        update: {
          name: input.restaurantName.ar,
        },
      });
    }

    if (input.restaurantName?.en !== undefined) {
      await tx.restaurantTranslation.upsert({
        where: {
          restaurantId_locale: {
            restaurantId,
            locale: "EN",
          },
        },
        create: {
          restaurantId,
          locale: "EN",
          name: input.restaurantName.en ?? "",
        },
        update: {
          name: input.restaurantName.en ?? "",
        },
      });
    }

    await tx.restaurantSettings.upsert({
      where: { restaurantId },
      create: {
        restaurantId,
        defaultPublicRoute: "/ar",
        englishPublicRoute: "/en",
      },
      update: {
        defaultPublicRoute: "/ar",
        englishPublicRoute: "/en",
      },
    });

    if (input.contactInformation) {
      await tx.restaurantContactSettings.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          phone: input.contactInformation.phone,
          whatsappNumber: input.contactInformation.whatsappNumber,
          email: input.contactInformation.email,
          reservationPhone: input.contactInformation.reservationPhone,
          publicContactEnabled:
            input.contactInformation.publicContactEnabled ?? true,
          whatsappEnabled: input.contactInformation.whatsappEnabled ?? true,
        },
        update: {
          phone: input.contactInformation.phone,
          whatsappNumber: input.contactInformation.whatsappNumber,
          email: input.contactInformation.email,
          reservationPhone: input.contactInformation.reservationPhone,
          publicContactEnabled:
            input.contactInformation.publicContactEnabled,
          whatsappEnabled: input.contactInformation.whatsappEnabled,
        },
      });
    }

    if (
      input.logoAssetId !== undefined ||
      input.coverImageAssetId !== undefined ||
      input.themeColors
    ) {
      await tx.themeSettings.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          logoAssetId: input.logoAssetId,
          coverImageAssetId: input.coverImageAssetId,
          primaryColor: input.themeColors?.primaryColor,
          secondaryColor: input.themeColors?.secondaryColor,
          buttonColor: input.themeColors?.buttonColor,
          headerColor: input.themeColors?.headerColor,
          footerColor: input.themeColors?.footerColor,
          isActive: true,
        },
        update: {
          logoAssetId: input.logoAssetId,
          coverImageAssetId: input.coverImageAssetId,
          primaryColor: input.themeColors?.primaryColor,
          secondaryColor: input.themeColors?.secondaryColor,
          buttonColor: input.themeColors?.buttonColor,
          headerColor: input.themeColors?.headerColor,
          footerColor: input.themeColors?.footerColor,
        },
      });
    }

    if (input.managerProfile) {
      const managerProfile = await tx.managerProfile.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          imageAssetId: input.managerProfile.imageAssetId,
          isVisible: input.managerProfile.isVisible ?? true,
          sortOrder: input.managerProfile.sortOrder ?? 0,
        },
        update: {
          imageAssetId: input.managerProfile.imageAssetId,
          isVisible: input.managerProfile.isVisible,
          sortOrder: input.managerProfile.sortOrder,
        },
      });

      if (input.managerProfile.translations?.ar) {
        await tx.managerProfileTranslation.upsert({
          where: {
            managerProfileId_locale: {
              managerProfileId: managerProfile.id,
              locale: "AR",
            },
          },
          create: {
            managerProfileId: managerProfile.id,
            locale: "AR",
            name: input.managerProfile.translations.ar.name ?? "",
            title: input.managerProfile.translations.ar.title,
            bio: input.managerProfile.translations.ar.bio,
          },
          update: {
            name: input.managerProfile.translations.ar.name,
            title: input.managerProfile.translations.ar.title,
            bio: input.managerProfile.translations.ar.bio,
          },
        });
      }

      if (input.managerProfile.translations?.en) {
        await tx.managerProfileTranslation.upsert({
          where: {
            managerProfileId_locale: {
              managerProfileId: managerProfile.id,
              locale: "EN",
            },
          },
          create: {
            managerProfileId: managerProfile.id,
            locale: "EN",
            name: input.managerProfile.translations.en.name ?? "",
            title: input.managerProfile.translations.en.title,
            bio: input.managerProfile.translations.en.bio,
          },
          update: {
            name: input.managerProfile.translations.en.name,
            title: input.managerProfile.translations.en.title,
            bio: input.managerProfile.translations.en.bio,
          },
        });
      }
    }

    if (input.openingHours) {
      await tx.restaurantOpeningHour.deleteMany({
        where: { restaurantId },
      });

      if (input.openingHours.length > 0) {
        await tx.restaurantOpeningHour.createMany({
          data: input.openingHours.map((openingHour, index) => ({
            restaurantId,
            dayOfWeek: openingHour.dayOfWeek,
            opensAt: openingHour.opensAt,
            closesAt: openingHour.closesAt,
            isClosed: openingHour.isClosed ?? false,
            notes: openingHour.notes,
            id: `${restaurantId}_opening_hour_${index}_${openingHour.dayOfWeek.toLowerCase()}`,
          })),
        });
      }
    }

    if (input.socialMediaLinks) {
      await tx.restaurantSocialLink.deleteMany({
        where: { restaurantId },
      });

      if (input.socialMediaLinks.length > 0) {
        await tx.restaurantSocialLink.createMany({
          data: input.socialMediaLinks.map((socialLink, index) => ({
            restaurantId,
            platform: socialLink.platform,
            url: socialLink.url,
            label: socialLink.label,
            isActive: socialLink.isActive ?? true,
            sortOrder: socialLink.sortOrder ?? index,
          })),
        });
      }
    }

    if (input.googleMapsLocation !== undefined) {
      await tx.restaurantLocation.deleteMany({
        where: {
          restaurantId,
          isPrimary: true,
        },
      });

      if (input.googleMapsLocation !== null) {
        await tx.restaurantLocation.create({
          data: {
            restaurantId,
            label: input.googleMapsLocation.label,
            googleMapsUrl: input.googleMapsLocation.googleMapsUrl,
            latitude: input.googleMapsLocation.latitude,
            longitude: input.googleMapsLocation.longitude,
            isPrimary: true,
            isActive: input.googleMapsLocation.isActive ?? true,
          },
        });
      }
    }
  });
}

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();
    const restaurant = await getRestaurantSettingsRecord(
      authorization.user.restaurantId,
    );

    if (!restaurant) {
      return jsonError("Restaurant settings were not found.", 404);
    }

    return NextResponse.json({
      data: serializeRestaurantSettings(restaurant),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load restaurant settings.", 500);
  }
}

async function handleUpdate(request: Request) {
  try {
    const authorization = await requireAdminOrSuperAdmin();
    const body = await request.json();
    const parsed = updateRestaurantSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid restaurant settings payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const canManageSettings = hasPermission(authorization, "settings.manage");
    const canManageManagerProfile = hasPermission(
      authorization,
      "manager_profile.manage",
    );

    if (!canManageSettings) {
      if (
        !canManageManagerProfile ||
        !isManagerScopeSettingsPayload(parsed.data)
      ) {
        return jsonError(
          "settings.manage or manager_profile.manage permission required.",
          403,
        );
      }
    }

    await updateRestaurantSettings(authorization.user.restaurantId, parsed.data);

    if (parsed.data.managerProfile) {
      revalidatePublicSiteShellCache();
    }

    const restaurant = await getRestaurantSettingsRecord(
      authorization.user.restaurantId,
    );

    if (!restaurant) {
      return jsonError("Restaurant settings were not found.", 404);
    }

    return NextResponse.json({
      data: serializeRestaurantSettings(restaurant),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Restaurant settings were not found.", 404);
    }

    if (error instanceof Error && error.message.includes("media assets")) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update restaurant settings.", 500);
  }
}

export async function PATCH(request: Request) {
  return handleUpdate(request);
}

export async function PUT(request: Request) {
  return handleUpdate(request);
}
