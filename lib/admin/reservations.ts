import { buildCallLink, buildWhatsAppLink } from "@/lib/admin/hero-slides";
import type { ReservationWorkflowStatus } from "@/lib/api/admin-reservations";

export const RESERVATION_WORKFLOW_STATUS_OPTIONS = [
  { value: "pending", label: "معلق" },
  { value: "confirmed", label: "مؤكد" },
  { value: "cancelled", label: "ملغى" },
  { value: "completed", label: "مكتمل" },
  { value: "archived", label: "مؤرشف" },
] as const;

export const RESERVATION_WORKFLOW_FILTER_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  ...RESERVATION_WORKFLOW_STATUS_OPTIONS,
] as const;

export function getReservationWorkflowStatusLabel(
  workflowStatus: ReservationWorkflowStatus | string,
) {
  return (
    RESERVATION_WORKFLOW_STATUS_OPTIONS.find(
      (option) => option.value === workflowStatus,
    )?.label ?? workflowStatus
  );
}

export function getReservationWorkflowStatusVariant(
  workflowStatus: ReservationWorkflowStatus | string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (workflowStatus) {
    case "pending":
      return "default";
    case "confirmed":
      return "secondary";
    case "completed":
      return "outline";
    case "cancelled":
    case "archived":
      return "destructive";
    default:
      return "outline";
  }
}

export function formatReservationDate(isoDate: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

export function formatReservationDateTime(iso: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function buildWhatsAppReservationLink(
  phone: string,
  reservation: {
    name: string;
    reservationDate: string;
    reservationTime: string;
    guests: number;
  },
) {
  const base = buildWhatsAppLink(phone);

  if (!base) {
    return null;
  }

  const dateLabel = formatReservationDate(reservation.reservationDate);
  const text = encodeURIComponent(
    `مرحباً ${reservation.name}،\n\nبخصوص حجزكم بتاريخ ${dateLabel} الساعة ${reservation.reservationTime} لعدد ${reservation.guests} ضيوف.\n\n`,
  );

  return `${base}?text=${text}`;
}

export function buildPhoneReservationLink(phone: string) {
  return buildCallLink(phone);
}

export function filterReservationsForAdminTab<
  T extends { workflowStatus: ReservationWorkflowStatus },
>(items: T[], filter: string) {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.workflowStatus === filter);
}
