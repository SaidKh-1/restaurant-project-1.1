import { assertMediaAssetBelongsToRestaurant } from "@/lib/api/menu-categories";
import {
  detectActiveThemePreset,
  getThemePreset,
  type ThemePresetKey,
} from "@/lib/api/theme-presets";
import { prisma } from "@/lib/db";

const themeInclude = {
  logoAsset: {
    include: { translations: true },
  },
  coverImageAsset: {
    include: { translations: true },
  },
  faviconAsset: {
    include: { translations: true },
  },
} as const;

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

function buildThemeColors(themeSettings: {
  primaryColor: string | null;
  secondaryColor: string | null;
  buttonColor: string | null;
  headerColor: string | null;
  footerColor: string | null;
}) {
  return {
    primaryColor: themeSettings.primaryColor,
    secondaryColor: themeSettings.secondaryColor,
    buttonColor: themeSettings.buttonColor,
    headerColor: themeSettings.headerColor,
    footerColor: themeSettings.footerColor,
    backgroundColor: themeSettings.secondaryColor,
    textColor: themeSettings.primaryColor,
  };
}

export async function getAdminThemeSettings(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      translations: true,
      themeSettings: {
        include: themeInclude,
      },
    },
  });

  if (!restaurant) {
    return null;
  }

  const translationAr =
    restaurant.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    restaurant.translations.find((translation) => translation.locale === "EN") ??
    null;

  const themeSettings = restaurant.themeSettings;
  const colors = themeSettings
    ? buildThemeColors(themeSettings)
    : {
        primaryColor: null,
        secondaryColor: null,
        buttonColor: null,
        headerColor: null,
        footerColor: null,
        backgroundColor: null,
        textColor: null,
      };

  return {
    id: themeSettings?.id ?? restaurant.id,
    isActive: themeSettings?.isActive ?? true,
    activePresetKey: detectActiveThemePreset(colors),
    colors,
    coverImage: serializeMediaAsset(themeSettings?.coverImageAsset),
    logo: serializeMediaAsset(themeSettings?.logoAsset),
    favicon: serializeMediaAsset(themeSettings?.faviconAsset),
    seasonalGreeting: {
      ar: translationAr?.shortDescription ?? null,
      en: translationEn?.shortDescription ?? null,
    },
    restaurantName: {
      ar: translationAr?.name ?? null,
      en: translationEn?.name ?? null,
    },
    updatedAt:
      themeSettings?.updatedAt.toISOString() ?? restaurant.updatedAt.toISOString(),
  };
}

export type UpdateAdminThemeInput = {
  isActive?: boolean;
  presetKey?: ThemePresetKey;
  colors?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    buttonColor?: string | null;
    headerColor?: string | null;
    footerColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
  };
  coverImageAssetId?: string | null;
  seasonalGreeting?: {
    ar?: string | null;
    en?: string | null;
  };
};

function resolveCustomThemeColors(
  existing: {
    primaryColor: string | null;
    secondaryColor: string | null;
    buttonColor: string | null;
    headerColor: string | null;
    footerColor: string | null;
  } | null,
  input?: UpdateAdminThemeInput["colors"],
) {
  if (!input) {
    return null;
  }

  return {
    primaryColor:
      input.primaryColor ??
      input.textColor ??
      existing?.primaryColor ??
      null,
    secondaryColor:
      input.backgroundColor ??
      input.secondaryColor ??
      existing?.secondaryColor ??
      null,
    buttonColor: input.buttonColor ?? existing?.buttonColor ?? null,
    headerColor: input.headerColor ?? existing?.headerColor ?? null,
    footerColor: input.footerColor ?? existing?.footerColor ?? null,
  };
}

export async function updateAdminThemeSettings(
  restaurantId: string,
  input: UpdateAdminThemeInput,
) {
  const preset = input.presetKey ? getThemePreset(input.presetKey) : null;
  const existingTheme = await prisma.themeSettings.findUnique({
    where: { restaurantId },
  });

  const resolvedColors = preset
    ? {
        primaryColor: preset.colors.primaryColor,
        secondaryColor: preset.colors.secondaryColor,
        buttonColor: preset.colors.buttonColor,
        headerColor: preset.colors.headerColor,
        footerColor: preset.colors.footerColor,
      }
    : resolveCustomThemeColors(existingTheme, input.colors);

  await assertMediaAssetBelongsToRestaurant(
    restaurantId,
    input.coverImageAssetId,
  );

  await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.findUnique({
      where: { id: restaurantId },
      include: { translations: true },
    });

    if (!restaurant) {
      throw new Error("Restaurant was not found.");
    }

    const translationAr =
      restaurant.translations.find((translation) => translation.locale === "AR") ??
      null;
    const translationEn =
      restaurant.translations.find((translation) => translation.locale === "EN") ??
      null;

    await tx.themeSettings.upsert({
      where: { restaurantId },
      create: {
        restaurantId,
        isActive: input.isActive ?? true,
        primaryColor: resolvedColors?.primaryColor ?? null,
        secondaryColor: resolvedColors?.secondaryColor ?? null,
        buttonColor: resolvedColors?.buttonColor ?? null,
        headerColor: resolvedColors?.headerColor ?? null,
        footerColor: resolvedColors?.footerColor ?? null,
        coverImageAssetId: input.coverImageAssetId ?? null,
      },
      update: {
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(resolvedColors
          ? {
              primaryColor: resolvedColors.primaryColor,
              secondaryColor: resolvedColors.secondaryColor,
              buttonColor: resolvedColors.buttonColor,
              headerColor: resolvedColors.headerColor,
              footerColor: resolvedColors.footerColor,
            }
          : {}),
        ...(input.coverImageAssetId !== undefined
          ? { coverImageAssetId: input.coverImageAssetId }
          : {}),
      },
    });

    const seasonalGreeting =
      preset?.seasonalGreeting ?? input.seasonalGreeting;

    if (seasonalGreeting?.ar !== undefined) {
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
          name: translationAr?.name ?? "Restaurant",
          shortDescription: seasonalGreeting.ar,
        },
        update: {
          shortDescription: seasonalGreeting.ar,
        },
      });
    }

    if (seasonalGreeting?.en !== undefined && translationEn) {
      await tx.restaurantTranslation.update({
        where: {
          restaurantId_locale: {
            restaurantId,
            locale: "EN",
          },
        },
        data: {
          shortDescription: seasonalGreeting.en,
        },
      });
    } else if (seasonalGreeting?.en !== undefined && seasonalGreeting.en) {
      await tx.restaurantTranslation.create({
        data: {
          restaurantId,
          locale: "EN",
          name: translationEn?.name ?? translationAr?.name ?? "Restaurant",
          shortDescription: seasonalGreeting.en,
        },
      });
    }
  });

  return getAdminThemeSettings(restaurantId);
}
