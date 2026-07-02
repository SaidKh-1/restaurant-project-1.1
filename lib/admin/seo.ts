import type { SeoEntityType, SeoEntryData } from "@/lib/admin/types";

export const SEO_ENTITY_TYPE_OPTIONS: {
  value: SeoEntityType;
  label: string;
}[] = [
  { value: "PAGE", label: "صفحة" },
  { value: "MENU_CATEGORY", label: "تصنيف منيو" },
  { value: "MENU_ITEM", label: "صنف منيو" },
  { value: "OFFER", label: "عرض" },
  { value: "GALLERY", label: "معرض" },
  { value: "REVIEW_PAGE", label: "صفحة التقييمات" },
  { value: "ABOUT", label: "عن المطعم" },
  { value: "MANAGER", label: "مدير المطعم" },
  { value: "CONTACT", label: "تواصل" },
];

export function getSeoEntityTypeLabel(entityType: SeoEntityType) {
  return (
    SEO_ENTITY_TYPE_OPTIONS.find((option) => option.value === entityType)
      ?.label ?? entityType
  );
}

export function formatSeoDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getSeoIndexLabel(noIndex: boolean) {
  return noIndex ? "مخفي من الفهرسة" : "قابل للفهرسة";
}

export function getSeoIndexVariant(noIndex: boolean) {
  return noIndex ? ("secondary" as const) : ("default" as const);
}

export function getSeoDisplayTitle(entry: SeoEntryData) {
  return entry.translations.ar?.seoTitle?.trim() || entry.pageKey;
}

export function getSeoDisplayDescription(entry: SeoEntryData) {
  return entry.translations.ar?.seoDescription?.trim() || "—";
}
