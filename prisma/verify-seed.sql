-- Verification for Step 7 seed data.
-- This block raises an error if expected seed data is missing or forbidden data exists.

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "users" WHERE "email" = 'admin@restaurant.local') <> 1 THEN
    RAISE EXCEPTION 'Expected one default admin account.';
  END IF;

  IF (SELECT COUNT(*) FROM "roles" WHERE "restaurantId" = 'restaurant_default' AND "name" IN ('Super Admin', 'Admin', 'Staff')) <> 3 THEN
    RAISE EXCEPTION 'Expected Super Admin, Admin, and Staff roles.';
  END IF;

  IF (SELECT COUNT(*) FROM "permissions") <> 19 THEN
    RAISE EXCEPTION 'Expected 19 permissions.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM "user_roles"
    WHERE "userId" = 'user_default_admin'
      AND "roleId" = 'role_super_admin'
  ) <> 1 THEN
    RAISE EXCEPTION 'Expected default admin to have Super Admin role.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM "restaurants"
    WHERE "id" = 'restaurant_default'
      AND "defaultLocale" = 'ar'
      AND "isEnglishEnabled" = true
  ) <> 1 THEN
    RAISE EXCEPTION 'Expected Arabic default language and English secondary language.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM "restaurant_translations"
    WHERE "restaurantId" = 'restaurant_default'
      AND "locale" IN ('ar', 'en')
  ) <> 2 THEN
    RAISE EXCEPTION 'Expected Arabic and English restaurant translation rows.';
  END IF;

  IF (SELECT COUNT(*) FROM "restaurant_settings" WHERE "restaurantId" = 'restaurant_default') <> 1 THEN
    RAISE EXCEPTION 'Expected default restaurant settings.';
  END IF;

  IF (SELECT COUNT(*) FROM "restaurant_contact_settings" WHERE "restaurantId" = 'restaurant_default') <> 1 THEN
    RAISE EXCEPTION 'Expected default contact settings.';
  END IF;

  IF (SELECT COUNT(*) FROM "theme_settings" WHERE "restaurantId" = 'restaurant_default') <> 1 THEN
    RAISE EXCEPTION 'Expected default theme settings.';
  END IF;

  IF (SELECT COUNT(*) FROM "cooking_methods" WHERE "restaurantId" = 'restaurant_default') <> 5 THEN
    RAISE EXCEPTION 'Expected five default cooking methods.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM "cooking_method_translations"
    WHERE "locale" = 'ar'
      AND "name" IN ('مقلي', 'مشوي', 'سنجاري', 'مدخن', 'فرن')
  ) <> 5 THEN
    RAISE EXCEPTION 'Expected Arabic cooking method names.';
  END IF;

  IF (SELECT COUNT(*) FROM "menu_categories") <> 0 THEN
    RAISE EXCEPTION 'Menu categories must not be seeded in Step 7.';
  END IF;

  IF (SELECT COUNT(*) FROM "menu_items") <> 0 THEN
    RAISE EXCEPTION 'Menu items must not be seeded in Step 7.';
  END IF;

  IF (SELECT COUNT(*) FROM "reviews") <> 0 THEN
    RAISE EXCEPTION 'Reviews must not be seeded in Step 7.';
  END IF;

  IF (SELECT COUNT(*) FROM "reservations") <> 0 THEN
    RAISE EXCEPTION 'Reservations must not be seeded in Step 7.';
  END IF;

  IF (SELECT COUNT(*) FROM "contact_messages") <> 0 THEN
    RAISE EXCEPTION 'Contact messages must not be seeded in Step 7.';
  END IF;
END $$;
