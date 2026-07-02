import { prisma } from "@/lib/db";
import {
  buildPublicUrl,
  buildStorageKey,
  buildThumbnailPublicUrl,
} from "@/lib/media/config";
import type { MediaUsageType, Prisma } from "@/lib/generated/prisma/client";

export const mediaLibraryInclude = {
  translations: true,
  uploadedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      managerProfiles: true,
      logoThemeSettings: true,
      coverImageThemeSettings: true,
      faviconThemeSettings: true,
      defaultOgThemeSettings: true,
      heroSlides: true,
      menuCategoryImages: true,
      menuItemImages: true,
      offerImages: true,
      galleryImages: true,
      reviewImages: true,
      seoOgImages: true,
    },
  },
};

export type MediaLibraryRecord = Prisma.MediaAssetGetPayload<{
  include: typeof mediaLibraryInclude;
}>;

export type MediaUsageSummary = {
  total: number;
  managerProfiles: number;
  themeLogo: number;
  themeCoverImage: number;
  themeFavicon: number;
  themeDefaultOgImage: number;
  heroSlides: number;
  menuCategories: number;
  menuItems: number;
  offers: number;
  galleryImages: number;
  reviews: number;
  seoEntries: number;
};

export function getMediaUsageSummary(
  counts: MediaLibraryRecord["_count"],
): MediaUsageSummary {
  return {
    total:
      counts.managerProfiles +
      counts.logoThemeSettings +
      counts.coverImageThemeSettings +
      counts.faviconThemeSettings +
      counts.defaultOgThemeSettings +
      counts.heroSlides +
      counts.menuCategoryImages +
      counts.menuItemImages +
      counts.offerImages +
      counts.galleryImages +
      counts.reviewImages +
      counts.seoOgImages,
    managerProfiles: counts.managerProfiles,
    themeLogo: counts.logoThemeSettings,
    themeCoverImage: counts.coverImageThemeSettings,
    themeFavicon: counts.faviconThemeSettings,
    themeDefaultOgImage: counts.defaultOgThemeSettings,
    heroSlides: counts.heroSlides,
    menuCategories: counts.menuCategoryImages,
    menuItems: counts.menuItemImages,
    offers: counts.offerImages,
    galleryImages: counts.galleryImages,
    reviews: counts.reviewImages,
    seoEntries: counts.seoOgImages,
  };
}

export function serializeMediaLibraryAsset(asset: MediaLibraryRecord) {
  const translationAr =
    asset.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    asset.translations.find((translation) => translation.locale === "EN") ??
    null;
  const usage = getMediaUsageSummary(asset._count);

  return {
    id: asset.id,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
    thumbnailUrl: buildThumbnailPublicUrl(asset.restaurantId, asset.id),
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    width: asset.width,
    height: asset.height,
    originalFilename: asset.originalFilename,
    usageType: asset.usageType,
    status: asset.status,
    defaultLocale: "ar" as const,
    translations: {
      ar: translationAr
        ? {
            altText: translationAr.altText,
            caption: translationAr.caption,
          }
        : null,
      en: translationEn
        ? {
            altText: translationEn.altText,
            caption: translationEn.caption,
          }
        : null,
    },
    uploadedBy: asset.uploadedBy
      ? {
          id: asset.uploadedBy.id,
          name: asset.uploadedBy.name,
          email: asset.uploadedBy.email,
        }
      : null,
    usage,
    isInUse: usage.total > 0,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export async function listMediaAssets(
  restaurantId: string,
  filters?: {
    usageType?: MediaUsageType;
    status?: "ACTIVE" | "ARCHIVED";
  },
) {
  const assets = await prisma.mediaAsset.findMany({
    where: {
      restaurantId,
      ...(filters?.usageType ? { usageType: filters.usageType } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: mediaLibraryInclude,
    orderBy: [{ createdAt: "desc" }],
  });

  return assets.map(serializeMediaLibraryAsset);
}

export async function getMediaLibraryRecord(
  restaurantId: string,
  mediaAssetId: string,
) {
  return prisma.mediaAsset.findFirst({
    where: {
      id: mediaAssetId,
      restaurantId,
    },
    include: mediaLibraryInclude,
  });
}

export async function assertMediaAssetCanBeDeleted(
  restaurantId: string,
  mediaAssetId: string,
) {
  const asset = await getMediaLibraryRecord(restaurantId, mediaAssetId);

  if (!asset) {
    return { status: "not_found" as const };
  }

  const usage = getMediaUsageSummary(asset._count);

  if (usage.total > 0) {
    return {
      status: "in_use" as const,
      usage,
    };
  }

  return { status: "ok" as const, asset };
}

export function buildMediaRecordPaths(restaurantId: string, assetId: string) {
  const storageKey = buildStorageKey(restaurantId, assetId);

  return {
    storageKey,
    publicUrl: buildPublicUrl(storageKey),
  };
}

export async function upsertMediaTranslations(
  mediaAssetId: string,
  translations?: {
    ar?: {
      altText?: string | null;
      caption?: string | null;
    };
    en?: {
      altText?: string | null;
      caption?: string | null;
    } | null;
  },
) {
  if (!translations) {
    return;
  }

  if (translations.ar) {
    await prisma.mediaTranslation.upsert({
      where: {
        mediaAssetId_locale: {
          mediaAssetId,
          locale: "AR",
        },
      },
      create: {
        mediaAssetId,
        locale: "AR",
        altText: translations.ar.altText ?? null,
        caption: translations.ar.caption ?? null,
      },
      update: {
        altText: translations.ar.altText,
        caption: translations.ar.caption,
      },
    });
  }

  if (translations.en === null) {
    await prisma.mediaTranslation.deleteMany({
      where: {
        mediaAssetId,
        locale: "EN",
      },
    });
  } else if (translations.en) {
    await prisma.mediaTranslation.upsert({
      where: {
        mediaAssetId_locale: {
          mediaAssetId,
          locale: "EN",
        },
      },
      create: {
        mediaAssetId,
        locale: "EN",
        altText: translations.en.altText ?? null,
        caption: translations.en.caption ?? null,
      },
      update: {
        altText: translations.en.altText,
        caption: translations.en.caption,
      },
    });
  }
}
