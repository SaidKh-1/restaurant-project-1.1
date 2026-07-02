import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "about",
  "featuredMenu",
  "featuredGallery",
  "offers",
  "reviews",
  "contactCta",
  "manager",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

type DefaultHomepageSection = {
  sectionKey: HomepageSectionKey;
  sortOrder: number;
  defaults: {
    ar: { title: string; subtitle: string | null };
    en: { title: string; subtitle: string | null };
  };
};

export const DEFAULT_HOMEPAGE_SECTIONS: DefaultHomepageSection[] = [
  {
    sectionKey: "hero",
    sortOrder: 0,
    defaults: {
      ar: { title: "الرئيسية", subtitle: "اكتشف أطباقنا البحرية الطازجة" },
      en: { title: "Home", subtitle: "Discover our fresh seafood dishes" },
    },
  },
  {
    sectionKey: "about",
    sortOrder: 1,
    defaults: {
      ar: { title: "عن المطعم", subtitle: "تعرّف على قصتنا" },
      en: { title: "About us", subtitle: "Learn our story" },
    },
  },
  {
    sectionKey: "featuredMenu",
    sortOrder: 2,
    defaults: {
      ar: { title: "أطباق مميزة", subtitle: "من اختيارات الشيف" },
      en: { title: "Featured menu", subtitle: "Chef's picks" },
    },
  },
  {
    sectionKey: "featuredGallery",
    sortOrder: 3,
    defaults: {
      ar: { title: "معرض الصور", subtitle: "لحظات من مطعمنا" },
      en: { title: "Gallery highlights", subtitle: "Moments from our restaurant" },
    },
  },
  {
    sectionKey: "offers",
    sortOrder: 4,
    defaults: {
      ar: { title: "العروض", subtitle: "عروض اليوم والأسبوع" },
      en: { title: "Offers", subtitle: "Today's and weekly deals" },
    },
  },
  {
    sectionKey: "reviews",
    sortOrder: 5,
    defaults: {
      ar: { title: "التقييمات", subtitle: "آراء عملائنا" },
      en: { title: "Reviews", subtitle: "What our guests say" },
    },
  },
  {
    sectionKey: "contactCta",
    sortOrder: 6,
    defaults: {
      ar: { title: "تواصل معنا", subtitle: "احجز طاولتك أو راسلنا" },
      en: { title: "Contact us", subtitle: "Book a table or message us" },
    },
  },
  {
    sectionKey: "manager",
    sortOrder: 7,
    defaults: {
      ar: { title: "مدير المطعم", subtitle: "تعرّف على مدير المطعم" },
      en: { title: "Restaurant manager", subtitle: "Meet our manager" },
    },
  },
];

export const homepageSectionInclude = {
  translations: true,
} as const;

export type HomepageSectionRecord = Prisma.HomepageSectionGetPayload<{
  include: typeof homepageSectionInclude;
}>;

export type HomepageSectionTranslationInput = {
  title?: string | null;
  subtitle?: string | null;
};

function serializeHomepageSectionTranslation(
  translation: HomepageSectionRecord["translations"][number] | null,
) {
  if (!translation) {
    return null;
  }

  return {
    title: translation.title,
    subtitle: translation.subtitle,
  };
}

export function serializeHomepageSection(section: HomepageSectionRecord) {
  const translationAr =
    section.translations.find((translation) => translation.locale === "AR") ??
    null;
  const translationEn =
    section.translations.find((translation) => translation.locale === "EN") ??
    null;

  return {
    id: section.id,
    sectionKey: section.sectionKey,
    isVisible: section.isVisible,
    sortOrder: section.sortOrder,
    layoutType: section.layoutType,
    status: section.status,
    defaultLocale: "ar" as const,
    translations: {
      ar: serializeHomepageSectionTranslation(translationAr),
      en: serializeHomepageSectionTranslation(translationEn),
    },
    createdAt: section.createdAt.toISOString(),
    updatedAt: section.updatedAt.toISOString(),
  };
}

