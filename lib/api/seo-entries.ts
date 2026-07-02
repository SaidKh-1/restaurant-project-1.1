import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "./media";
import type { Prisma, SeoEntityType } from "@/lib/generated/prisma/client";

export const seoEntryInclude = {
  ogImageAsset: {
    include: mediaAssetInclude,
  },
  translations: true,
};

export type SeoEntryRecord = Prisma.SeoEntryGetPayload<{
  include: typeof seoEntryInclude;
}>;

export type SeoTranslationInput = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

function serializeSeoTranslation(
  translation: SeoEntryRecord["translations"][number] | null,
) {
  if (!translation) {
    return null;
  }

  return {
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    keywords: translation.ogTitle,
    ogDescription: translation.ogDescription,
  };
}

export function deriveRoutePath(pageKey: string) {
  const trimmed = pageKey.trim();

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed === "home") {
    return "/ar";
  }

  return `/ar/${trimmed}`;
}

export function derivePageKey(entry: {
  entityId: string | null;
  routePath: string;
}) {
  if (entry.entityId) {
    return entry.entityId;
  }

  if (entry.routePath === "/ar") {
    return "home";
  }

  return entry.routePath.replace(/^\/ar\/?/, "") || "home";
}

export function serializeSeoEntry(entry: SeoEntryRecord) {
  const translationAr =
    entry.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    entry.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: entry.id,
    pageKey: derivePageKey(entry),
    entityType: entry.entityType,
    entityId: entry.entityId,
    routePath: entry.routePath,
    canonicalUrl: entry.canonicalPath,
    noIndex: !entry.robotsIndex,
    robotsFollow: entry.robotsFollow,
    isSitemapIncluded: entry.isSitemapIncluded,
    ogImageAssetId: entry.ogImageAssetId,
    ogImage: serializeMediaAsset(entry.ogImageAsset),
    defaultLocale: "ar" as const,
    translations: {
      ar: serializeSeoTranslation(translationAr),
      en: serializeSeoTranslation(translationEn),
    },
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function mapSeoTranslationInput(translation: SeoTranslationInput) {
  return {
    seoTitle: translation.seoTitle ?? "",
    seoDescription: translation.seoDescription ?? null,
    ogTitle: translation.keywords ?? translation.ogTitle ?? null,
    ogDescription: translation.ogDescription ?? null,
  };
}

function mapPartialSeoTranslationInput(translation: SeoTranslationInput) {
  return {
    ...(translation.seoTitle !== undefined && translation.seoTitle !== null
      ? { seoTitle: translation.seoTitle }
      : {}),
    ...(translation.seoDescription !== undefined
      ? { seoDescription: translation.seoDescription }
      : {}),
    ...(translation.keywords !== undefined
      ? { ogTitle: translation.keywords }
      : translation.ogTitle !== undefined
        ? { ogTitle: translation.ogTitle }
        : {}),
    ...(translation.ogDescription !== undefined
      ? { ogDescription: translation.ogDescription }
      : {}),
  };
}

export async function upsertSeoTranslation(
  seoEntryId: string,
  locale: "AR" | "EN",
  translation: SeoTranslationInput,
  options?: { partial?: boolean },
) {
  const updateData = options?.partial
    ? mapPartialSeoTranslationInput(translation)
    : mapSeoTranslationInput(translation);

  await prisma.seoEntryTranslation.upsert({
    where: {
      seoEntryId_locale: {
        seoEntryId,
        locale,
      },
    },
    create: {
      seoEntryId,
      locale,
      ...mapSeoTranslationInput(translation),
    },
    update: updateData,
  });
}

export async function listSeoEntries(
  restaurantId: string,
  filters?: {
    pageKey?: string;
    entityType?: SeoEntityType;
    indexableOnly?: boolean;
  },
) {
  const entries = await prisma.seoEntry.findMany({
    where: {
      restaurantId,
      ...(filters?.entityType ? { entityType: filters.entityType } : {}),
      ...(filters?.indexableOnly ? { robotsIndex: true } : {}),
      ...(filters?.pageKey
        ? {
            OR: [
              { entityId: filters.pageKey },
              { routePath: deriveRoutePath(filters.pageKey) },
            ],
          }
        : {}),
    },
    include: seoEntryInclude,
    orderBy: [{ routePath: "asc" }],
  });

  return entries.map(serializeSeoEntry);
}

export async function getSeoEntryRecord(
  restaurantId: string,
  seoEntryId: string,
) {
  const entry = await prisma.seoEntry.findFirst({
    where: {
      id: seoEntryId,
      restaurantId,
    },
    include: seoEntryInclude,
  });

  return entry ? serializeSeoEntry(entry) : null;
}

export async function getSeoEntryByPageKey(
  restaurantId: string,
  pageKey: string,
  options?: { indexableOnly?: boolean },
) {
  const entries = await listSeoEntries(restaurantId, {
    pageKey,
    indexableOnly: options?.indexableOnly,
  });

  return entries[0] ?? null;
}
