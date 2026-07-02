# Database Relations

## Purpose

This document explains the relationships between every proposed production table for the Seafood Restaurant CMS. It is written for a normalized PostgreSQL database mapped through Prisma ORM, but it does not define Prisma schema code.

## Relation Standards

- One-to-one relations should use a unique foreign key.
- One-to-many relations should store the foreign key on the child table.
- Many-to-many relations should use explicit join tables.
- Public CMS tables should usually include `restaurantId` to keep the platform reusable and tenant-safe.
- Translation tables should enforce uniqueness on parent ID plus locale.

## Platform And Restaurant Relations

### `restaurants` to `restaurant_translations`

Cardinality: one restaurant has many translations.

Each restaurant should have one Arabic translation and may have one English translation. This relation stores public restaurant name, description, address text, and cuisine text by locale.

### `restaurants` to `restaurant_settings`

Cardinality: one restaurant has one settings record.

This relation stores default locale, route behavior, review approval policy, homepage behavior, and enabled customer workflows.

### `restaurants` to `restaurant_contact_settings`

Cardinality: one restaurant has one contact settings record.

This relation stores phone, WhatsApp, reservation phone, and email settings used by public contact sections and admin workflows.

### `restaurants` to `restaurant_social_links`

Cardinality: one restaurant has many social links.

Each social link belongs to exactly one restaurant and can be independently ordered, enabled, or disabled.

### `restaurants` to `restaurant_opening_hours`

Cardinality: one restaurant has many opening hour records.

Each record represents a day or schedule entry. This supports local SEO and public opening-hours display.

### `restaurants` to `restaurant_locations`

Cardinality: one restaurant has many locations.

The first implementation may use one primary location. The relation allows future multi-location support without changing the core model.

### `restaurants` to `manager_profiles`

Cardinality: one restaurant has one manager profile for the first implementation.

The manager profile is reused by homepage, about page, and manager section. Updating the manager image or content updates all public placements that read from this profile.

### `manager_profiles` to `manager_profile_translations`

Cardinality: one manager profile has many translations.

Arabic content is primary. English content supports `/en`.

## Media And Theme Relations

### `restaurants` to `media_assets`

Cardinality: one restaurant has many media assets.

All uploaded images belong to a restaurant. This prevents media leakage across future restaurants.

### `media_assets` to `media_translations`

Cardinality: one media asset has many translations.

Localized alt text and captions are stored separately for Arabic and English.

### `restaurants` to `theme_settings`

Cardinality: one restaurant has one active theme settings record.

Theme settings control primary color, secondary color, button color, header color, footer color, logo, favicon, and default Open Graph image.

### `theme_settings` to `media_assets`

Cardinality: many theme settings can reference media assets, but each reference points to one asset.

Important references:

- `logoAssetId` references `media_assets`.
- `faviconAssetId` references `media_assets`.
- `defaultOgImageAssetId` references `media_assets`.

## Homepage And Hero Relations

### `restaurants` to `homepage_sections`

Cardinality: one restaurant has many homepage sections.

Sections represent الرئيسية, منيو اليوم, الأسماك الطازجة, المأكولات البحرية, الأطباق الخاصة, طرق الطهي, العروض, عن المطعم, مدير المطعم, معرض الصور, التقييمات, الحجز, تواصل معنا, الخريطة, and الفوتر.

### `homepage_sections` to `homepage_section_translations`

Cardinality: one homepage section has many translations.

This stores Arabic and English section titles, descriptions, and button labels.

### `restaurants` to `hero_slides`

Cardinality: one restaurant has many hero slides.

Hero slides are ordered and visible through the homepage hero slider.

### `hero_slides` to `hero_slide_translations`

Cardinality: one hero slide has many translations.

This relation stores Arabic and English hero title, subtitle, and button copy.

### `hero_slides` to `media_assets`

Cardinality: many hero slides can reference one media asset; each slide references one image.

This keeps hero images editable through the media library.

### `homepage_sections` to `menu_items`

Cardinality: many-to-many through `homepage_section_menu_items`.

