import type { RestaurantSettingsData } from "@/lib/admin/types";

export type ManagerSocialLinkForm = {
  platform: string;
  url: string;
  label: string;
  isActive: boolean;
};

export type ManagerProfileFormState = {
  nameAr: string;
  titleAr: string;
  bioAr: string;
  nameEn: string;
  titleEn: string;
  bioEn: string;
  imageAssetId: string | null;
  isVisible: boolean;
  phone: string;
  whatsappNumber: string;
  email: string;
  whatsappEnabled: boolean;
  socialMediaLinks: ManagerSocialLinkForm[];
};

export type ManagerProfileFormErrors = {
  nameAr?: string;
  titleAr?: string;
  bioAr?: string;
  email?: string;
  socialLinks?: string;
};

export function createDefaultManagerProfileForm(): ManagerProfileFormState {
  return {
    nameAr: "",
    titleAr: "",
    bioAr: "",
    nameEn: "",
    titleEn: "",
    bioEn: "",
    imageAssetId: null,
    isVisible: true,
    phone: "",
    whatsappNumber: "",
    email: "",
    whatsappEnabled: true,
    socialMediaLinks: [],
  };
}

export function mapSettingsToManagerForm(
  data: RestaurantSettingsData,
): ManagerProfileFormState {
  return {
    nameAr: data.managerProfile?.translations.ar?.name ?? "",
    titleAr: data.managerProfile?.translations.ar?.title ?? "",
    bioAr: data.managerProfile?.translations.ar?.bio ?? "",
    nameEn: data.managerProfile?.translations.en?.name ?? "",
    titleEn: data.managerProfile?.translations.en?.title ?? "",
    bioEn: data.managerProfile?.translations.en?.bio ?? "",
    imageAssetId: data.managerProfile?.image?.id ?? null,
    isVisible: data.managerProfile?.isVisible ?? true,
    phone: data.contactInformation?.phone ?? "",
    whatsappNumber: data.contactInformation?.whatsappNumber ?? "",
    email: data.contactInformation?.email ?? "",
    whatsappEnabled: data.contactInformation?.whatsappEnabled ?? true,
    socialMediaLinks: data.socialMediaLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      label: link.label ?? "",
      isActive: link.isActive,
    })),
  };
}

export function validateManagerProfileForm(
  form: ManagerProfileFormState,
): ManagerProfileFormErrors {
  const errors: ManagerProfileFormErrors = {};

  if (!form.nameAr.trim()) {
    errors.nameAr = "الاسم بالعربية مطلوب.";
  }

  if (!form.titleAr.trim()) {
    errors.titleAr = "المسمى بالعربية مطلوب.";
  }

  if (!form.bioAr.trim()) {
    errors.bioAr = "النبذة بالعربية مطلوبة.";
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "يرجى إدخال بريد إلكتروني صالح.";
  }

  const invalidSocialLink = form.socialMediaLinks.find(
    (link) =>
      (link.platform.trim() || link.url.trim()) &&
      (!link.platform.trim() || !link.url.trim()),
  );

  if (invalidSocialLink) {
    errors.socialLinks = "أكمل المنصة والرابط لكل حساب اجتماعي.";
  }

  return errors;
}

export function buildManagerProfileSettingsPayload(
  form: ManagerProfileFormState,
) {
  const payload: {
    managerProfile: {
      imageAssetId: string | null;
      isVisible: boolean;
      translations: {
        ar: {
          name: string;
          title: string;
          bio: string;
        };
        en?: {
          name: string;
          title: string | null;
          bio: string | null;
        };
      };
    };
    contactInformation: {
      phone: string | null;
      whatsappNumber: string | null;
      email: string | null;
      whatsappEnabled: boolean;
    };
    socialMediaLinks: {
      platform: string;
      url: string;
      label: string | null;
      isActive: boolean;
      sortOrder: number;
    }[];
  } = {
    managerProfile: {
      imageAssetId: form.imageAssetId,
      isVisible: form.isVisible,
      translations: {
        ar: {
          name: form.nameAr.trim(),
          title: form.titleAr.trim(),
          bio: form.bioAr.trim(),
        },
      },
    },
    contactInformation: {
      phone: form.phone.trim() || null,
      whatsappNumber: form.whatsappNumber.trim() || null,
      email: form.email.trim() || null,
      whatsappEnabled: form.whatsappEnabled,
    },
    socialMediaLinks: form.socialMediaLinks
      .filter((link) => link.platform.trim() && link.url.trim())
      .map((link, index) => ({
        platform: link.platform.trim(),
        url: link.url.trim(),
        label: link.label.trim() || null,
        isActive: link.isActive,
        sortOrder: index,
      })),
  };

  if (form.nameEn.trim()) {
    payload.managerProfile.translations.en = {
      name: form.nameEn.trim(),
      title: form.titleEn.trim() || null,
      bio: form.bioEn.trim() || null,
    };
  }

  return payload;
}

export function isManagerScopeSettingsPayload(input: {
  managerProfile?: unknown;
  socialMediaLinks?: unknown;
  contactInformation?: unknown;
  [key: string]: unknown;
}) {
  const keys = Object.keys(input);
  const allowedKeys = new Set([
    "managerProfile",
    "socialMediaLinks",
    "contactInformation",
  ]);

  return keys.length > 0 && keys.every((key) => allowedKeys.has(key));
}
