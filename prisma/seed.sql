-- Step 7 initial seed data.
-- This file is intentionally limited to the approved foundation records only.

BEGIN;

INSERT INTO "restaurants" (
  "id",
  "slug",
  "defaultLocale",
  "isEnglishEnabled",
  "timezone",
  "currencyCode",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES (
  'restaurant_default',
  'default-seafood-restaurant',
  'ar',
  true,
  'Asia/Qatar',
  'QAR',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "defaultLocale" = EXCLUDED."defaultLocale",
  "isEnglishEnabled" = EXCLUDED."isEnglishEnabled",
  "timezone" = EXCLUDED."timezone",
  "currencyCode" = EXCLUDED."currencyCode",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "restaurant_translations" (
  "id",
  "restaurantId",
  "locale",
  "name",
  "description",
  "shortDescription",
  "addressText",
  "cuisineText",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'restaurant_translation_ar',
    'restaurant_default',
    'ar',
    'مطعم المأكولات البحرية',
    NULL,
    NULL,
    NULL,
    'مأكولات بحرية',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'restaurant_translation_en',
    'restaurant_default',
    'en',
    'Seafood Restaurant',
    NULL,
    NULL,
    NULL,
    'Seafood',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("restaurantId", "locale") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "shortDescription" = EXCLUDED."shortDescription",
  "addressText" = EXCLUDED."addressText",
  "cuisineText" = EXCLUDED."cuisineText",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "restaurant_settings" (
  "id",
  "restaurantId",
  "defaultPublicRoute",
  "englishPublicRoute",
  "homepageSectionsReorderEnabled",
  "reviewsRequireApproval",
  "reviewPhoneMode",
  "publicReviewNameMode",
  "reservationsEnabled",
  "messagesEnabled",
  "reviewsEnabled",
  "createdAt",
  "updatedAt"
)
VALUES (
  'restaurant_settings_default',
  'restaurant_default',
  '/ar',
  '/en',
  false,
  true,
  'OPTIONAL',
  'SHORTENED',
  true,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("restaurantId") DO UPDATE SET
  "defaultPublicRoute" = EXCLUDED."defaultPublicRoute",
  "englishPublicRoute" = EXCLUDED."englishPublicRoute",
  "homepageSectionsReorderEnabled" = EXCLUDED."homepageSectionsReorderEnabled",
  "reviewsRequireApproval" = EXCLUDED."reviewsRequireApproval",
  "reviewPhoneMode" = EXCLUDED."reviewPhoneMode",
  "publicReviewNameMode" = EXCLUDED."publicReviewNameMode",
  "reservationsEnabled" = EXCLUDED."reservationsEnabled",
  "messagesEnabled" = EXCLUDED."messagesEnabled",
  "reviewsEnabled" = EXCLUDED."reviewsEnabled",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "restaurant_contact_settings" (
  "id",
  "restaurantId",
  "phone",
  "whatsappNumber",
  "email",
  "reservationPhone",
  "publicContactEnabled",
  "whatsappEnabled",
  "createdAt",
  "updatedAt"
)
VALUES (
  'restaurant_contact_settings_default',
  'restaurant_default',
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("restaurantId") DO UPDATE SET
  "publicContactEnabled" = EXCLUDED."publicContactEnabled",
  "whatsappEnabled" = EXCLUDED."whatsappEnabled",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "theme_settings" (
  "id",
  "restaurantId",
  "primaryColor",
  "secondaryColor",
  "buttonColor",
  "headerColor",
  "footerColor",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  'theme_settings_default',
  'restaurant_default',
  '#0f766e',
  '#0369a1',
  '#f97316',
  '#0f172a',
  '#020617',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("restaurantId") DO UPDATE SET
  "primaryColor" = EXCLUDED."primaryColor",
  "secondaryColor" = EXCLUDED."secondaryColor",
  "buttonColor" = EXCLUDED."buttonColor",
  "headerColor" = EXCLUDED."headerColor",
  "footerColor" = EXCLUDED."footerColor",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "permissions" (
  "id",
  "key",
  "description",
  "group",
  "createdAt",
  "updatedAt"
)
VALUES
  ('permission_dashboard_read', 'dashboard.read', 'View dashboard summaries.', 'dashboard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_homepage_manage', 'homepage.manage', 'Manage homepage sections.', 'homepage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_hero_manage', 'hero.manage', 'Manage hero slides.', 'homepage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_menu_manage', 'menu.manage', 'Manage menu categories, items, and price variants.', 'menu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_cooking_methods_manage', 'cooking_methods.manage', 'Manage cooking methods.', 'cookingMethods', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_offers_manage', 'offers.manage', 'Manage offers.', 'offers', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_reservations_manage', 'reservations.manage', 'Manage reservations.', 'reservations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_messages_manage', 'messages.manage', 'Manage contact messages.', 'messages', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_reviews_manage', 'reviews.manage', 'Moderate and manage reviews.', 'reviews', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_gallery_manage', 'gallery.manage', 'Manage gallery content.', 'gallery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_media_manage', 'media.manage', 'Manage media library assets.', 'media', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_manager_profile_manage', 'manager_profile.manage', 'Manage manager profile content.', 'managerProfile', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_theme_manage', 'theme.manage', 'Manage theme settings.', 'theme', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_seo_manage', 'seo.manage', 'Manage SEO entries.', 'seo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_settings_manage', 'settings.manage', 'Manage restaurant and website settings.', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_users_manage', 'users.manage', 'Manage admin users.', 'users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_roles_manage', 'roles.manage', 'Manage roles.', 'users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_permissions_manage', 'permissions.manage', 'Manage permissions.', 'users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('permission_audit_logs_read', 'audit_logs.read', 'View audit logs.', 'auditLogs', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "description" = EXCLUDED."description",
  "group" = EXCLUDED."group",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "roles" (
  "id",
  "restaurantId",
  "name",
  "description",
  "isSystemRole",
  "createdAt",
  "updatedAt"
)
VALUES
  ('role_super_admin', 'restaurant_default', 'Super Admin', 'Full system access for the owner or primary administrator.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_admin', 'restaurant_default', 'Admin', 'Administrative CMS access without permission management.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_staff', 'restaurant_default', 'Staff', 'Operational access for messages, reservations, and review moderation.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("restaurantId", "name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "isSystemRole" = EXCLUDED."isSystemRole",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT
  'role_permission_super_admin_' || replace("key", '.', '_'),
  'role_super_admin',
  "id"
FROM "permissions"
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT
  'role_permission_admin_' || replace("key", '.', '_'),
  'role_admin',
  "id"
FROM "permissions"
WHERE "key" NOT IN (
  'users.manage',
  'roles.manage',
  'permissions.manage',
  'audit_logs.read'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT
  'role_permission_staff_' || replace("key", '.', '_'),
  'role_staff',
  "id"
FROM "permissions"
WHERE "key" IN (
  'dashboard.read',
  'reservations.manage',
  'messages.manage',
  'reviews.manage'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "users" (
  "id",
  "restaurantId",
  "name",
  "email",
  "emailVerified",
  "passwordHash",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  'user_default_admin',
  'restaurant_default',
  'Default Admin',
  'admin@restaurant.local',
  true,
  '$2b$12$0zs314roNeUjCIny/vxISOkJbz.wbDjfQ2mFgag1gTyv0VupuYgUi',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("restaurantId", "email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "emailVerified" = EXCLUDED."emailVerified",
  "passwordHash" = EXCLUDED."passwordHash",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "accounts" (
  "id",
  "accountId",
  "providerId",
  "userId",
  "password",
  "createdAt",
  "updatedAt"
)
VALUES (
  'account_default_admin_credential',
  'user_default_admin',
  'credential',
  'user_default_admin',
  '$2b$12$0zs314roNeUjCIny/vxISOkJbz.wbDjfQ2mFgag1gTyv0VupuYgUi',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("providerId", "accountId") DO UPDATE SET
  "userId" = EXCLUDED."userId",
  "password" = EXCLUDED."password",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "user_roles" ("id", "userId", "roleId")
VALUES ('user_role_default_admin_super_admin', 'user_default_admin', 'role_super_admin')
ON CONFLICT ("userId", "roleId") DO NOTHING;

INSERT INTO "cooking_methods" (
  "id",
  "restaurantId",
  "isEnabled",
  "isPubliclyVisible",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES
  ('cooking_method_fried', 'restaurant_default', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_grilled', 'restaurant_default', true, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_singari', 'restaurant_default', true, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_smoked', 'restaurant_default', true, true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_oven', 'restaurant_default', true, true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "isEnabled" = EXCLUDED."isEnabled",
  "isPubliclyVisible" = EXCLUDED."isPubliclyVisible",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "cooking_method_translations" (
  "id",
  "cookingMethodId",
  "locale",
  "name",
  "description",
  "createdAt",
  "updatedAt"
)
VALUES
  ('cooking_method_translation_fried_ar', 'cooking_method_fried', 'ar', 'مقلي', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_fried_en', 'cooking_method_fried', 'en', 'Fried', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_grilled_ar', 'cooking_method_grilled', 'ar', 'مشوي', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_grilled_en', 'cooking_method_grilled', 'en', 'Grilled', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_singari_ar', 'cooking_method_singari', 'ar', 'سنجاري', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_singari_en', 'cooking_method_singari', 'en', 'Singari', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_smoked_ar', 'cooking_method_smoked', 'ar', 'مدخن', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_smoked_en', 'cooking_method_smoked', 'en', 'Smoked', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_oven_ar', 'cooking_method_oven', 'ar', 'فرن', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cooking_method_translation_oven_en', 'cooking_method_oven', 'en', 'Oven', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("cookingMethodId", "locale") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;