This relation supports featured menu items on the homepage without duplicating menu data.

### `homepage_sections` to `offers`

Cardinality: many-to-many through `homepage_section_offers`.

This relation supports featured offers inside homepage sections.

### `homepage_sections` to `gallery_images`

Cardinality: many-to-many through `homepage_section_gallery_images`.

This relation supports homepage gallery highlights.

### `homepage_sections` to `reviews`

Cardinality: many-to-many through `homepage_section_reviews`.

This relation supports featured approved reviews on the homepage. Only approved reviews should be selected for public display.

## Seafood Menu Relations

### `restaurants` to `menu_categories`

Cardinality: one restaurant has many menu categories.

Default categories for the first implementation are الأسماك الطازجة, المأكولات البحرية, الأطباق الخاصة, طرق الطهي, and خدمات المطعم.

### `menu_categories` to `menu_category_translations`

Cardinality: one category has many translations.

This relation stores Arabic and English category names, descriptions, and slugs.

### `menu_categories` to `menu_categories`

Cardinality: one category can have many child categories.

`parentCategoryId` supports nested categories if needed later. It can remain null for the first seafood category set.

### `menu_categories` to `menu_items`

Cardinality: one category has many menu items.

Each menu item belongs to one primary category.

### `menu_items` to `menu_item_translations`

Cardinality: one menu item has many translations.

This relation stores Arabic and English item names, descriptions, and slugs.

### `menu_items` to `media_assets`

Cardinality: many menu items can reference one media asset; each item can reference one primary image.

This supports menu item images from the media library.

### `menu_items` to `menu_item_price_variants`

Cardinality: one menu item has many price variants.

This relation supports examples such as بلطي مصري with مقلي أو مشوي and مدخن variants, or طواجن بحرية with صغير and كبير variants.

### `menu_item_price_variants` to `menu_item_price_variant_translations`

Cardinality: one price variant has many translations.

This stores localized variant names while price and unit remain on the base variant record.

### `restaurants` to `cooking_methods`

Cardinality: one restaurant has many cooking methods.

Default methods are مقلي, مشوي, سنجاري, مدخن, and فرن. Admin can add, edit, delete, enable, or disable them.

### `cooking_methods` to `cooking_method_translations`

Cardinality: one cooking method has many translations.

This stores Arabic and English cooking method names and descriptions.

### `menu_items` to `cooking_methods`

Cardinality: many-to-many through `menu_item_cooking_methods`.

This relation allows one menu item to support multiple cooking methods and one cooking method to apply to many items.

## Offers And Gallery Relations

### `restaurants` to `offers`

Cardinality: one restaurant has many offers.

Offers can be active, featured, scheduled, archived, or expired.

### `offers` to `offer_translations`

Cardinality: one offer has many translations.

This stores Arabic and English offer title, description, and call-to-action text.

### `offers` to `media_assets`

Cardinality: many offers can reference one media asset; each offer can reference one primary image.

This supports offer images and Open Graph reuse.

### `restaurants` to `gallery_categories`

Cardinality: one restaurant has many gallery categories.

Gallery categories such as الأسماك الطازجة, المأكولات البحرية, الأطباق الخاصة, المطعم, and الفعاليات are editable records.

### `gallery_categories` to `gallery_category_translations`

Cardinality: one gallery category has many translations.

This stores Arabic and English category names and descriptions.

### `gallery_categories` to `gallery_images`

Cardinality: one gallery category has many gallery images.

Each gallery image can belong to one category in the initial normalized model.

### `gallery_images` to `gallery_image_translations`

Cardinality: one gallery image has many translations.

This stores Arabic and English captions and alt text.

### `gallery_images` to `media_assets`

Cardinality: many gallery images can reference one media asset; each gallery image references one asset.

This lets gallery records add CMS display behavior around reusable media.

## SEO Relations

### `restaurants` to `seo_entries`

Cardinality: one restaurant has many SEO entries.

Each SEO entry belongs to a restaurant and describes either a public page or a public entity.

### `seo_entries` to `seo_entry_translations`

Cardinality: one SEO entry has many translations.

