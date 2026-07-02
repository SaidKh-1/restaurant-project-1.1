import { invalidateAdminCache } from "@/lib/admin/fetch-client";

export const ADMIN_API_CACHE = {
  dashboard: "/api/admin/dashboard-summary",
  settings: "/api/admin/restaurant-settings",
  settingsSummary: "/api/admin/restaurant-settings/summary",
  media: "/api/admin/media",
  hero: "/api/admin/hero-slides",
  homepage: "/api/admin/homepage-sections",
  theme: "/api/admin/theme",
  offers: "/api/admin/offers",
  menuItems: "/api/admin/menu-items",
  menuCategories: "/api/admin/menu-categories",
  cookingMethods: "/api/admin/cooking-methods",
  galleryCategories: "/api/admin/gallery-categories",
  galleryImages: "/api/admin/gallery-images",
  reviews: "/api/admin/reviews",
  messages: "/api/admin/messages",
  reservations: "/api/admin/reservations",
  seo: "/api/admin/seo",
} as const;

export function invalidateAdminCacheUrls(urls: readonly string[]) {
  for (const url of new Set(urls)) {
    invalidateAdminCache(url);
  }
}

export function invalidateDashboardAndSettingsCache() {
  invalidateAdminCacheUrls([
    ADMIN_API_CACHE.dashboard,
    ADMIN_API_CACHE.settings,
    ADMIN_API_CACHE.settingsSummary,
  ]);
}
