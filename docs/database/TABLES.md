# Database Tables

## Purpose

This document explains every proposed production table for the Seafood Restaurant CMS database. It is a documentation-only architecture plan for PostgreSQL and Prisma ORM. It is not a Prisma schema.

## Shared Column Standards

Most tables should include:

- `id`: primary key.
- `createdAt`: creation timestamp.
- `updatedAt`: update timestamp.
- `createdById`: optional admin user that created the record.
- `updatedById`: optional admin user that last updated the record.

Public CMS tables should also consider:

- `restaurantId`: owner restaurant.
- `status`: draft, published, archived, pending, or feature-specific state.
- `isActive`: visibility flag where simple enable or disable behavior is needed.
- `sortOrder`: display ordering.

## Platform And Restaurant Tables

### `restaurants`

Represents a CMS tenant or restaurant account. The first production record is the seafood restaurant, but keeping this table makes the platform reusable.

Important fields:

- `id`
- `slug`
- `defaultLocale`: default is `ar`.
- `isEnglishEnabled`
- `timezone`
- `currencyCode`: expected initial value can be `QAR`.
- `status`

### `restaurant_translations`

Stores locale-specific restaurant identity content.

Important fields:

- `id`
- `restaurantId`
- `locale`: `ar` or `en`.
- `name`
- `description`
- `shortDescription`
- `addressText`
- `cuisineText`

The Arabic row is required for public Arabic publishing. English is optional unless `/en` is enabled for the restaurant.

### `restaurant_settings`

Stores operational CMS settings that are not public translated copy.

Important fields:

- `id`
- `restaurantId`
- `defaultPublicRoute`: `/ar`.
- `englishPublicRoute`: `/en`.
- `homepageSectionsReorderEnabled`
- `reviewsRequireApproval`: default true.
- `reviewPhoneMode`: optional, required, or hidden.
- `publicReviewNameMode`: full name, first name, or shortened.
- `reservationsEnabled`
- `messagesEnabled`
- `reviewsEnabled`

### `restaurant_contact_settings`

Stores private and public contact configuration.

Important fields:

- `id`
- `restaurantId`
- `phone`
- `whatsappNumber`
- `email`
- `reservationPhone`
- `publicContactEnabled`
- `whatsappEnabled`

### `restaurant_social_links`

Stores social media links as editable records.

Important fields:

- `id`
- `restaurantId`
- `platform`
- `url`
- `label`
- `isActive`
- `sortOrder`

### `restaurant_opening_hours`

Stores opening hours in a queryable format.

Important fields:

- `id`
- `restaurantId`
- `dayOfWeek`
- `opensAt`
- `closesAt`
- `isClosed`
- `notes`

### `restaurant_locations`

Stores Google Maps and location data.

Important fields:

- `id`
- `restaurantId`
- `label`
- `googleMapsUrl`
- `latitude`
- `longitude`
- `isPrimary`
- `isActive`

### `manager_profiles`

Stores the reusable manager or owner profile. The manager image is referenced once and can appear on the homepage, about page, and manager section.

Important fields:

- `id`
- `restaurantId`
- `imageAssetId`
- `isVisible`
- `sortOrder`

### `manager_profile_translations`

Stores locale-specific manager profile content.

Important fields:

- `id`
- `managerProfileId`
- `locale`
- `name`
- `title`
- `bio`

## Media And Theme Tables

### `media_assets`

Central media library table for logo, favicon, hero images, menu images, gallery images, manager image, review images, and Open Graph images.

Important fields:

- `id`
- `restaurantId`
- `storageKey`
- `publicUrl`
- `mimeType`
- `fileSize`
- `width`
- `height`
- `originalFilename`
- `usageType`
- `uploadedById`
- `status`

### `media_translations`

Stores localized alt text and captions for media.

Important fields:

- `id`
- `mediaAssetId`
- `locale`
- `altText`
- `caption`

### `theme_settings`

Stores owner-managed visual settings.

Important fields:

- `id`
- `restaurantId`
- `primaryColor`
- `secondaryColor`
- `buttonColor`
- `headerColor`
- `footerColor`
- `logoAssetId`
- `faviconAssetId`
- `defaultOgImageAssetId`
- `isActive`

## Homepage And Hero Tables

### `homepage_sections`

Stores configurable homepage sections for Arabic-first public pages.

Important fields:

