import type { PublicLocale } from "@/lib/public/locale";
import type { PublicOpeningHour } from "@/lib/api/public-site-shell";

export type PreferredContactMethod = "whatsapp" | "phone" | "email";

const DAY_ORDER: PublicOpeningHour["dayOfWeek"][] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const DAY_LABELS = {
  ar: {
    SATURDAY: "السبت",
    SUNDAY: "الأحد",
    MONDAY: "الإثنين",
    TUESDAY: "الثلاثاء",
    WEDNESDAY: "الأربعاء",
    THURSDAY: "الخميس",
    FRIDAY: "الجمعة",
  },
  en: {
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
  },
} as const;

const CONTACT_PAGE_LABELS = {
  ar: {
    subtitle: "تواصل معنا",
    title: "تواصل معنا",
    infoTitle: "معلومات التواصل",
    formTitle: "أرسل رسالة",
    restaurant: "المطعم",
    address: "العنوان",
    phone: "الهاتف",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    hours: "ساعات العمل",
    closed: "مغلق",
    map: "الموقع على الخريطة",
    social: "تابعنا",
    name: "الاسم",
    preferredMethod: "طريقة التواصل المفضلة",
    methodWhatsapp: "واتساب",
    methodPhone: "اتصال هاتفي",
    methodEmail: "بريد إلكتروني",
    whatsappNumber: "رقم واتساب",
    phoneNumber: "رقم الهاتف",
    emailAddress: "البريد الإلكتروني",
    subject: "الموضوع (اختياري)",
    message: "الرسالة",
    submit: "إرسال الرسالة",
    submitting: "جاري الإرسال…",
    successTitle: "تم إرسال رسالتك",
    successBody: "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
    errorTitle: "تعذّر إرسال الرسالة",
    errorBody: "يرجى التحقق من البيانات والمحاولة مرة أخرى.",
    formDisabled: "استقبال الرسائل غير متاح حالياً. يمكنك التواصل عبر الهاتف أو واتساب.",
    required: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صالح",
    invalidPhone: "يرجى إدخال رقم هاتف أو واتساب صالح",
    defaultSubject: "رسالة من نموذج التواصل",
    openWhatsapp: "مراسلة عبر واتساب",
    callUs: "اتصل بنا",
    sendEmail: "راسلنا",
    viewMap: "عرض على الخريطة",
  },
  en: {
    subtitle: "Contact",
    title: "Contact us",
    infoTitle: "Contact information",
    formTitle: "Send a message",
    restaurant: "Restaurant",
    address: "Address",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    hours: "Opening hours",
    closed: "Closed",
    map: "Location map",
    social: "Follow us",
    name: "Name",
    preferredMethod: "Preferred contact method",
    methodWhatsapp: "WhatsApp",
    methodPhone: "Phone call",
    methodEmail: "Email",
    whatsappNumber: "WhatsApp number",
    phoneNumber: "Phone number",
    emailAddress: "Email address",
    subject: "Subject (optional)",
    message: "Message",
    submit: "Send message",
    submitting: "Sending…",
    successTitle: "Message sent",
    successBody: "Thank you for reaching out. We will get back to you as soon as possible.",
    errorTitle: "Unable to send message",
    errorBody: "Please check your details and try again.",
    formDisabled: "Message submissions are currently unavailable. You can still call or message us on WhatsApp.",
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone or WhatsApp number",
    defaultSubject: "Contact form message",
    openWhatsapp: "Message on WhatsApp",
    callUs: "Call us",
    sendEmail: "Email us",
    viewMap: "View on map",
  },
} as const;

const SUBJECT_PREFIX: Record<PreferredContactMethod, string> = {
  whatsapp: "[WHATSAPP]",
  phone: "[PHONE]",
  email: "[EMAIL]",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getContactPageLabels(locale: PublicLocale) {
  return CONTACT_PAGE_LABELS[locale];
}

export function sortOpeningHours(hours: PublicOpeningHour[]) {
  const byDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));

  return DAY_ORDER.map((day) => byDay.get(day)).filter(
    (hour): hour is PublicOpeningHour => Boolean(hour),
  );
}

export function formatOpeningHourLine(
  locale: PublicLocale,
  hour: PublicOpeningHour,
) {
  const labels = getContactPageLabels(locale);
  const dayLabel = DAY_LABELS[locale][hour.dayOfWeek];

  if (hour.isClosed) {
    return `${dayLabel}: ${labels.closed}`;
  }

  if (hour.opensAt && hour.closesAt) {
    return `${dayLabel}: ${hour.opensAt} – ${hour.closesAt}`;
  }

  if (hour.opensAt) {
    return `${dayLabel}: ${hour.opensAt}`;
  }

  return dayLabel;
}

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhoneOrWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function buildContactMessageSubject(
  method: PreferredContactMethod,
  subject: string,
  locale: PublicLocale,
) {
  const labels = getContactPageLabels(locale);
  const trimmedSubject = subject.trim();
  const prefix = SUBJECT_PREFIX[method];

  if (trimmedSubject) {
    return `${prefix} ${trimmedSubject}`;
  }

  return `${prefix} ${labels.defaultSubject}`;
}

export function buildContactMessagePayload(input: {
  name: string;
  method: PreferredContactMethod;
  contactValue: string;
  subject: string;
  message: string;
  locale: PublicLocale;
  spamGuard: {
    honeypot: string;
    formLoadedAt: string;
  };
}) {
  const contactValue = input.contactValue.trim();
  const payload: {
    name: string;
    phoneOrWhatsapp?: string;
    email?: string | null;
    subject: string;
    message: string;
    spamGuard: {
      honeypot: string;
      formLoadedAt: string;
    };
  } = {
    name: input.name.trim(),
    subject: buildContactMessageSubject(
      input.method,
      input.subject,
      input.locale,
    ),
    message: input.message.trim(),
    spamGuard: input.spamGuard,
  };

  if (input.method === "email") {
    payload.email = contactValue;
    payload.phoneOrWhatsapp = contactValue;
  } else {
    payload.phoneOrWhatsapp = contactValue;
  }

  return payload;
}

export function resolveMapEmbedUrl(url: string | null) {
  if (!url) {
    return null;
  }

  if (url.includes("/embed")) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("google") &&
      (parsed.pathname.includes("/maps") || parsed.searchParams.has("q"))
    ) {
      const embedUrl = new URL(url);
      embedUrl.searchParams.set("output", "embed");
      return embedUrl.toString();
    }
  } catch {
    return null;
  }

  return null;
}
