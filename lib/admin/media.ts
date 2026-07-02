import type { MediaUsageSummary } from "@/lib/admin/types";

export const MEDIA_USAGE_TYPE_OPTIONS = [
  { value: "LOGO", label: "شعار" },
  { value: "FAVICON", label: "أيقونة" },
  { value: "HERO", label: "Hero" },
  { value: "MENU_ITEM", label: "صنف منيو" },
  { value: "OFFER", label: "عرض" },
  { value: "GALLERY", label: "معرض" },
  { value: "MANAGER", label: "مدير المطعم" },
  { value: "REVIEW", label: "تقييم" },
  { value: "OPEN_GRAPH", label: "Open Graph" },
  { value: "OTHER", label: "أخرى" },
] as const;

export type MediaUsageTypeValue =
  (typeof MEDIA_USAGE_TYPE_OPTIONS)[number]["value"];

const USAGE_FIELD_LABELS: Record<keyof Omit<MediaUsageSummary, "total">, string> =
  {
    managerProfiles: "مدير المطعم",
    themeLogo: "الشعار",
    themeCoverImage: "صورة الغلاف",
    themeFavicon: "الأيقونة",
    themeDefaultOgImage: "OG افتراضي",
    heroSlides: "Hero Slider",
    menuCategories: "أقسام المنيو",
    menuItems: "أصناف المنيو",
    offers: "العروض",
    galleryImages: "معرض الصور",
    reviews: "التقييمات",
    seoEntries: "SEO",
  };

export function getUsageTypeLabel(value: string) {
  return (
    MEDIA_USAGE_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function getActiveUsageLabels(usage: MediaUsageSummary) {
  return (
    Object.entries(USAGE_FIELD_LABELS) as [
      keyof Omit<MediaUsageSummary, "total">,
      string,
    ][]
  )
    .filter(([key]) => usage[key] > 0)
    .map(([, label]) => label);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMediaDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
