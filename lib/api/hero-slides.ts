import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "./media";
import type { Prisma } from "@/lib/generated/prisma/client";

export const heroSlideInclude = {
  imageAsset: {
    include: mediaAssetInclude,
  },
  translations: true,
};

export type HeroSlideRecord = Prisma.HeroSlideGetPayload<{
  include: typeof heroSlideInclude;
}>;

function serializeHeroSlideTranslation(
  translation: HeroSlideRecord["translations"][number] | null,
) {
  if (!translation) {
    return null;
  }

  return {
    title: translation.title,
    subtitle: translation.subtitle,
    buttonText: translation.primaryButtonLabel,
    buttonLink: translation.primaryButtonUrl,
    secondaryButtonText: translation.secondaryButtonLabel,
    secondaryButtonLink: translation.secondaryButtonUrl,
  };
}

export function serializeHeroSlide(slide: HeroSlideRecord) {
  const translationAr =
    slide.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    slide.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: slide.id,
    imageAssetId: slide.imageAssetId,
    image: serializeMediaAsset(slide.imageAsset),
    isVisible: slide.isVisible,
    isActive: slide.isVisible,
    sortOrder: slide.sortOrder,
    status: slide.status,
    startsAt: slide.startsAt,
    endsAt: slide.endsAt,
    defaultLocale: "ar" as const,
    translations: {
      ar: serializeHeroSlideTranslation(translationAr),
      en: serializeHeroSlideTranslation(translationEn),
    },
    createdAt: slide.createdAt,
    updatedAt: slide.updatedAt,
  };
}

export async function listHeroSlides(restaurantId: string) {
  const slides = await prisma.heroSlide.findMany({
    where: { restaurantId },
    include: heroSlideInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return slides.map(serializeHeroSlide);
}

export async function getHeroSlideRecord(
  restaurantId: string,
  heroSlideId: string,
) {
  return prisma.heroSlide.findFirst({
    where: {
      id: heroSlideId,
      restaurantId,
    },
    include: heroSlideInclude,
  });
}

export type HeroSlideTranslationInput = {
  title?: string | null;
  subtitle?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  secondaryButtonText?: string | null;
  secondaryButtonLink?: string | null;
};

export function mapTranslationInputToData(
  translation: HeroSlideTranslationInput,
) {
  return {
    title: translation.title ?? null,
    subtitle: translation.subtitle ?? null,
    primaryButtonLabel: translation.buttonText ?? null,
    primaryButtonUrl: translation.buttonLink ?? null,
    secondaryButtonLabel: translation.secondaryButtonText ?? null,
    secondaryButtonUrl: translation.secondaryButtonLink ?? null,
  };
}

function mapPartialTranslationInputToData(
  translation: HeroSlideTranslationInput,
) {
  return {
    ...(translation.title !== undefined ? { title: translation.title } : {}),
    ...(translation.subtitle !== undefined
      ? { subtitle: translation.subtitle }
      : {}),
    ...(translation.buttonText !== undefined
      ? { primaryButtonLabel: translation.buttonText }
      : {}),
    ...(translation.buttonLink !== undefined
      ? { primaryButtonUrl: translation.buttonLink }
      : {}),
    ...(translation.secondaryButtonText !== undefined
      ? { secondaryButtonLabel: translation.secondaryButtonText }
      : {}),
    ...(translation.secondaryButtonLink !== undefined
      ? { secondaryButtonUrl: translation.secondaryButtonLink }
      : {}),
  };
}

export async function upsertHeroSlideTranslation(
  heroSlideId: string,
  locale: "AR" | "EN",
  translation: HeroSlideTranslationInput,
  options?: { partial?: boolean },
) {
  const data = options?.partial
    ? mapPartialTranslationInputToData(translation)
    : mapTranslationInputToData(translation);

  await prisma.heroSlideTranslation.upsert({
    where: {
      heroSlideId_locale: {
        heroSlideId,
        locale,
      },
    },
    create: {
      heroSlideId,
      locale,
      ...mapTranslationInputToData(translation),
    },
    update: data,
  });
}
