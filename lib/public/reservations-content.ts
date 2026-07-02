import type { PublicLocale } from "@/lib/public/locale";

export type ReservationFormState = {
  name: string;
  phone: string;
  reservationDate: string;
  reservationTime: string;
  guests: string;
  notes: string;
};

export type ReservationFormErrors = {
  name?: string;
  phone?: string;
  reservationDate?: string;
  reservationTime?: string;
  guests?: string;
};

const RESERVATIONS_PAGE_LABELS = {
  ar: {
    subtitle: "الحجز",
    title: "احجز طاولتك",
    formTitle: "طلب حجز",
    formDescription:
      "أرسل طلب الحجز دون إنشاء حساب. سنتواصل معك لتأكيد الموعد.",
    name: "الاسم",
    phone: "رقم الهاتف أو واتساب",
    phoneHint: "مطلوب للتواصل وتأكيد الحجز",
    date: "التاريخ",
    time: "الوقت",
    guests: "عدد الضيوف",
    notes: "ملاحظات (اختياري)",
    submit: "إرسال طلب الحجز",
    submitting: "جاري الإرسال…",
    successTitle: "تم إرسال طلب الحجز",
    successBody:
      "شكراً لك. سنراجع طلبك ونتواصل معك قريباً لتأكيد الحجز.",
    errorTitle: "تعذّر إرسال طلب الحجز",
    errorBody: "يرجى التحقق من البيانات والمحاولة مرة أخرى.",
    disabledTitle: "الحجز الإلكتروني غير متاح حالياً",
    disabledBody:
      "يمكنك التواصل معنا عبر واتساب لطلب الحجز مباشرة.",
    whatsappCta: "احجز عبر واتساب",
    callCta: "اتصل للحجز",
    required: "هذا الحقل مطلوب",
    invalidPhone: "يرجى إدخال رقم هاتف أو واتساب صالح",
    invalidDate: "يرجى اختيار تاريخ صالح (اليوم أو لاحقاً)",
    invalidTime: "يرجى إدخال وقت صالح",
    invalidGuests: "يرجى إدخال عدد ضيوف بين 1 و 50",
  },
  en: {
    subtitle: "Reservations",
    title: "Reserve your table",
    formTitle: "Reservation request",
    formDescription:
      "Submit a reservation without creating an account. We will contact you to confirm.",
    name: "Name",
    phone: "Phone or WhatsApp number",
    phoneHint: "Required so we can contact you to confirm",
    date: "Date",
    time: "Time",
    guests: "Number of guests",
    notes: "Notes (optional)",
    submit: "Submit reservation",
    submitting: "Submitting…",
    successTitle: "Reservation request sent",
    successBody:
      "Thank you. We will review your request and contact you soon to confirm.",
    errorTitle: "Unable to submit reservation",
    errorBody: "Please check your details and try again.",
    disabledTitle: "Online reservations are currently unavailable",
    disabledBody: "You can contact us on WhatsApp to request a reservation directly.",
    whatsappCta: "Reserve on WhatsApp",
    callCta: "Call to reserve",
    required: "This field is required",
    invalidPhone: "Please enter a valid phone or WhatsApp number",
    invalidDate: "Please choose a valid date (today or later)",
    invalidTime: "Please enter a valid time",
    invalidGuests: "Please enter a guest count between 1 and 50",
  },
} as const;

export function getReservationsPageLabels(locale: PublicLocale) {
  return RESERVATIONS_PAGE_LABELS[locale];
}

export function isValidReservationPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidReservationDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return parsed.getTime() >= todayUtc.getTime();
}

export function isValidReservationTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function getMinReservationDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateReservationForm(
  form: ReservationFormState,
  locale: PublicLocale,
): ReservationFormErrors {
  const labels = getReservationsPageLabels(locale);
  const errors: ReservationFormErrors = {};

  if (!form.name.trim()) {
    errors.name = labels.required;
  }

  if (!form.phone.trim()) {
    errors.phone = labels.required;
  } else if (!isValidReservationPhone(form.phone)) {
    errors.phone = labels.invalidPhone;
  }

  if (!form.reservationDate.trim()) {
    errors.reservationDate = labels.required;
  } else if (!isValidReservationDate(form.reservationDate)) {
    errors.reservationDate = labels.invalidDate;
  }

  if (!form.reservationTime.trim()) {
    errors.reservationTime = labels.required;
  } else if (!isValidReservationTime(form.reservationTime)) {
    errors.reservationTime = labels.invalidTime;
  }

  const guests = Number.parseInt(form.guests, 10);

  if (!form.guests.trim()) {
    errors.guests = labels.required;
  } else if (!Number.isInteger(guests) || guests < 1 || guests > 50) {
    errors.guests = labels.invalidGuests;
  }

  return errors;
}

export function buildPublicReservationPayload(
  form: ReservationFormState,
  spamGuard: {
    honeypot: string;
    formLoadedAt: string;
  },
) {
  return {
    name: form.name.trim(),
    phoneOrWhatsapp: form.phone.trim(),
    reservationDate: form.reservationDate.trim(),
    reservationTime: form.reservationTime.trim(),
    guests: Number.parseInt(form.guests, 10),
    notes: form.notes.trim() || null,
    spamGuard,
  };
}

export function createDefaultReservationForm(): ReservationFormState {
  return {
    name: "",
    phone: "",
    reservationDate: "",
    reservationTime: "",
    guests: "",
    notes: "",
  };
}
