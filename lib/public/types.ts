export type PublicMediaAsset = {
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

export type PublicSeoTranslation = {
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  ogDescription: string | null;
};

export type PublicSeoEntry = {
  id: string;
  pageKey: string;
  entityType:
    | "PAGE"
    | "MENU_CATEGORY"
    | "MENU_ITEM"
    | "OFFER"
    | "GALLERY"
    | "REVIEW_PAGE"
    | "ABOUT"
    | "MANAGER"
    | "CONTACT";
  entityId: string | null;
  routePath: string;
  canonicalUrl: string | null;
  noIndex: boolean;
  ogImageAssetId: string | null;
  ogImage: PublicMediaAsset | null;
  translations: {
    ar: PublicSeoTranslation | null;
    en: PublicSeoTranslation | null;
  };
};

export type PublicOffer = {
  id: string;
  image: PublicMediaAsset | null;
  isFeatured: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  translations: {
    ar: {
      title: string;
      description: string | null;
      discountText: string | null;
      ctaUrl: string | null;
    } | null;
    en: {
      title: string;
      description: string | null;
      discountText: string | null;
      ctaUrl: string | null;
    } | null;
  };
};

export type PublicReview = {
  id: string;
  rating: number;
  displayedName: string;
  isFeatured: boolean;
  translations: {
    ar: {
      title: string | null;
      comment: string;
    } | null;
    en: {
      title: string | null;
      comment: string;
    } | null;
  };
  image: PublicMediaAsset | null;
  createdAt: string;
};

export type PublicHeroSlide = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle: string | null;
  primaryLabel: string | null;
  primaryHref: string | null;
};

export type PublicHomePageData = {
  offers: PublicOffer[];
  reviews: PublicReview[];
  seoEntries: PublicSeoEntry[];
};

export type PublicMenuTranslation = {
  name: string;
  description: string | null;
};

export type PublicMenuPriceVariant = {
  id: string;
  price: number;
  unit: string;
  unitLabel: {
    ar: string;
  };
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: PublicMenuTranslation | null;
    en: PublicMenuTranslation | null;
  };
};

export type PublicMenuCookingMethod = {
  id: string;
  cookingMethodId: string;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: PublicMenuTranslation | null;
    en: PublicMenuTranslation | null;
  };
};

export type PublicMenuCategory = {
  id: string;
  slug: string;
  parentCategoryId: string | null;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: PublicMenuTranslation | null;
    en: PublicMenuTranslation | null;
  };
  image: PublicMediaAsset | null;
};

export type PublicMenuItem = {
  id: string;
  menuCategoryId: string;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: PublicMenuTranslation | null;
    en: PublicMenuTranslation | null;
  };
  image: PublicMediaAsset | null;
  priceVariants: PublicMenuPriceVariant[];
  cookingMethods: PublicMenuCookingMethod[];
};

export type PublicMenuPageData = {
  categories: PublicMenuCategory[];
  items: PublicMenuItem[];
  currencyCode: string;
};

export type PublicGalleryCategoryTranslation = {
  name: string;
  description: string | null;
};

export type PublicGalleryImageTranslation = {
  caption: string | null;
  altText: string | null;
};

export type PublicGalleryCategory = {
  id: string;
  slug: string;
  sortOrder: number;
  defaultLocale: "ar";
  translations: {
    ar: PublicGalleryCategoryTranslation | null;
    en: PublicGalleryCategoryTranslation | null;
  };
  imageCount: number;
};

export type PublicGalleryImage = {
  id: string;
  galleryCategoryId: string | null;
  isFeatured: boolean;
  sortOrder: number;
  defaultLocale: "ar";
  image: PublicMediaAsset | null;
  translations: {
    ar: PublicGalleryImageTranslation | null;
    en: PublicGalleryImageTranslation | null;
  };
  galleryCategory: {
    id: string;
    slug: string;
    translations: {
      ar: { name: string; description: string | null } | null;
      en: { name: string; description: string | null } | null;
    };
  } | null;
};

export type PublicGalleryPageData = {
  categories: PublicGalleryCategory[];
  images: PublicGalleryImage[];
};
