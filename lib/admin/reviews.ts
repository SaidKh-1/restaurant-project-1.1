export const REVIEW_STATUS_OPTIONS = [
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "APPROVED", label: "موافق عليه" },
  { value: "REJECTED", label: "مرفوض" },
  { value: "ARCHIVED", label: "مؤرشف" },
] as const;

export const REVIEW_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  ...REVIEW_STATUS_OPTIONS,
] as const;

export const PUBLIC_NAME_MODE_OPTIONS = [
  { value: "FULL", label: "الاسم الكامل" },
  { value: "FIRST_NAME", label: "الاسم الأول فقط" },
  { value: "SHORTENED", label: "اسم مختصر" },
] as const;

export type ReviewStatus = (typeof REVIEW_STATUS_OPTIONS)[number]["value"];
export type PublicNameMode = (typeof PUBLIC_NAME_MODE_OPTIONS)[number]["value"];

export function getReviewStatusLabel(status: string) {
  return (
    REVIEW_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function getPublicNameModeLabel(mode: string) {
  return (
    PUBLIC_NAME_MODE_OPTIONS.find((option) => option.value === mode)?.label ??
    mode
  );
}

export function formatPublicDisplayName(
  customerName: string,
  mode: PublicNameMode,
) {
  const trimmedName = customerName.trim();

  if (!trimmedName) {
    return "";
  }

  const parts = trimmedName.split(/\s+/).filter(Boolean);

  if (mode === "FULL" || parts.length === 1) {
    return trimmedName;
  }

  if (mode === "FIRST_NAME") {
    return parts[0];
  }

  const firstName = parts[0];
  const secondInitial = parts[1]?.charAt(0);

  return secondInitial ? `${firstName} ${secondInitial}.` : firstName;
}

export function formatReviewDate(iso: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function getReviewStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

export function filterReviewsForAdminTab<T extends { status: string }>(
  items: T[],
  filter: string,
): T[] {
  if (filter === "all") {
    return items.filter((item) => item.status !== "DELETED");
  }

  return items.filter((item) => item.status === filter);
}
