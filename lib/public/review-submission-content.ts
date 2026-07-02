import type { PublicLocale } from "@/lib/public/locale";

export type ReviewPhoneMode = "OPTIONAL" | "REQUIRED" | "HIDDEN";

export type ReviewSubmissionFormState = {
  customerName: string;
  email: string;
  phone: string;
  rating: number | null;
  title: string;
  comment: string;
};

export type ReviewSubmissionFormErrors = {
  customerName?: string;
  email?: string;
  phone?: string;
  rating?: string;
  comment?: string;
};

const REVIEW_SUBMISSION_LABELS = {
  ar: {
    formTitle: "شاركنا تجربتك",
    formDescription:
      "يمكنك إرسال تقييمك دون إنشاء حساب. لن يظهر تقييمك إلا بعد موافقة الإدارة.",
    customerName: "الاسم",
    email: "البريد الإلكتروني",
    emailHint: "خاص — لن يظهر علناً",
    phone: "رقم الهاتف",
    phoneHint: "اختياري — خاص ولن يظهر علناً",
    rating: "التقييم",
    title: "العنوان (اختياري)",
    comment: "التعليق",
    submit: "إرسال التقييم",
    submitting: "جاري الإرسال…",
    successMessage:
      "تم إرسال تقييمك بنجاح، وسيظهر بعد مراجعة الإدارة.",
    errorTitle: "تعذّر إرسال التقييم",
    errorBody: "يرجى التحقق من البيانات والمحاولة مرة أخرى.",
    formDisabled: "استقبال التقييمات غير متاح حالياً.",
    required: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صالح",
    invalidPhone: "يرجى إدخال رقم هاتف صالح",
    ratingRequired: "يرجى اختيار تقييم من 1 إلى 5",
    selectRating: "اختر تقييمك",
    ratingLabel: (value: number) => `${value} من 5`,
  },
  en: {
    formTitle: "Share your experience",
    formDescription:
      "Submit a review without creating an account. Your review will appear only after admin approval.",
    customerName: "Name",
    email: "Email",
    emailHint: "Private — never shown publicly",
    phone: "Phone number",
    phoneHint: "Optional — private and never shown publicly",
    rating: "Rating",
    title: "Title (optional)",
    comment: "Comment",
    submit: "Submit review",
    submitting: "Submitting…",
    successMessage:
      "Your review was submitted successfully and will appear after admin approval.",
    errorTitle: "Unable to submit review",
    errorBody: "Please check your details and try again.",
    formDisabled: "Review submissions are currently unavailable.",
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    ratingRequired: "Please select a rating from 1 to 5",
    selectRating: "Select your rating",
    ratingLabel: (value: number) => `${value} out of 5`,
  },
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getReviewSubmissionLabels(locale: PublicLocale) {
  return REVIEW_SUBMISSION_LABELS[locale];
}

export function isValidReviewEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidReviewPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function validateReviewSubmissionForm(
  form: ReviewSubmissionFormState,
  phoneMode: ReviewPhoneMode,
  locale: PublicLocale,
): ReviewSubmissionFormErrors {
  const labels = getReviewSubmissionLabels(locale);
  const errors: ReviewSubmissionFormErrors = {};

  if (!form.customerName.trim()) {
    errors.customerName = labels.required;
  }

  if (!form.email.trim()) {
    errors.email = labels.required;
  } else if (!isValidReviewEmail(form.email)) {
    errors.email = labels.invalidEmail;
  }

  if (phoneMode === "REQUIRED" && !form.phone.trim()) {
    errors.phone = labels.required;
  } else if (
    phoneMode !== "HIDDEN" &&
    form.phone.trim() &&
    !isValidReviewPhone(form.phone)
  ) {
    errors.phone = labels.invalidPhone;
  }

  if (!form.rating || form.rating < 1 || form.rating > 5) {
    errors.rating = labels.ratingRequired;
  }

  if (!form.comment.trim()) {
    errors.comment = labels.required;
  }

  return errors;
}

export function buildPublicReviewSubmissionPayload(
  form: ReviewSubmissionFormState,
  phoneMode: ReviewPhoneMode,
) {
  const payload: {
    customerName: string;
    email: string;
    phone?: string | null;
    rating: number;
    translations: {
      ar: {
        title: string | null;
        comment: string;
      };
      en?: {
        title: string | null;
        comment: string;
      };
    };
  } = {
    customerName: form.customerName.trim(),
    email: form.email.trim(),
    rating: form.rating!,
    translations: {
      ar: {
        title: form.title.trim() || null,
        comment: form.comment.trim(),
      },
    },
  };

  if (phoneMode !== "HIDDEN" && form.phone.trim()) {
    payload.phone = form.phone.trim();
  }

  return payload;
}

export function createDefaultReviewSubmissionForm(): ReviewSubmissionFormState {
  return {
    customerName: "",
    email: "",
    phone: "",
    rating: null,
    title: "",
    comment: "",
  };
}
