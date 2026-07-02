import { buildCallLink, buildWhatsAppLink } from "@/lib/admin/hero-slides";

export const MESSAGE_STATUS_OPTIONS = [
  { value: "NEW", label: "جديد" },
  { value: "READ", label: "مقروء" },
  { value: "ARCHIVED", label: "مؤرشف" },
] as const;

export const MESSAGE_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  ...MESSAGE_STATUS_OPTIONS,
] as const;

export type ContactPreference = "WHATSAPP" | "PHONE" | "EMAIL";

export const CONTACT_PREFERENCE_LABELS: Record<ContactPreference, string> = {
  WHATSAPP: "واتساب",
  PHONE: "هاتف",
  EMAIL: "بريد إلكتروني",
};

export function getMessageStatusLabel(status: string) {
  return (
    MESSAGE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function getMessageStatusVariant(
  status: string,
): "default" | "secondary" | "outline" {
  switch (status) {
    case "NEW":
      return "default";
    case "READ":
      return "secondary";
    default:
      return "outline";
  }
}

export function formatMessageDate(iso: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function getContactPreferences(input: {
  phoneOrWhatsapp: string;
  email: string | null;
}): ContactPreference[] {
  const preferences: ContactPreference[] = [];

  if (input.phoneOrWhatsapp.trim()) {
    preferences.push("WHATSAPP", "PHONE");
  }

  if (input.email?.trim()) {
    preferences.push("EMAIL");
  }

  return preferences;
}

export function buildWhatsAppReplyLink(
  phoneOrWhatsapp: string,
  message: { name: string; subject: string },
) {
  const base = buildWhatsAppLink(phoneOrWhatsapp);

  if (!base) {
    return null;
  }

  const text = encodeURIComponent(
    `مرحباً ${message.name}،\n\nبخصوص رسالتك: «${message.subject}»\n\n`,
  );

  return `${base}?text=${text}`;
}

export function buildEmailReplyLink(message: {
  email: string | null;
  name: string;
  subject: string;
}) {
  if (!message.email?.trim()) {
    return null;
  }

  const subject = encodeURIComponent(`رد: ${message.subject}`);
  const body = encodeURIComponent(`مرحباً ${message.name}،\n\n`);

  return `mailto:${message.email}?subject=${subject}&body=${body}`;
}

export function buildPhoneCallLink(phoneOrWhatsapp: string) {
  return buildCallLink(phoneOrWhatsapp);
}
