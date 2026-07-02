import type {
  PublicManagerProfile,
  PublicSiteShell,
  PublicSocialLink,
} from "@/lib/api/public-site-shell";
import type { PublicLocale } from "@/lib/public/locale";

export type ResolvedPublicManagerProfile = {
  name: string;
  title: string | null;
  bio: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type PublicManagerContactLinks = {
  phone: string | null;
  email: string | null;
  whatsappHref: string | null;
  whatsappNumber: string | null;
  socialLinks: PublicSocialLink[];
};

const MANAGER_SECTION_LABELS = {
  ar: {
    subtitle: "مدير المطعم",
    pageTitle: "مدير المطعم",
    pageSubtitle: "تعرّف على مدير المطعم",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    whatsapp: "واتساب",
    social: "حسابات التواصل",
    hiddenPreview: "الملف مخفي عن الزوار",
    unavailableTitle: "الملف غير متاح حالياً",
    unavailableBody:
      "صفحة مدير المطعم غير متاحة للعرض حالياً. يمكنك العودة إلى الصفحة الرئيسية أو التواصل معنا.",
    backHome: "العودة للرئيسية",
    contactUs: "تواصل معنا",
  },
  en: {
    subtitle: "Restaurant manager",
    pageTitle: "Restaurant manager",
    pageSubtitle: "Meet our restaurant manager",
    phone: "Phone",
    email: "Email",
    whatsapp: "WhatsApp",
    social: "Social links",
    hiddenPreview: "Profile hidden from visitors",
    unavailableTitle: "Profile not available",
    unavailableBody:
      "The manager profile is not available right now. You can return to the homepage or contact us.",
    backHome: "Back to home",
    contactUs: "Contact us",
  },
} as const;

export function getManagerPageLabels(locale: PublicLocale) {
  return MANAGER_SECTION_LABELS[locale];
}

export function getManagerSectionLabels(locale: PublicLocale) {
  return MANAGER_SECTION_LABELS[locale];
}

export function isManagerProfilePubliclyAvailable(
  profile: PublicManagerProfile | null,
  locale: PublicLocale,
) {
  return shouldRenderManagerProfileSection(profile, locale);
}

export function resolvePublicManagerProfile(
  locale: PublicLocale,
  profile: PublicManagerProfile | null,
): ResolvedPublicManagerProfile | null {
  if (!profile) {
    return null;
  }

  const translation =
    locale === "en"
      ? (profile.translations.en ?? profile.translations.ar)
      : (profile.translations.ar ?? profile.translations.en);

  if (!translation?.name?.trim()) {
    return null;
  }

  const imageAlt =
    locale === "en"
      ? (profile.image?.altText.en ??
        profile.image?.altText.ar ??
        translation.name)
      : (profile.image?.altText.ar ??
        profile.image?.altText.en ??
        translation.name);

  return {
    name: translation.name.trim(),
    title: translation.title?.trim() || null,
    bio: translation.bio?.trim() || null,
    imageUrl: profile.image?.publicUrl ?? null,
    imageAlt,
  };
}

export function getPublicManagerContactLinks(
  shell: Pick<
    PublicSiteShell,
    "contact" | "whatsapp" | "socialLinks"
  >,
): PublicManagerContactLinks {
  return {
    phone: shell.contact.phone,
    email: shell.contact.email,
    whatsappHref: shell.whatsapp.enabled ? shell.whatsapp.href : null,
    whatsappNumber: shell.whatsapp.enabled ? shell.whatsapp.number : null,
    socialLinks: shell.socialLinks,
  };
}

export function shouldRenderManagerProfileSection(
  profile: PublicManagerProfile | null,
  locale: PublicLocale,
) {
  if (!profile?.isVisible) {
    return false;
  }

  return Boolean(resolvePublicManagerProfile(locale, profile));
}