export async function ensureHomepageSections(restaurantId: string) {
  const existingSections = await prisma.homepageSection.findMany({
    where: { restaurantId },
    select: { sectionKey: true },
  });
  const existingKeys = new Set(existingSections.map((section) => section.sectionKey));
  const missingSections = DEFAULT_HOMEPAGE_SECTIONS.filter(
    (section) => !existingKeys.has(section.sectionKey),
  );

  if (missingSections.length === 0) {
    return;
  }

  await prisma.$transaction(
    missingSections.map((section) =>
      prisma.homepageSection.create({
        data: {
          restaurantId,
          sectionKey: section.sectionKey,
          isVisible: true,
          sortOrder: section.sortOrder,
          status: "PUBLISHED",
          translations: {
            create: [
              {
                locale: "AR",
                title: section.defaults.ar.title,
                subtitle: section.defaults.ar.subtitle,
              },
              {
                locale: "EN",
                title: section.defaults.en.title,
                subtitle: section.defaults.en.subtitle,
              },
            ],
          },
        },
      }),
    ),
  );
}

export async function listHomepageSections(restaurantId: string) {
  await ensureHomepageSections(restaurantId);

  const sections = await prisma.homepageSection.findMany({
    where: {
      restaurantId,
      sectionKey: { in: [...HOMEPAGE_SECTION_KEYS] },
    },
    include: homepageSectionInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return sections.map(serializeHomepageSection);
}

export async function getHomepageSectionRecord(
  restaurantId: string,
  sectionId: string,
) {
  const section = await prisma.homepageSection.findFirst({
    where: {
      id: sectionId,
      restaurantId,
    },
    include: homepageSectionInclude,
  });

  return section ? serializeHomepageSection(section) : null;
}

function mapPartialTranslationInputToData(
  translation: HomepageSectionTranslationInput,
) {
  return {
    ...(translation.title !== undefined ? { title: translation.title } : {}),
    ...(translation.subtitle !== undefined
      ? { subtitle: translation.subtitle }
      : {}),
  };
}

export async function upsertHomepageSectionTranslation(
  homepageSectionId: string,
  locale: "AR" | "EN",
  translation: HomepageSectionTranslationInput,
) {
  const data = mapPartialTranslationInputToData(translation);

  await prisma.homepageSectionTranslation.upsert({
    where: {
      homepageSectionId_locale: {
        homepageSectionId,
        locale,
      },
    },
    create: {
      homepageSectionId,
      locale,
      title: translation.title ?? null,
      subtitle: translation.subtitle ?? null,
    },
    update: data,
  });
}

export async function reorderHomepageSections(
  restaurantId: string,
  sections: Array<{ id: string; sortOrder: number }>,
) {
  const existingSections = await prisma.homepageSection.findMany({
    where: { restaurantId },
    select: { id: true },
  });
  const existingIds = new Set(existingSections.map((section) => section.id));

  for (const section of sections) {
    if (!existingIds.has(section.id)) {
      throw new Error("Homepage section was not found.");
    }
  }

  await prisma.$transaction(
    sections.map((section) =>
      prisma.homepageSection.update({
        where: { id: section.id },
        data: { sortOrder: section.sortOrder },
      }),
    ),
  );

  return listHomepageSections(restaurantId);
}

export async function updateHomepageSection(
  restaurantId: string,
  sectionId: string,
  input: {
    isVisible?: boolean;
    sortOrder?: number;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    translations?: {
      ar?: HomepageSectionTranslationInput;
      en?: HomepageSectionTranslationInput | null;
    };
  },
) {
  const existingSection = await prisma.homepageSection.findFirst({
    where: {
      id: sectionId,
      restaurantId,
    },
  });

  if (!existingSection) {
    return null;
  }

  await prisma.homepageSection.update({
    where: { id: sectionId },
    data: {
      isVisible: input.isVisible,
      sortOrder: input.sortOrder,
      status: input.status,
    },
  });

  if (input.translations?.ar) {
    await upsertHomepageSectionTranslation(
      sectionId,
      "AR",
      input.translations.ar,
    );
  }

  if (input.translations?.en) {
    await upsertHomepageSectionTranslation(
      sectionId,
      "EN",
      input.translations.en,
    );
  } else if (input.translations?.en === null) {
    await prisma.homepageSectionTranslation.deleteMany({
      where: {
        homepageSectionId: sectionId,
        locale: "EN",
      },
    });
  }

  return getHomepageSectionRecord(restaurantId, sectionId);
}
