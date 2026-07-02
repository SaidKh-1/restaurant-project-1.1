import { getCmsStatusLabel } from "@/lib/admin/menu";

export { CMS_STATUS_OPTIONS } from "@/lib/admin/menu";

export const OFFER_STATUS_OPTIONS = [
  { value: "DRAFT", label: "مسودة" },
  { value: "PUBLISHED", label: "منشور" },
] as const;

export function getOfferStatusLabel(status: string) {
  return (
    OFFER_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    getCmsStatusLabel(status)
  );
}

export function toDatetimeLocalValue(iso: string | null | undefined) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offsetMs);

  return local.toISOString().slice(0, 16);
}

export function fromDatetimeLocalValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function formatOfferDateRange(
  startsAt: string | null,
  endsAt: string | null,
) {
  if (!startsAt && !endsAt) {
    return "بدون تواريخ";
  }

  const formatter = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (startsAt && endsAt) {
    return `${formatter.format(new Date(startsAt))} — ${formatter.format(new Date(endsAt))}`;
  }

  if (startsAt) {
    return `من ${formatter.format(new Date(startsAt))}`;
  }

  return `حتى ${formatter.format(new Date(endsAt!))}`;
}

export function getOfferPreviewCtaText(
  ctaText: string,
  discountLabel: string,
  fallback = "عرض التفاصيل",
) {
  return ctaText.trim() || discountLabel.trim() || fallback;
}
