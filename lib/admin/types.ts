export type HeroSlideTranslation = {
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  secondaryButtonText: string | null;
  secondaryButtonLink: string | null;
};

export type HeroSlideData = {
  id: string;
  imageAssetId: string | null;
  image: MediaAssetSummary | null;
  isVisible: boolean;
  isActive: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  startsAt: string | null;
  endsAt: string | null;
  defaultLocale: "ar";
  translations: {
    ar: HeroSlideTranslation | null;
    en: HeroSlideTranslation | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type MenuCategoryData = {
  id: string;
  slug: string;
  parentCategoryId: string | null;
  isVisible: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  defaultLocale: "ar";
  translations: {
    ar: {
      name: string;
      description: string | null;
      slug: string;
    } | null;
    en: {
      name: string;
      description: string | null;
      slug: string;
    } | null;
  };
  image: MediaAssetSummary | null;
  menuItemCount: number;
  childCategoryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MenuPriceVariantData = {
  id: string;
  price: number;
  unit: string;
  unitLabel: { ar: string };
  isActive: boolean;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: { name: string; description?: string | null; slug?: string } | null;
    en: { name: string; description?: string | null; slug?: string } | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type CookingMethodData = {
  id: string;
  isEnabled: boolean;
  isPubliclyVisible: boolean;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: { name: string; description: string | null } | null;
    en: { name: string; description: string | null } | null;
  };
  menuItemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MenuItemData = {
  id: string;
  menuCategoryId: string;
  menuCategory: {
    id: string;
    slug: string;
    translations: {
      ar: { name: string } | null;
      en: { name: string } | null;
    };
  };
  isAvailable: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  defaultLocale: "ar";
  translations: {
    ar: {
      name: string;
      description: string | null;
      slug?: string;
    } | null;
    en: {
      name: string;
      description: string | null;
      slug?: string;
    } | null;
  };
  image: MediaAssetSummary | null;
  priceVariants: MenuPriceVariantData[];
  cookingMethods: {
    id: string;
    cookingMethodId: string;
    sortOrder: number;
    defaultLocale: "ar";
    translations: {
      ar: { name: string } | null;
      en: { name: string } | null;
    };
  }[];
  homepageSectionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GalleryCategoryData = {
  id: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: { name: string; description: string | null } | null;
    en: { name: string; description: string | null } | null;
  };
  imageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GalleryImageData = {
  id: string;
  galleryCategoryId: string | null;
  galleryCategory: {
    id: string;
    slug: string;
    isActive: boolean;
    translations: {
      ar: { name: string } | null;
      en: { name: string } | null;
    };
  } | null;
  mediaAssetId: string;
  mediaAsset: MediaAssetSummary | null;
  isFeatured: boolean;
  isVisible: boolean;
  isActive: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  defaultLocale: "ar";
  translations: {
    ar: { altText: string; caption: string | null } | null;
    en: { altText: string; caption: string | null } | null;
  };
  homepageSectionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OfferTranslationData = {
  title: string;
  description: string | null;
  discountText: string | null;
  ctaUrl: string | null;
};

export type OfferData = {
  id: string;
  imageAssetId: string | null;
  image: MediaAssetSummary | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  defaultLocale: "ar";
  translations: {
    ar: OfferTranslationData | null;
    en: OfferTranslationData | null;
  };
  homepageSectionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ReviewTranslationData = {
  title: string | null;
  comment: string;
};

export type ReviewData = {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  rating: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED" | "DELETED";
  isFeatured: boolean;
  publicNameMode: "FULL" | "FIRST_NAME" | "SHORTENED";
  defaultLocale: "ar";
  translations: {
    ar: ReviewTranslationData | null;
    en: ReviewTranslationData | null;
  };
  imageAssetId: string | null;
  image: MediaAssetSummary | null;
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  approvedAt: string | null;
  homepageSectionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageData = {
  id: string;
  name: string;
  phoneOrWhatsapp: string;
  email: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED" | "DELETED";
  isRead: boolean;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HomepageSectionTranslation = {
  title: string | null;
  subtitle: string | null;
};

export type HomepageSectionData = {
  id: string;
  sectionKey: string;
  isVisible: boolean;
  sortOrder: number;
  layoutType: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  defaultLocale: "ar";
  translations: {
    ar: HomepageSectionTranslation | null;
    en: HomepageSectionTranslation | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type ThemeSettingsData = {
  id: string;
  isActive: boolean;
  activePresetKey:
    | "ocean-blue"
    | "navy-dark"
    | "emerald"
    | "sunset"
    | "luxury-dark"
    | "golden"
    | "ramadan"
    | "eid-al-fitr"
    | "eid-al-adha"
    | "custom"
    | null;
  colors: {
    primaryColor: string | null;
    secondaryColor: string | null;
    buttonColor: string | null;
    headerColor: string | null;
    footerColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
  };
  coverImage: MediaAssetSummary | null;
  logo: MediaAssetSummary | null;
  favicon: MediaAssetSummary | null;
  seasonalGreeting: {
    ar: string | null;
    en: string | null;
  };
  restaurantName: {
    ar: string | null;
    en: string | null;
  };
  updatedAt: string;
};

export type ReservationData = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  notes: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  workflowStatus:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "archived";
  handledBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SeoEntityType =
  | "PAGE"
  | "MENU_CATEGORY"
  | "MENU_ITEM"
  | "OFFER"
  | "GALLERY"
  | "REVIEW_PAGE"
  | "ABOUT"
  | "MANAGER"
  | "CONTACT";

export type SeoTranslationData = {
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  ogDescription: string | null;
};

export type SeoEntryData = {
  id: string;
  pageKey: string;
  entityType: SeoEntityType;
  entityId: string | null;
  routePath: string;
  canonicalUrl: string | null;
  noIndex: boolean;
  robotsFollow: boolean;
  isSitemapIncluded: boolean;
  ogImageAssetId: string | null;
  ogImage: MediaAssetSummary | null;
  defaultLocale: "ar";
  translations: {
    ar: SeoTranslationData | null;
    en: SeoTranslationData | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type MediaUsageSummary = {
  total: number;
  managerProfiles: number;
  themeLogo: number;
  themeCoverImage: number;
  themeFavicon: number;
  themeDefaultOgImage: number;
  heroSlides: number;
  menuCategories: number;
  menuItems: number;
  offers: number;
  galleryImages: number;
  reviews: number;
  seoEntries: number;
};

export type MediaLibraryAsset = {
  id: string;
  storageKey: string;
  publicUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  originalFilename: string | null;
  usageType: string;
  status: "ACTIVE" | "ARCHIVED";
  defaultLocale: "ar";
  translations: {
    ar: {
      altText: string | null;
      caption: string | null;
    } | null;
    en: {
      altText: string | null;
      caption: string | null;
    } | null;
  };
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  usage: MediaUsageSummary;
  isInUse: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MediaAssetSummary = {
  id: string;
  publicUrl: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: {
    ar: string | null;
    en: string | null;
  };
  caption: {
    ar: string | null;
    en: string | null;
  };
};

export type RestaurantSettingsSummaryData = {
  id: string;
  restaurantName: {
    ar: string | null;
    en: string | null;
  };
  contactInformation: {
    phone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    reservationPhone: string | null;
    publicContactEnabled: boolean;
    whatsappEnabled: boolean;
  } | null;
};

export type DashboardSummaryData = {
  restaurantName: {
    ar: string | null;
    en: string | null;
  };
  stats: {
    newMessages: number;
    pendingReviews: number;
    offers: number;
    menuItems: number;
  };
};

export type RestaurantSettingsData = {
  id: string;
  slug: string;
  restaurantName: {
    ar: string | null;
    en: string | null;
  };
  defaultLanguage: "ar";
  secondaryLanguage: "en";
  isEnglishEnabled: boolean;
  defaultLocale: "ar";
  settings: {
    defaultPublicRoute: string;
    englishPublicRoute: string;
    reviewsRequireApproval: boolean;
    reservationsEnabled: boolean;
    messagesEnabled: boolean;
    reviewsEnabled: boolean;
  } | null;
  logo: MediaAssetSummary | null;
  coverImage: MediaAssetSummary | null;
  managerProfile: {
    id: string;
    isVisible: boolean;
    sortOrder: number;
    image: MediaAssetSummary | null;
    translations: {
      ar: {
        name: string;
        title: string | null;
        bio: string | null;
      } | null;
      en: {
        name: string;
        title: string | null;
        bio: string | null;
      } | null;
    };
  } | null;
  contactInformation: {
    phone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    reservationPhone: string | null;
    publicContactEnabled: boolean;
    whatsappEnabled: boolean;
  } | null;
  whatsapp: {
    number: string | null;
    enabled: boolean;
  };
  openingHours: {
    id: string;
    dayOfWeek: DayOfWeek;
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
    notes: string | null;
  }[];
  socialMediaLinks: {
    id: string;
    platform: string;
    url: string;
    label: string | null;
    isActive: boolean;
    sortOrder: number;
  }[];
  googleMapsLocation: {
    id: string;
    label: string | null;
    googleMapsUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    isPrimary: boolean;
    isActive: boolean;
  } | null;
  themeColors: {
    primaryColor: string | null;
    secondaryColor: string | null;
    buttonColor: string | null;
    headerColor: string | null;
    footerColor: string | null;
  } | null;
  updatedAt: string;
};

export type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "SATURDAY", label: "السبت" },
  { value: "SUNDAY", label: "الأحد" },
  { value: "MONDAY", label: "الإثنين" },
  { value: "TUESDAY", label: "الثلاثاء" },
  { value: "WEDNESDAY", label: "الأربعاء" },
  { value: "THURSDAY", label: "الخميس" },
  { value: "FRIDAY", label: "الجمعة" },
];

export type ApiResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: {
    message: string;
    details?: unknown;
  };
};

export type AdminSessionUser = {
  name: string;
  email: string;
  image?: string | null;
};

export type AdminShellProps = {
  user: AdminSessionUser;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
};