- `id`
- `restaurantId`
- `sectionKey`: examples include `home`, `todayMenu`, `freshFish`, `seafood`, `specialDishes`, `cookingMethods`, `offers`, `about`, `manager`, `gallery`, `reviews`, `reservation`, `contact`, `map`, `footer`.
- `isVisible`
- `sortOrder`
- `layoutType`
- `status`

### `homepage_section_translations`

Stores localized homepage section copy.

Important fields:

- `id`
- `homepageSectionId`
- `locale`
- `title`
- `subtitle`
- `description`
- `buttonLabel`
- `buttonUrl`

### `hero_slides`

Stores hero slider records.

Important fields:

- `id`
- `restaurantId`
- `imageAssetId`
- `isVisible`
- `sortOrder`
- `status`
- `startsAt`
- `endsAt`

### `hero_slide_translations`

Stores localized hero slide content.

Important fields:

- `id`
- `heroSlideId`
- `locale`
- `title`
- `subtitle`
- `primaryButtonLabel`
- `primaryButtonUrl`
- `secondaryButtonLabel`
- `secondaryButtonUrl`

### `homepage_section_menu_items`

Join table for menu items featured inside homepage sections.

Important fields:

- `id`
- `homepageSectionId`
- `menuItemId`
- `sortOrder`

### `homepage_section_offers`

Join table for offers featured inside homepage sections.

Important fields:

- `id`
- `homepageSectionId`
- `offerId`
- `sortOrder`

### `homepage_section_gallery_images`

Join table for gallery images featured inside homepage sections.

Important fields:

- `id`
- `homepageSectionId`
- `galleryImageId`
- `sortOrder`

### `homepage_section_reviews`

Join table for approved reviews featured inside homepage sections.

Important fields:

- `id`
- `homepageSectionId`
- `reviewId`
- `sortOrder`

## Seafood Menu Tables

### `menu_categories`

Stores seafood categories and future restaurant category types.

Important fields:

- `id`
- `restaurantId`
- `parentCategoryId`
- `imageAssetId`
- `slug`
- `isVisible`
- `sortOrder`
- `status`

Default seed candidates:

- الأسماك الطازجة
- المأكولات البحرية
- الأطباق الخاصة
- طرق الطهي
- خدمات المطعم

### `menu_category_translations`

Stores localized category content.

Important fields:

- `id`
- `menuCategoryId`
- `locale`
- `name`
- `description`
- `slug`

### `menu_items`

Stores menu items such as بوري مصري, بلطي مصري, روبيان كبير, شوربة سي فود, and طواجن بحرية.

Important fields:

- `id`
- `restaurantId`
- `menuCategoryId`
- `imageAssetId`
- `isAvailable`
- `isFeatured`
- `isVisible`
- `sortOrder`
- `status`

### `menu_item_translations`

Stores localized menu item content.

Important fields:

- `id`
- `menuItemId`
- `locale`
- `name`
- `description`
- `slug`

### `menu_item_price_variants`

Stores multiple prices for a single menu item.

Important fields:

- `id`
- `menuItemId`
- `price`
- `unit`: كجم، حبة، طبق، صغير، كبير.
- `isActive`
- `sortOrder`

### `menu_item_price_variant_translations`

Stores localized variant names such as مقلي أو مشوي, مدخن, عادي, مع البطاطس, صغير, or كبير.

Important fields:

- `id`
- `priceVariantId`
- `locale`
- `name`

### `cooking_methods`

Stores dynamic cooking methods.

Important fields:

- `id`
- `restaurantId`
- `isEnabled`
- `isPubliclyVisible`
- `sortOrder`

Default seed candidates:

- مقلي
- مشوي
- سنجاري
- مدخن
- فرن

### `cooking_method_translations`

Stores localized cooking method names.

Important fields:

- `id`
- `cookingMethodId`
- `locale`
- `name`
- `description`

### `menu_item_cooking_methods`

Join table assigning cooking methods to menu items.

Important fields:

- `id`
- `menuItemId`
- `cookingMethodId`
- `sortOrder`

## Offers And Gallery Tables

### `offers`

Stores promotions, discounts, daily deals, and seasonal seafood specials.

Important fields:

- `id`
- `restaurantId`
- `imageAssetId`
- `startsAt`
- `endsAt`
- `isActive`
- `isFeatured`
- `sortOrder`
- `status`

### `offer_translations`

