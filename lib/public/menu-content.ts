import { pickLocalizedTranslation } from "@/lib/public/content";
import type { PublicLocale } from "@/lib/public/locale";
import type {
  PublicMenuCategory,
  PublicMenuCookingMethod,
  PublicMenuItem,
  PublicMenuPriceVariant,
  PublicMenuTranslation,
} from "@/lib/public/types";

export const MENU_PAGE_LABELS = {
  ar: {
    title: "المنيو",
    subtitle: "أسماك طازجة ومأكولات بحرية",
    featured: "مميز",
    available: "متوفر",
    cookingMethods: "طرق الطهي",
    emptyCategory: "لا توجد أصناف في هذا القسم حالياً.",
    emptyMenu: "المنيو غير متاح حالياً.",
    jumpToCategory: "انتقل إلى القسم",
  },
  en: {
    title: "Menu",
    subtitle: "Fresh fish and seafood",
    featured: "Featured",
    available: "Available",
    cookingMethods: "Cooking methods",
    emptyCategory: "No items in this category yet.",
    emptyMenu: "The menu is not available right now.",
    jumpToCategory: "Jump to category",
  },
} as const;

export function getMenuPageLabels(locale: PublicLocale) {
  return MENU_PAGE_LABELS[locale];
}

export function getMenuTranslation(
  locale: PublicLocale,
  translations: {
    ar: PublicMenuTranslation | null;
    en: PublicMenuTranslation | null;
  },
) {
  return pickLocalizedTranslation(locale, translations);
}

export function formatMenuPrice(price: number, currencyCode: string) {
  return new Intl.NumberFormat("ar-QA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getPriceVariantLabel(
  locale: PublicLocale,
  variant: PublicMenuPriceVariant,
) {
  const translation = getMenuTranslation(locale, variant.translations);
  const unit =
    locale === "en"
      ? variant.unit
      : (variant.unitLabel.ar ?? variant.unit);

  if (translation?.name?.trim()) {
    return `${translation.name.trim()} · ${unit}`;
  }

  return unit;
}

export function groupMenuItemsByCategory(
  categories: PublicMenuCategory[],
  items: PublicMenuItem[],
) {
  const itemsByCategory = new Map<string, PublicMenuItem[]>();

  for (const item of items) {
    const bucket = itemsByCategory.get(item.menuCategoryId) ?? [];
    bucket.push(item);
    itemsByCategory.set(item.menuCategoryId, bucket);
  }

  return categories
    .map((category) => ({
      category,
      items: (itemsByCategory.get(category.id) ?? []).sort(
        (left, right) => left.sortOrder - right.sortOrder,
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function getCookingMethodNames(
  locale: PublicLocale,
  methods: PublicMenuCookingMethod[],
) {
  return methods
    .map((method) => getMenuTranslation(locale, method.translations)?.name?.trim())
    .filter((name): name is string => Boolean(name));
}

export function getCategoryAnchorId(slug: string) {
  return `menu-category-${slug}`;
}
