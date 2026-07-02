export type HeroButtonType = "internal" | "whatsapp" | "call" | "reservation";

export const HERO_BUTTON_TYPE_OPTIONS: {
  value: HeroButtonType;
  label: string;
}[] = [
  { value: "internal", label: "رابط داخلي" },
  { value: "whatsapp", label: "واتساب" },
  { value: "call", label: "اتصال" },
  { value: "reservation", label: "حجز (قريباً)" },
];

export const HERO_DEFAULT_PRIMARY = {
  buttonText: "استعرض المنيو",
  buttonType: "internal" as const,
  buttonLink: "/ar/menu",
};

export const HERO_DEFAULT_SECONDARY = {
  buttonText: "اطلب عبر واتساب",
  buttonType: "whatsapp" as const,
};

export const HERO_STATUS_OPTIONS = [
  { value: "DRAFT", label: "مسودة" },
  { value: "PUBLISHED", label: "منشور" },
  { value: "ARCHIVED", label: "مؤرشف" },
] as const;

export function buildWhatsAppLink(number: string) {
  const digits = number.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

export function buildCallLink(phone: string) {
  const normalized = phone.replace(/\s/g, "").trim();

  if (!normalized) {
    return null;
  }

  return normalized.startsWith("tel:") ? normalized : `tel:${normalized}`;
}

export function buildReservationLink() {
  return "#reservation";
}

export function inferButtonType(link: string | null | undefined): HeroButtonType {
  if (!link) {
    return "internal";
  }

  const value = link.trim().toLowerCase();

  if (value.startsWith("tel:")) {
    return "call";
  }

  if (
    value.includes("wa.me") ||
    value.includes("whatsapp.com") ||
    value.startsWith("whatsapp:")
  ) {
    return "whatsapp";
  }

  if (value === "#reservation" || value.includes("reservation")) {
    return "reservation";
  }

  return "internal";
}

export function resolveButtonLink(
  type: HeroButtonType,
  options: {
    internalPath?: string;
    whatsappNumber?: string | null;
    phoneNumber?: string | null;
    customLink?: string;
  },
) {
  switch (type) {
    case "internal":
      return options.internalPath?.trim() || options.customLink?.trim() || null;
    case "whatsapp":
      return options.whatsappNumber
        ? buildWhatsAppLink(options.whatsappNumber)
        : options.customLink?.trim() || null;
    case "call":
      return options.phoneNumber
        ? buildCallLink(options.phoneNumber)
        : options.customLink?.trim() || null;
    case "reservation":
      return buildReservationLink();
    default:
      return null;
  }
}

export function getStatusLabel(status: string) {
  return (
    HERO_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function formatHeroDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
