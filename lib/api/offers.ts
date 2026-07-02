import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "./media";
import type { CmsStatus, Prisma } from "@/lib/generated/prisma/client";

export const offerInclude = {
  imageAsset: {
    include: mediaAssetInclude,
  },
  translations: true,
  _count: {
    select: {
      homepageSections: true,
    },
  },
};

export type OfferRecord = Prisma.OfferGetPayload<{
  include: typeof offerInclude;
}>;

export type OfferTranslationInput = {
  title?: string | null;
  description?: string | null;
  discountText?: string | null;
  ctaUrl?: string | null;
};

function serializeOfferTranslation(
  translation: OfferRecord["translations"][number] | null,
) {
  if (!translation) {
    return null;
  }

  return {
    title: translation.title,
    description: translation.description,
    discountText: translation.ctaLabel,
    ctaUrl: translation.ctaUrl,
  };
}

export function serializeOffer(offer: OfferRecord) {
  const translationAr =
    offer.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    offer.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: offer.id,
    imageAssetId: offer.imageAssetId,
    image: serializeMediaAsset(offer.imageAsset),
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
    isActive: offer.isActive,
    isFeatured: offer.isFeatured,
    sortOrder: offer.sortOrder,
    status: offer.status,
    defaultLocale: "ar" as const,
    translations: {
      ar: serializeOfferTranslation(translationAr),
      en: serializeOfferTranslation(translationEn),
    },
    homepageSectionCount: offer._count.homepageSections,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
}

export function mapOfferTranslationInput(translation: OfferTranslationInput) {
  return {
    title: translation.title ?? "",
    description: translation.description ?? null,
    ctaLabel: translation.discountText ?? null,
    ctaUrl: translation.ctaUrl ?? null,
  };
}

function mapPartialOfferTranslationInput(translation: OfferTranslationInput) {
  return {
    ...(translation.title !== undefined && translation.title !== null
      ? { title: translation.title }
      : {}),
    ...(translation.description !== undefined
      ? { description: translation.description }
      : {}),
    ...(translation.discountText !== undefined
      ? { ctaLabel: translation.discountText }
      : {}),
    ...(translation.ctaUrl !== undefined ? { ctaUrl: translation.ctaUrl } : {}),
  };
}

export async function upsertOfferTranslation(
  offerId: string,
  locale: "AR" | "EN",
  translation: OfferTranslationInput,
  options?: { partial?: boolean },
) {
  const updateData = options?.partial
    ? mapPartialOfferTranslationInput(translation)
    : mapOfferTranslationInput(translation);

  await prisma.offerTranslation.upsert({
    where: {
      offerId_locale: {
        offerId,
        locale,
      },
    },
    create: {
      offerId,
      locale,
      ...mapOfferTranslationInput(translation),
    },
    update: updateData,
  });
}

export async function listOffers(
  restaurantId: string,
  filters?: {
    status?: CmsStatus;
    isActive?: boolean;
    isFeatured?: boolean;
  },
) {
  const offers = await prisma.offer.findMany({
    where: {
      restaurantId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters?.isFeatured !== undefined
        ? { isFeatured: filters.isFeatured }
        : {}),
    },
    include: offerInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return offers.map(serializeOffer);
}

export async function listActivePublicOffers(restaurantId: string) {
  const now = new Date();

  const offers = await prisma.offer.findMany({
    where: {
      restaurantId,
      isActive: true,
      status: "PUBLISHED",
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      ],
    },
    include: offerInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return offers.map(serializeOffer);
}

export async function getOfferRecord(restaurantId: string, offerId: string) {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      restaurantId,
    },
    include: offerInclude,
  });

  return offer ? serializeOffer(offer) : null;
}

export async function assertOfferCanBeDeleted(
  restaurantId: string,
  offerId: string,
) {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      restaurantId,
    },
    select: {
      _count: {
        select: {
          homepageSections: true,
        },
      },
    },
  });

  if (!offer) {
    return "not_found" as const;
  }

  if (offer._count.homepageSections > 0) {
    throw new Error(
      "Cannot delete an offer that is still assigned to homepage sections.",
    );
  }

  return "ok" as const;
}