Stores localized offer content.

Important fields:

- `id`
- `offerId`
- `locale`
- `title`
- `description`
- `ctaLabel`
- `ctaUrl`

### `gallery_categories`

Stores configurable gallery categories.

Important fields:

- `id`
- `restaurantId`
- `slug`
- `isActive`
- `sortOrder`

### `gallery_category_translations`

Stores localized gallery category content.

Important fields:

- `id`
- `galleryCategoryId`
- `locale`
- `name`
- `description`

### `gallery_images`

Stores gallery image records that reference the media library.

Important fields:

- `id`
- `restaurantId`
- `galleryCategoryId`
- `mediaAssetId`
- `isFeatured`
- `isVisible`
- `sortOrder`
- `status`

### `gallery_image_translations`

Stores localized gallery image captions and optional display copy.

Important fields:

- `id`
- `galleryImageId`
- `locale`
- `caption`
- `altText`

## SEO Tables

### `seo_entries`

Stores SEO records for public pages and content entities.

Important fields:

- `id`
- `restaurantId`
- `entityType`: page, menuCategory, menuItem, offer, gallery, reviewPage, about, manager, contact.
- `entityId`: nullable for static pages.
- `routePath`
- `canonicalPath`
- `ogImageAssetId`
- `robotsIndex`
- `robotsFollow`
- `structuredDataType`
- `isSitemapIncluded`
- `priority`
- `changeFrequency`

### `seo_entry_translations`

Stores localized SEO metadata.

Important fields:

- `id`
- `seoEntryId`
- `locale`
- `seoTitle`
- `seoDescription`
- `ogTitle`
- `ogDescription`

Arabic SEO rows are primary. English rows support `/en`.

## Customer Operation Tables

### `reviews`

Stores customer reviews submitted without accounts.

Important fields:

- `id`
- `restaurantId`
- `customerName`
- `email`
- `phone`
- `rating`
- `title`
- `comment`
- `imageAssetId`
- `status`: pending, approved, rejected, archived, deleted.
- `isFeatured`
- `publicNameMode`: full, firstName, shortened.
- `approvedById`
- `approvedAt`

Email and phone are private and must never be returned to public pages.

### `contact_messages`

Stores messages from تواصل معنا.

Important fields:

- `id`
- `restaurantId`
- `name`
- `phoneOrWhatsapp`
- `email`
- `subject`
- `message`
- `status`: new, read, archived, deleted.
- `readAt`
- `archivedAt`

Phone and email are private and visible only to admin.

### `reservations`

Stores table reservation requests submitted without customer accounts.

Important fields:

- `id`
- `restaurantId`
- `name`
- `phone`
- `email`
- `reservationDate`
- `reservationTime`
- `guests`
- `notes`
- `status`: pending, accepted, rejected, cancelled.
- `handledById`
- `handledAt`

Reservation data is private operational data.

## Users, Roles, And Permissions Tables

### `users`

Stores admin users.

Important fields:

- `id`
- `restaurantId`
- `name`
- `email`
- `passwordHash`
- `isActive`
- `lastLoginAt`

### `roles`

Stores reusable role definitions.

Important fields:

- `id`
- `restaurantId`
- `name`
- `description`
- `isSystemRole`

Suggested roles: owner, manager, staff, content editor.

### `permissions`

Stores individual permission definitions.

Important fields:

- `id`
- `key`
- `description`
- `group`

Suggested groups: dashboard, menu, cookingMethods, offers, reservations, messages, reviews, gallery, managerProfile, theme, seo, settings, users.

### `user_roles`

Join table assigning roles to users.

Important fields:

- `id`
- `userId`
- `roleId`

### `role_permissions`

Join table assigning permissions to roles.

Important fields:

- `id`
- `roleId`
- `permissionId`

### `user_sessions`

Stores active admin sessions if the authentication strategy needs database-backed sessions.

Important fields:

- `id`
- `userId`
- `sessionTokenHash`
- `expiresAt`
- `ipAddress`
- `userAgent`
- `revokedAt`

### `audit_logs`

Stores sensitive admin actions.

Important fields:

- `id`
- `restaurantId`
- `userId`
- `action`
- `entityType`
- `entityId`
- `metadata`
- `ipAddress`
- `createdAt`

Use this for changes such as approving reviews, deleting records, changing permissions, updating theme, and modifying SEO settings.
