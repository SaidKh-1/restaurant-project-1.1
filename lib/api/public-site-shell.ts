import { cache } from "react";
import { unstable_cache } from "next/cache";

import { buildCallLink, buildWhatsAppLink } from "@/lib/admin/hero-slides";
import { serializeMediaAsset, mediaAssetInclude } from "@/lib/api/media";
import { prisma } from "@/lib/db";
import {
  getLocalizedRestaurantName,
  type PublicLocale,
} from "@/lib/public/locale";

export type PublicThemeColors = {
  primaryColor: string | null;
  secondaryColor: string | null;
  buttonColor: string | null;
  headerColor: string | null;
  footerColor: string | null;
};

export type PublicMediaAsset = {
  id: string;
  publicUrl: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: {
    ar: string | null;
    en: string | null;
  };
};

export type PublicSocialLink = {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  sortOrder: number;
};

export type PublicOpeningHour = {
  dayOfWeek:
    | "SATURDAY"
    | "SUNDAY"
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY";
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
  notes: string | null;
};

export type PublicManagerProfileTranslation = {
  name: string;
  title: string | null;
  bio: string | null;
};

export type PublicManagerProfile = {
  isVisible: boolean;
  image: PublicMediaAsset | null;
  translations: {
    ar: PublicManagerProfileTranslation | null;
    en: PublicManagerProfileTranslation | null;
  };
};

export type PublicSiteShell = {
  locale: PublicLocale;
  dir: "rtl" | "ltr";
  restaurantName: string;
  restaurantNames: {
    ar: string | null;
    en: string | null;
  };
  isEnglishEnabled: boolean;
  logo: PublicMediaAsset | null;
  faviconUrl: string | null;
  themeColors: PublicThemeColors | null;
  contact: {
    phone: string | null;
    email: string | null;
    reservationPhone: string | null;
    publicContactEnabled: boolean;
  };
  whatsapp: {
    enabled: boolean;
    number: string | null;
    href: string | null;
  };
  reservation: {
    enabled: boolean;
    href: string;
    phone: string | null;
  };
  googleMapsUrl: string | null;
  address: string | null;
  openingHours: PublicOpeningHour[];
  socialLinks: PublicSocialLink[];
  managerProfile: PublicManagerProfile | null;
  featureFlags: {
    reservationsEnabled: boolean;
    messagesEnabled: boolean;
    reviewsEnabled: boolean;
  };
  reviewSubmission: {
    phoneMode: "OPTIONAL" | "REQUIRED" | "HIDDEN";
  };
};

function mapMediaAsset(
  asset: Parameters<typeof serializeMediaAsset>[0],
): PublicMediaAsset | null {
  const serialized = serializeMediaAsset(asset);

  if (!serialized) {
    return null;
  }

  return {
    id: serialized.id,
    publicUrl: serialized.publicUrl,
    mimeType: serialized.mimeType,
    width: serialized.width,
    height: serialized.height,
    altText: serialized.altText,
  };
}

async function loadPublicSiteShellRecord() {
  const slug =
    process.env.DEFAULT_RESTAURANT_SLUG ?? "default-seafood-restaurant";

  return prisma.restaurant.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      translations: true,
      settings: true,
      contactSettings: true,
      socialLinks: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { platform: "asc" }],
      },
      locations: {
        where: { isPrimary: true, isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      openingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      managerProfile: {
        include: {
          translations: true,
          imageAsset: {
            include: mediaAssetInclude,
          },
        },
      },
      themeSettings: {
        include: {
          logoAsset: {
            include: mediaAssetInclude,
          },
          faviconAsset: {
            include: mediaAssetInclude,
          },
          defaultOgImageAsset: {
            include: mediaAssetInclude,
          },
        },
      },
    },
  });
}

