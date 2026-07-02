-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('ar', 'en');

-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CmsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "MediaUsageType" AS ENUM ('LOGO', 'FAVICON', 'HERO', 'MENU_ITEM', 'OFFER', 'GALLERY', 'MANAGER', 'REVIEW', 'OPEN_GRAPH', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PublicReviewNameMode" AS ENUM ('FULL', 'FIRST_NAME', 'SHORTENED');

-- CreateEnum
CREATE TYPE "ReviewPhoneMode" AS ENUM ('OPTIONAL', 'REQUIRED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MenuUnit" AS ENUM ('كجم', 'حبة', 'طبق', 'صغير', 'كبير');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateEnum
CREATE TYPE "SeoEntityType" AS ENUM ('PAGE', 'MENU_CATEGORY', 'MENU_ITEM', 'OFFER', 'GALLERY', 'REVIEW_PAGE', 'ABOUT', 'MANAGER', 'CONTACT');

-- CreateEnum
CREATE TYPE "StructuredDataType" AS ENUM ('RESTAURANT', 'LOCAL_BUSINESS', 'MENU', 'MENU_ITEM', 'OFFER', 'REVIEW', 'AGGREGATE_RATING', 'BREADCRUMB_LIST', 'IMAGE_OBJECT');

-- CreateEnum
CREATE TYPE "ChangeFrequency" AS ENUM ('ALWAYS', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NEVER');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "defaultLocale" "Locale" NOT NULL DEFAULT 'ar',
    "isEnglishEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Qatar',
    "currencyCode" TEXT NOT NULL DEFAULT 'QAR',
    "status" "RestaurantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_translations" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "addressText" TEXT,
    "cuisineText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "defaultPublicRoute" TEXT NOT NULL DEFAULT '/ar',
    "englishPublicRoute" TEXT NOT NULL DEFAULT '/en',
    "homepageSectionsReorderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reviewsRequireApproval" BOOLEAN NOT NULL DEFAULT true,
    "reviewPhoneMode" "ReviewPhoneMode" NOT NULL DEFAULT 'OPTIONAL',
    "publicReviewNameMode" "PublicReviewNameMode" NOT NULL DEFAULT 'SHORTENED',
    "reservationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "messagesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reviewsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_contact_settings" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "reservationPhone" TEXT,
    "publicContactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_contact_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_social_links" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_opening_hours" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_locations" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "label" TEXT,
    "googleMapsUrl" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_profiles" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "imageAssetId" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_profile_translations" (
    "id" TEXT NOT NULL,
    "managerProfileId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_profile_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "originalFilename" TEXT,
    "usageType" "MediaUsageType" NOT NULL DEFAULT 'OTHER',
    "uploadedById" TEXT,
    "status" "MediaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_translations" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_settings" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "buttonColor" TEXT,
    "headerColor" TEXT,
    "footerColor" TEXT,
    "logoAssetId" TEXT,
    "faviconAssetId" TEXT,
    "defaultOgImageAssetId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "layoutType" TEXT,
    "status" "CmsStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_translations" (
    "id" TEXT NOT NULL,
    "homepageSectionId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "buttonLabel" TEXT,
    "buttonUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_section_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "imageAssetId" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slide_translations" (
    "id" TEXT NOT NULL,
    "heroSlideId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "primaryButtonLabel" TEXT,
    "primaryButtonUrl" TEXT,
    "secondaryButtonLabel" TEXT,
    "secondaryButtonUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slide_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_menu_items" (
    "id" TEXT NOT NULL,
    "homepageSectionId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "homepage_section_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_offers" (
    "id" TEXT NOT NULL,
    "homepageSectionId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "homepage_section_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_gallery_images" (
    "id" TEXT NOT NULL,
    "homepageSectionId" TEXT NOT NULL,
    "galleryImageId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "homepage_section_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_reviews" (
    "id" TEXT NOT NULL,
    "homepageSectionId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "homepage_section_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "parentCategoryId" TEXT,
    "imageAssetId" TEXT,
    "slug" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_category_translations" (
    "id" TEXT NOT NULL,
    "menuCategoryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "menuCategoryId" TEXT NOT NULL,
    "imageAssetId" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_translations" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_price_variants" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "unit" "MenuUnit" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_price_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_price_variant_translations" (
    "id" TEXT NOT NULL,
    "priceVariantId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_price_variant_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooking_methods" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPubliclyVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooking_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooking_method_translations" (
    "id" TEXT NOT NULL,
    "cookingMethodId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooking_method_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_cooking_methods" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "cookingMethodId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_item_cooking_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "imageAssetId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_translations" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_categories" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_category_translations" (
    "id" TEXT NOT NULL,
    "galleryCategoryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "galleryCategoryId" TEXT,
    "mediaAssetId" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_image_translations" (
    "id" TEXT NOT NULL,
    "galleryImageId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "caption" TEXT,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_image_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_entries" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "entityId" TEXT,
    "routePath" TEXT NOT NULL,
    "canonicalPath" TEXT,
    "ogImageAssetId" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "structuredDataType" "StructuredDataType",
    "isSitemapIncluded" BOOLEAN NOT NULL DEFAULT true,
    "priority" DECIMAL(2,1),
    "changeFrequency" "ChangeFrequency",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_entry_translations" (
    "id" TEXT NOT NULL,
    "seoEntryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_entry_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "imageAssetId" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publicNameMode" "PublicReviewNameMode" NOT NULL DEFAULT 'SHORTENED',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneOrWhatsapp" TEXT NOT NULL,
    "email" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "reservationTime" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "handledById" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_translations_restaurantId_locale_key" ON "restaurant_translations"("restaurantId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_settings_restaurantId_key" ON "restaurant_settings"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_contact_settings_restaurantId_key" ON "restaurant_contact_settings"("restaurantId");

-- CreateIndex
CREATE INDEX "restaurant_social_links_restaurantId_isActive_sortOrder_idx" ON "restaurant_social_links"("restaurantId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "restaurant_opening_hours_restaurantId_dayOfWeek_idx" ON "restaurant_opening_hours"("restaurantId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "restaurant_locations_restaurantId_isPrimary_isActive_idx" ON "restaurant_locations"("restaurantId", "isPrimary", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "manager_profiles_restaurantId_key" ON "manager_profiles"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "manager_profile_translations_managerProfileId_locale_key" ON "manager_profile_translations"("managerProfileId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storageKey_key" ON "media_assets"("storageKey");

-- CreateIndex
CREATE INDEX "media_assets_restaurantId_status_usageType_idx" ON "media_assets"("restaurantId", "status", "usageType");

-- CreateIndex
CREATE UNIQUE INDEX "media_translations_mediaAssetId_locale_key" ON "media_translations"("mediaAssetId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "theme_settings_restaurantId_key" ON "theme_settings"("restaurantId");

-- CreateIndex
CREATE INDEX "homepage_sections_restaurantId_isVisible_sortOrder_idx" ON "homepage_sections"("restaurantId", "isVisible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_restaurantId_sectionKey_key" ON "homepage_sections"("restaurantId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_section_translations_homepageSectionId_locale_key" ON "homepage_section_translations"("homepageSectionId", "locale");

-- CreateIndex
CREATE INDEX "hero_slides_restaurantId_status_isVisible_sortOrder_idx" ON "hero_slides"("restaurantId", "status", "isVisible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "hero_slide_translations_heroSlideId_locale_key" ON "hero_slide_translations"("heroSlideId", "locale");

-- CreateIndex
CREATE INDEX "homepage_section_menu_items_homepageSectionId_sortOrder_idx" ON "homepage_section_menu_items"("homepageSectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_section_menu_items_homepageSectionId_menuItemId_key" ON "homepage_section_menu_items"("homepageSectionId", "menuItemId");

-- CreateIndex
CREATE INDEX "homepage_section_offers_homepageSectionId_sortOrder_idx" ON "homepage_section_offers"("homepageSectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_section_offers_homepageSectionId_offerId_key" ON "homepage_section_offers"("homepageSectionId", "offerId");

-- CreateIndex
CREATE INDEX "homepage_section_gallery_images_homepageSectionId_sortOrder_idx" ON "homepage_section_gallery_images"("homepageSectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_section_gallery_images_homepageSectionId_galleryIm_key" ON "homepage_section_gallery_images"("homepageSectionId", "galleryImageId");

-- CreateIndex
CREATE INDEX "homepage_section_reviews_homepageSectionId_sortOrder_idx" ON "homepage_section_reviews"("homepageSectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_section_reviews_homepageSectionId_reviewId_key" ON "homepage_section_reviews"("homepageSectionId", "reviewId");

-- CreateIndex
CREATE INDEX "menu_categories_restaurantId_status_isVisible_sortOrder_idx" ON "menu_categories"("restaurantId", "status", "isVisible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_restaurantId_slug_key" ON "menu_categories"("restaurantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "menu_category_translations_menuCategoryId_locale_key" ON "menu_category_translations"("menuCategoryId", "locale");

-- CreateIndex
CREATE INDEX "menu_items_restaurantId_menuCategoryId_status_isVisible_sor_idx" ON "menu_items"("restaurantId", "menuCategoryId", "status", "isVisible", "sortOrder");

-- CreateIndex
CREATE INDEX "menu_items_restaurantId_isFeatured_isAvailable_idx" ON "menu_items"("restaurantId", "isFeatured", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_translations_menuItemId_locale_key" ON "menu_item_translations"("menuItemId", "locale");

-- CreateIndex
CREATE INDEX "menu_item_price_variants_menuItemId_isActive_sortOrder_idx" ON "menu_item_price_variants"("menuItemId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_price_variant_translations_priceVariantId_locale_key" ON "menu_item_price_variant_translations"("priceVariantId", "locale");

-- CreateIndex
CREATE INDEX "cooking_methods_restaurantId_isEnabled_isPubliclyVisible_so_idx" ON "cooking_methods"("restaurantId", "isEnabled", "isPubliclyVisible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "cooking_method_translations_cookingMethodId_locale_key" ON "cooking_method_translations"("cookingMethodId", "locale");

-- CreateIndex
CREATE INDEX "menu_item_cooking_methods_cookingMethodId_idx" ON "menu_item_cooking_methods"("cookingMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_cooking_methods_menuItemId_cookingMethodId_key" ON "menu_item_cooking_methods"("menuItemId", "cookingMethodId");

-- CreateIndex
CREATE INDEX "offers_restaurantId_status_isActive_isFeatured_sortOrder_idx" ON "offers"("restaurantId", "status", "isActive", "isFeatured", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "offer_translations_offerId_locale_key" ON "offer_translations"("offerId", "locale");

-- CreateIndex
CREATE INDEX "gallery_categories_restaurantId_isActive_sortOrder_idx" ON "gallery_categories"("restaurantId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_categories_restaurantId_slug_key" ON "gallery_categories"("restaurantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_category_translations_galleryCategoryId_locale_key" ON "gallery_category_translations"("galleryCategoryId", "locale");

-- CreateIndex
CREATE INDEX "gallery_images_restaurantId_status_isVisible_isFeatured_sor_idx" ON "gallery_images"("restaurantId", "status", "isVisible", "isFeatured", "sortOrder");

-- CreateIndex
CREATE INDEX "gallery_images_galleryCategoryId_idx" ON "gallery_images"("galleryCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_image_translations_galleryImageId_locale_key" ON "gallery_image_translations"("galleryImageId", "locale");

-- CreateIndex
CREATE INDEX "seo_entries_restaurantId_entityType_entityId_idx" ON "seo_entries"("restaurantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "seo_entries_restaurantId_isSitemapIncluded_idx" ON "seo_entries"("restaurantId", "isSitemapIncluded");

-- CreateIndex
CREATE UNIQUE INDEX "seo_entries_restaurantId_routePath_key" ON "seo_entries"("restaurantId", "routePath");

-- CreateIndex
CREATE UNIQUE INDEX "seo_entry_translations_seoEntryId_locale_key" ON "seo_entry_translations"("seoEntryId", "locale");

-- CreateIndex
CREATE INDEX "reviews_restaurantId_status_isFeatured_createdAt_idx" ON "reviews"("restaurantId", "status", "isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "contact_messages_restaurantId_status_createdAt_idx" ON "contact_messages"("restaurantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "reservations_restaurantId_status_reservationDate_idx" ON "reservations"("restaurantId", "status", "reservationDate");

-- CreateIndex
CREATE INDEX "users_restaurantId_isActive_idx" ON "users"("restaurantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_restaurantId_email_key" ON "users"("restaurantId", "email");

-- CreateIndex
CREATE INDEX "roles_restaurantId_isSystemRole_idx" ON "roles"("restaurantId", "isSystemRole");

-- CreateIndex
CREATE UNIQUE INDEX "roles_restaurantId_name_key" ON "roles"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_group_idx" ON "permissions"("group");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionTokenHash_key" ON "user_sessions"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "user_sessions_userId_expiresAt_idx" ON "user_sessions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_restaurantId_entityType_entityId_idx" ON "audit_logs"("restaurantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_restaurantId_createdAt_idx" ON "audit_logs"("restaurantId", "createdAt");

-- AddForeignKey
ALTER TABLE "restaurant_translations" ADD CONSTRAINT "restaurant_translations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_contact_settings" ADD CONSTRAINT "restaurant_contact_settings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_social_links" ADD CONSTRAINT "restaurant_social_links_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_opening_hours" ADD CONSTRAINT "restaurant_opening_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_locations" ADD CONSTRAINT "restaurant_locations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_profiles" ADD CONSTRAINT "manager_profiles_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_profiles" ADD CONSTRAINT "manager_profiles_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_profile_translations" ADD CONSTRAINT "manager_profile_translations_managerProfileId_fkey" FOREIGN KEY ("managerProfileId") REFERENCES "manager_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_translations" ADD CONSTRAINT "media_translations_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_faviconAssetId_fkey" FOREIGN KEY ("faviconAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_defaultOgImageAssetId_fkey" FOREIGN KEY ("defaultOgImageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_translations" ADD CONSTRAINT "homepage_section_translations_homepageSectionId_fkey" FOREIGN KEY ("homepageSectionId") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slide_translations" ADD CONSTRAINT "hero_slide_translations_heroSlideId_fkey" FOREIGN KEY ("heroSlideId") REFERENCES "hero_slides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_menu_items" ADD CONSTRAINT "homepage_section_menu_items_homepageSectionId_fkey" FOREIGN KEY ("homepageSectionId") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_menu_items" ADD CONSTRAINT "homepage_section_menu_items_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_offers" ADD CONSTRAINT "homepage_section_offers_homepageSectionId_fkey" FOREIGN KEY ("homepageSectionId") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_offers" ADD CONSTRAINT "homepage_section_offers_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_gallery_images" ADD CONSTRAINT "homepage_section_gallery_images_homepageSectionId_fkey" FOREIGN KEY ("homepageSectionId") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_gallery_images" ADD CONSTRAINT "homepage_section_gallery_images_galleryImageId_fkey" FOREIGN KEY ("galleryImageId") REFERENCES "gallery_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_reviews" ADD CONSTRAINT "homepage_section_reviews_homepageSectionId_fkey" FOREIGN KEY ("homepageSectionId") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_reviews" ADD CONSTRAINT "homepage_section_reviews_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "menu_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_category_translations" ADD CONSTRAINT "menu_category_translations_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "menu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_translations" ADD CONSTRAINT "menu_item_translations_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_price_variants" ADD CONSTRAINT "menu_item_price_variants_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_price_variant_translations" ADD CONSTRAINT "menu_item_price_variant_translations_priceVariantId_fkey" FOREIGN KEY ("priceVariantId") REFERENCES "menu_item_price_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooking_methods" ADD CONSTRAINT "cooking_methods_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooking_method_translations" ADD CONSTRAINT "cooking_method_translations_cookingMethodId_fkey" FOREIGN KEY ("cookingMethodId") REFERENCES "cooking_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_cooking_methods" ADD CONSTRAINT "menu_item_cooking_methods_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_cooking_methods" ADD CONSTRAINT "menu_item_cooking_methods_cookingMethodId_fkey" FOREIGN KEY ("cookingMethodId") REFERENCES "cooking_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_translations" ADD CONSTRAINT "offer_translations_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_categories" ADD CONSTRAINT "gallery_categories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_category_translations" ADD CONSTRAINT "gallery_category_translations_galleryCategoryId_fkey" FOREIGN KEY ("galleryCategoryId") REFERENCES "gallery_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_galleryCategoryId_fkey" FOREIGN KEY ("galleryCategoryId") REFERENCES "gallery_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_image_translations" ADD CONSTRAINT "gallery_image_translations_galleryImageId_fkey" FOREIGN KEY ("galleryImageId") REFERENCES "gallery_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_entries" ADD CONSTRAINT "seo_entries_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_entries" ADD CONSTRAINT "seo_entries_ogImageAssetId_fkey" FOREIGN KEY ("ogImageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_entry_translations" ADD CONSTRAINT "seo_entry_translations_seoEntryId_fkey" FOREIGN KEY ("seoEntryId") REFERENCES "seo_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
