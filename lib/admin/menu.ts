export const MENU_UNIT_OPTIONS = [
  { value: "كجم", label: "كجم" },
  { value: "حبة", label: "حبة" },
  { value: "طبق", label: "طبق" },
  { value: "صغير", label: "صغير" },
  { value: "كبير", label: "كبير" },
] as const;

export const CMS_STATUS_OPTIONS = [
  { value: "DRAFT", label: "مسودة" },
  { value: "PUBLISHED", label: "منشور" },
  { value: "ARCHIVED", label: "مؤرشف" },
] as const;

export function slugifyMenuText(text: string) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);

  return slug || "menu-item";
}

export function getCmsStatusLabel(status: string) {
  return (
    CMS_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function getUnitLabel(unit: string, unitLabel?: { ar?: string }) {
  if (unitLabel?.ar) {
    return unitLabel.ar;
  }

  return (
    MENU_UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit
  );
}

export function formatMenuPrice(price: number) {
  return new Intl.NumberFormat("ar", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