function serializePublicSiteShell(
  restaurant: NonNullable<Awaited<ReturnType<typeof loadPublicSiteShellRecord>>>,
  locale: PublicLocale,
): PublicSiteShell {
  const restaurantNames = {
    ar:
      restaurant.translations.find((translation) => translation.locale === "AR")
        ?.name ?? null,
    en:
      restaurant.translations.find((translation) => translation.locale === "EN")
        ?.name ?? null,
  };

  const whatsappNumber = restaurant.contactSettings?.whatsappNumber ?? null;
  const reservationPhone =
    restaurant.contactSettings?.reservationPhone ??
    restaurant.contactSettings?.phone ??
    null;
  const addressAr =
    restaurant.translations.find((translation) => translation.locale === "AR")
      ?.addressText ?? null;
  const addressEn =
    restaurant.translations.find((translation) => translation.locale === "EN")
      ?.addressText ?? null;

  return {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    restaurantName: getLocalizedRestaurantName(locale, restaurantNames),
    restaurantNames,
    isEnglishEnabled: restaurant.isEnglishEnabled,
    logo: mapMediaAsset(restaurant.themeSettings?.logoAsset ?? null),
    faviconUrl:
      restaurant.themeSettings?.faviconAsset?.publicUrl ??
      restaurant.themeSettings?.logoAsset?.publicUrl ??
      null,
    themeColors: restaurant.themeSettings
      ? {
          primaryColor: restaurant.themeSettings.primaryColor,
          secondaryColor: restaurant.themeSettings.secondaryColor,
          buttonColor: restaurant.themeSettings.buttonColor,
          headerColor: restaurant.themeSettings.headerColor,
          footerColor: restaurant.themeSettings.footerColor,
        }
      : null,
    contact: {
      phone: restaurant.contactSettings?.phone ?? null,
      email: restaurant.contactSettings?.email ?? null,
      reservationPhone,
      publicContactEnabled:
        restaurant.contactSettings?.publicContactEnabled ?? true,
    },
    whatsapp: {
      enabled:
        (restaurant.contactSettings?.whatsappEnabled ?? false) &&
        Boolean(whatsappNumber),
      number: whatsappNumber,
      href: whatsappNumber ? buildWhatsAppLink(whatsappNumber) : null,
    },
    reservation: {
      enabled: restaurant.settings?.reservationsEnabled ?? true,
      href: `/${locale}/reservations`,
      phone: reservationPhone ? buildCallLink(reservationPhone) : null,
    },
    googleMapsUrl: restaurant.locations[0]?.googleMapsUrl ?? null,
    address:
      locale === "en"
        ? (addressEn?.trim() || addressAr?.trim() || null)
        : (addressAr?.trim() || addressEn?.trim() || null),
    openingHours: restaurant.openingHours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      opensAt: hour.opensAt,
      closesAt: hour.closesAt,
      isClosed: hour.isClosed,
      notes: hour.notes,
    })),
    socialLinks: restaurant.socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.label,
      sortOrder: link.sortOrder,
    })),
    managerProfile: restaurant.managerProfile
      ? {
          isVisible: restaurant.managerProfile.isVisible,
          image: mapMediaAsset(restaurant.managerProfile.imageAsset),
          translations: {
            ar: (() => {
              const translation =
                restaurant.managerProfile?.translations.find(
                  (entry) => entry.locale === "AR",
                ) ?? null;

              return translation
                ? {
                    name: translation.name,
                    title: translation.title,
                    bio: translation.bio,
                  }
                : null;
            })(),
            en: (() => {
              const translation =
                restaurant.managerProfile?.translations.find(
                  (entry) => entry.locale === "EN",
                ) ?? null;

              return translation
                ? {
                    name: translation.name,
                    title: translation.title,
                    bio: translation.bio,
                  }
                : null;
            })(),
          },
        }
      : null,
    featureFlags: {
      reservationsEnabled: restaurant.settings?.reservationsEnabled ?? true,
      messagesEnabled: restaurant.settings?.messagesEnabled ?? true,
      reviewsEnabled: restaurant.settings?.reviewsEnabled ?? true,
    },
    reviewSubmission: {
      phoneMode: restaurant.settings?.reviewPhoneMode ?? "OPTIONAL",
    },
  };
}

const getCachedPublicSiteShellRecord = unstable_cache(
  loadPublicSiteShellRecord,
  ["public-site-shell"],
  { revalidate: 60 },
);

export const getPublicSiteShell = cache(async (locale: PublicLocale) => {
  const restaurant = await getCachedPublicSiteShellRecord();

  if (!restaurant) {
    throw new Error("Default restaurant was not found.");
  }

  return serializePublicSiteShell(restaurant, locale);
});

export async function getDefaultPublicRestaurantRecord() {
  return getCachedPublicSiteShellRecord();
}