Arabic SEO is primary. English SEO supports `/en`.

### `seo_entries` to `media_assets`

Cardinality: many SEO entries can reference one Open Graph media asset.

This supports page-specific and entity-specific Open Graph images.

### `seo_entries` to public entities

Cardinality: one SEO entry can describe one public page or one public content entity.

For static pages, `entityType` and `routePath` identify the page. For content entities, `entityType` and `entityId` identify records such as menu categories, menu items, offers, gallery pages, about page, manager section, contact page, or reviews page.

Because generic polymorphic foreign keys are not enforced by PostgreSQL, implementation should either validate this relation at the application layer or split SEO into explicit entity-specific relations if stronger database enforcement is required.

## Customer Operation Relations

### `restaurants` to `reviews`

Cardinality: one restaurant receives many reviews.

Reviews are submitted without customer accounts. Public pages may only read approved reviews. Private email and phone fields remain admin-only.

### `reviews` to `media_assets`

Cardinality: many reviews can reference one media asset; each review can optionally reference one uploaded image.

Review image display requires moderation.

### `reviews` to `users`

Cardinality: many reviews can be approved by one admin user.

`approvedById` references `users` and records moderation accountability.

### `restaurants` to `contact_messages`

Cardinality: one restaurant receives many contact messages.

Messages are private admin records submitted from تواصل معنا.

### `restaurants` to `reservations`

Cardinality: one restaurant receives many reservations.

Reservations are private operational records submitted without customer accounts.

### `reservations` to `users`

Cardinality: many reservations can be handled by one admin user.

`handledById` references the admin that accepted, rejected, edited, or otherwise handled the request.

## Users, Roles, And Permissions Relations

### `restaurants` to `users`

Cardinality: one restaurant has many admin users.

Users belong to a restaurant so future multi-restaurant reuse remains possible.

### `users` to `user_sessions`

Cardinality: one user has many sessions.

This supports database-backed authentication sessions if selected.

### `users` to `roles`

Cardinality: many-to-many through `user_roles`.

Users can have multiple roles, such as owner and content editor.

### `roles` to `permissions`

Cardinality: many-to-many through `role_permissions`.

Roles grant groups of permissions. Permissions should control menu, offers, reservations, messages, reviews, gallery, manager profile, theme, SEO, settings, users, and permissions management.

### `restaurants` to `roles`

Cardinality: one restaurant has many roles.

Roles can be restaurant-specific while some may be marked as system roles.

### `permissions` to `role_permissions`

Cardinality: one permission can be attached to many roles.

Permissions are stable definitions used by authorization checks.

### `users` to `audit_logs`

Cardinality: one user can produce many audit log records.

Audit logs record sensitive actions such as approving reviews, deleting records, changing theme settings, editing SEO, and modifying permissions.

### `restaurants` to `audit_logs`

Cardinality: one restaurant has many audit log records.

This keeps audit history scoped to the restaurant account.

## Recommended Referential Actions

- Translation rows should cascade delete when their parent content record is deleted.
- Join table rows should cascade delete when either side is deleted.
- Media assets should usually be restricted from deletion if currently referenced by public content.
- Users should not be hard-deleted if they appear in audit logs; deactivate instead.
- Customer submissions should be archived or status-marked before deletion where retention matters.
- Restaurant deletion should be a controlled administrative operation, not a normal dashboard action.

## Recommended Unique Constraints

- Translation tables: unique parent ID plus locale.
- `restaurants.slug`: unique.
- `users.email` scoped by restaurant, or globally unique if one account can access multiple future restaurants.
- `permissions.key`: unique.
- Join tables: unique pair of related IDs, such as `menuItemId` plus `cookingMethodId`.
- Homepage section keys: unique per restaurant.
- SEO route paths: unique per restaurant and locale strategy.

## Public Data Safety Rules

- Public queries must filter reviews to approved status.
- Public queries must not return review email or phone.
- Public queries must not return message or reservation records.
- Public queries must filter content by restaurant, status, visibility, and locale availability.
- Public SEO and JSON-LD must only use published, visible, truthful content.
