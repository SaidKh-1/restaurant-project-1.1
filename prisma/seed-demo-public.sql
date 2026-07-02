-- Demo public website content for local/testing.
-- Safe to re-run: uses fixed IDs and upserts where possible.

BEGIN;

-- Remove prior demo records so the seed can be re-run safely.
DELETE FROM "seo_entry_translations"
WHERE "seoEntryId" IN (
  SELECT "id" FROM "seo_entries"
  WHERE "restaurantId" = 'restaurant_default'
    AND ("id" LIKE 'seo_demo_%' OR "entityId" IN ('home', 'about', 'hamour', 'shrimp', 'seafood-platter', 'singari', 'gallery-1', 'gallery-2', 'gallery-3', 'daily-catch'))
);

DELETE FROM "seo_entries"
WHERE "restaurantId" = 'restaurant_default'
  AND ("id" LIKE 'seo_demo_%' OR "entityId" IN ('home', 'about', 'hamour', 'shrimp', 'seafood-platter', 'singari', 'gallery-1', 'gallery-2', 'gallery-3', 'daily-catch'));

DELETE FROM "reviews"
WHERE "id" IN ('review_demo_1', 'review_demo_2', 'review_demo_3');

DELETE FROM "offer_translations"
WHERE "offerId" = 'offer_demo_weekend';

DELETE FROM "offers"
WHERE "id" = 'offer_demo_weekend';

DELETE FROM "gallery_image_translations"
WHERE "galleryImageId" IN (
  SELECT "id" FROM "gallery_images"
  WHERE "restaurantId" = 'restaurant_default'
    AND (
      "id" IN ('gallery_image_demo_1', 'gallery_image_demo_2', 'gallery_image_demo_3')
      OR "galleryCategoryId" IN (
        SELECT "id" FROM "gallery_categories"
        WHERE "restaurantId" = 'restaurant_default'
          AND "slug" = 'kitchen'
      )
    )
);

DELETE FROM "gallery_images"
WHERE "restaurantId" = 'restaurant_default'
  AND (
    "id" IN ('gallery_image_demo_1', 'gallery_image_demo_2', 'gallery_image_demo_3')
    OR "galleryCategoryId" IN (
      SELECT "id" FROM "gallery_categories"
      WHERE "restaurantId" = 'restaurant_default'
        AND "slug" = 'kitchen'
    )
  );

DELETE FROM "gallery_category_translations"
WHERE "galleryCategoryId" = 'gallery_category_demo_kitchen';

DELETE FROM "gallery_categories"
WHERE "restaurantId" = 'restaurant_default'
  AND (
    "id" = 'gallery_category_demo_kitchen'
    OR "slug" = 'kitchen'
  );

DELETE FROM "menu_item_translations"
WHERE "menuItemId" IN (
  SELECT "id" FROM "menu_items"
  WHERE "restaurantId" = 'restaurant_default'
    AND (
      "id" IN (
        'menu_item_demo_hamour',
        'menu_item_demo_singari',
        'menu_item_demo_shrimp',
        'menu_item_demo_platter'
      )
      OR "menuCategoryId" IN (
        SELECT "id" FROM "menu_categories"
        WHERE "restaurantId" = 'restaurant_default'
          AND "slug" IN ('fresh-fish', 'seafood')
      )
    )
);

DELETE FROM "menu_item_price_variant_translations"
WHERE "priceVariantId" IN (
  SELECT "id" FROM "menu_item_price_variants"
  WHERE "menuItemId" IN (
    SELECT "id" FROM "menu_items"
    WHERE "restaurantId" = 'restaurant_default'
      AND (
        "id" IN (
          'menu_item_demo_hamour',
          'menu_item_demo_singari',
          'menu_item_demo_shrimp',
          'menu_item_demo_platter'
        )
        OR "menuCategoryId" IN (
          SELECT "id" FROM "menu_categories"
          WHERE "restaurantId" = 'restaurant_default'
            AND "slug" IN ('fresh-fish', 'seafood')
        )
      )
  )
);

DELETE FROM "menu_item_price_variants"
WHERE "menuItemId" IN (
  SELECT "id" FROM "menu_items"
  WHERE "restaurantId" = 'restaurant_default'
    AND (
      "id" IN (
        'menu_item_demo_hamour',
        'menu_item_demo_singari',
        'menu_item_demo_shrimp',
        'menu_item_demo_platter'
      )
      OR "menuCategoryId" IN (
        SELECT "id" FROM "menu_categories"
        WHERE "restaurantId" = 'restaurant_default'
          AND "slug" IN ('fresh-fish', 'seafood')
      )
    )
);

DELETE FROM "menu_items"
WHERE "restaurantId" = 'restaurant_default'
  AND (
    "id" IN (
      'menu_item_demo_hamour',
      'menu_item_demo_singari',
      'menu_item_demo_shrimp',
      'menu_item_demo_platter'
    )
    OR "menuCategoryId" IN (
      SELECT "id" FROM "menu_categories"
      WHERE "restaurantId" = 'restaurant_default'
        AND "slug" IN ('fresh-fish', 'seafood')
    )
  );

DELETE FROM "menu_category_translations"
WHERE "menuCategoryId" IN ('menu_category_demo_fresh_fish', 'menu_category_demo_seafood');

DELETE FROM "menu_categories"
WHERE "restaurantId" = 'restaurant_default'
  AND (
    "id" IN ('menu_category_demo_fresh_fish', 'menu_category_demo_seafood')
    OR "slug" IN ('fresh-fish', 'seafood')
  );

DELETE FROM "hero_slide_translations"
WHERE "heroSlideId" IN ('hero_slide_demo_1', 'hero_slide_demo_2');

DELETE FROM "hero_slides"
WHERE "id" IN ('hero_slide_demo_1', 'hero_slide_demo_2');

UPDATE "restaurant_contact_settings"
SET
  "phone" = '+97444112233',
  "whatsappNumber" = '+97455112233',
  "email" = 'hello@seafood-restaurant.local',
  "reservationPhone" = '+97444112233',
  "publicContactEnabled" = true,
  "whatsappEnabled" = true,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "restaurantId" = 'restaurant_default';

UPDATE "restaurant_translations"
SET
  "description" = 'مطعم مأكولات بحرية يقدّم أسماكاً طازجة يومياً مع تجربة عربية أولاً وخدمة سريعة للحجز والتواصل.',
  "shortDescription" = 'أسماك طازجة ومأكولات بحرية يومياً',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'restaurant_translation_ar';

UPDATE "restaurant_translations"
SET
  "description" = 'A seafood restaurant serving fresh daily catch with Arabic-first hospitality and quick reservation support.',
  "shortDescription" = 'Fresh fish and seafood daily',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'restaurant_translation_en';

INSERT INTO "media_assets" (
  "id",
  "restaurantId",
  "storageKey",
  "publicUrl",
  "mimeType",
  "fileSize",
  "width",
  "height",
  "originalFilename",
  "usageType",
  "uploadedById",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'media_demo_hero_1',
    'restaurant_default',
    'demo/public/hero-1.jpg',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b9a2?auto=format&fit=crop&w=1600&q=80',
    'image/jpeg',
    245000,
    1600,
    900,
    'hero-1.jpg',
    'HERO',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_hero_2',
    'restaurant_default',
    'demo/public/hero-2.jpg',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80',
    'image/jpeg',
    238000,
    1600,
    900,
    'hero-2.jpg',
    'HERO',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_menu_hamour',
    'restaurant_default',
    'demo/public/menu-hamour.jpg',
    'https://images.unsplash.com/photo-1544943910-04c54c739780?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    180000,
    1200,
    900,
    'menu-hamour.jpg',
    'MENU_ITEM',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_menu_shrimp',
    'restaurant_default',
    'demo/public/menu-shrimp.jpg',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    176000,
    1200,
    900,
    'menu-shrimp.jpg',
    'MENU_ITEM',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_menu_platter',
    'restaurant_default',
    'demo/public/menu-platter.jpg',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    192000,
    1200,
    900,
    'menu-platter.jpg',
    'MENU_ITEM',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_menu_singari',
    'restaurant_default',
    'demo/public/menu-singari.jpg',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    168000,
    1200,
    900,
    'menu-singari.jpg',
    'MENU_ITEM',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_gallery_1',
    'restaurant_default',
    'demo/public/gallery-1.jpg',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    165000,
    1200,
    900,
    'gallery-1.jpg',
    'GALLERY',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_gallery_2',
    'restaurant_default',
    'demo/public/gallery-2.jpg',
    'https://images.unsplash.com/photo-1506089676908-359578f2a945?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    158000,
    1200,
    900,
    'gallery-2.jpg',
    'GALLERY',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_gallery_3',
    'restaurant_default',
    'demo/public/gallery-3.jpg',
    'https://images.unsplash.com/photo-1476224207961-aa797681af78?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    171000,
    1200,
    900,
    'gallery-3.jpg',
    'GALLERY',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'media_demo_offer_1',
    'restaurant_default',
    'demo/public/offer-weekend.jpg',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    182000,
    1200,
    900,
    'offer-weekend.jpg',
    'OFFER',
    'user_default_admin',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO UPDATE SET
  "publicUrl" = EXCLUDED."publicUrl",
  "usageType" = EXCLUDED."usageType",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "media_translations" (
  "id",
  "mediaAssetId",
  "locale",
  "altText",
  "caption",
  "createdAt",
  "updatedAt"
)
VALUES
  ('media_translation_demo_hero_1_ar', 'media_demo_hero_1', 'ar', 'أسماك طازجة على الثلج', 'صورة Hero', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_hero_1_en', 'media_demo_hero_1', 'en', 'Fresh fish on ice', 'Hero image', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_hero_2_ar', 'media_demo_hero_2', 'ar', 'مأكولات بحرية مشكلة', 'صورة Hero', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_hero_2_en', 'media_demo_hero_2', 'en', 'Seafood platter', 'Hero image', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_hamour_ar', 'media_demo_menu_hamour', 'ar', 'سمك هامور طازج', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_hamour_en', 'media_demo_menu_hamour', 'en', 'Fresh grouper', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_shrimp_ar', 'media_demo_menu_shrimp', 'ar', 'روبيان مشوي', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_shrimp_en', 'media_demo_menu_shrimp', 'en', 'Grilled shrimp', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_platter_ar', 'media_demo_menu_platter', 'ar', 'صحن مأكولات بحرية', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_platter_en', 'media_demo_menu_platter', 'en', 'Seafood platter', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_singari_ar', 'media_demo_menu_singari', 'ar', 'سمك سنجاري', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_menu_singari_en', 'media_demo_menu_singari', 'en', 'Singari fish', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_gallery_1_ar', 'media_demo_gallery_1', 'ar', 'طبق من المطبخ', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_gallery_1_en', 'media_demo_gallery_1', 'en', 'Kitchen plate', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_gallery_2_ar', 'media_demo_gallery_2', 'ar', 'مأكولات بحرية', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_gallery_2_en', 'media_demo_gallery_2', 'en', 'Seafood dish', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_gallery_3_ar', 'media_demo_gallery_3', 'ar', 'وجبة سمك', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_gallery_3_en', 'media_demo_gallery_3', 'en', 'Fish meal', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_offer_1_ar', 'media_demo_offer_1', 'ar', 'عرض نهاية الأسبوع', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('media_translation_demo_offer_1_en', 'media_demo_offer_1', 'en', 'Weekend offer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("mediaAssetId", "locale") DO UPDATE SET
  "altText" = EXCLUDED."altText",
  "caption" = EXCLUDED."caption",
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "theme_settings"
SET
  "defaultOgImageAssetId" = 'media_demo_hero_1',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "restaurantId" = 'restaurant_default';

INSERT INTO "hero_slides" (
  "id",
  "restaurantId",
  "imageAssetId",
  "isVisible",
  "sortOrder",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'hero_slide_demo_1',
    'restaurant_default',
    'media_demo_hero_1',
    true,
    1,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'hero_slide_demo_2',
    'restaurant_default',
    'media_demo_hero_2',
    true,
    2,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO UPDATE SET
  "imageAssetId" = EXCLUDED."imageAssetId",
  "isVisible" = EXCLUDED."isVisible",
  "sortOrder" = EXCLUDED."sortOrder",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "hero_slide_translations" (
  "id",
  "heroSlideId",
  "locale",
  "title",
  "subtitle",
  "primaryButtonLabel",
  "primaryButtonUrl",
  "secondaryButtonLabel",
  "secondaryButtonUrl",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'hero_slide_translation_demo_1_ar',
    'hero_slide_demo_1',
    'ar',
    'أسماك طازجة كل يوم',
    'اختبر أفضل المأكولات البحرية في تجربة عربية أصيلة',
    'استعرض المنيو',
    '/ar/menu',
    'احجز الآن',
    '/ar/reservations',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'hero_slide_translation_demo_1_en',
    'hero_slide_demo_1',
    'en',
    'Fresh fish every day',
    'Experience premium seafood with Arabic-first hospitality',
    'View menu',
    '/en/menu',
    'Reserve now',
    '/en/reservations',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'hero_slide_translation_demo_2_ar',
    'hero_slide_demo_2',
    'ar',
    'تشكيلة المأكولات البحرية',
    'أطباق مشوية ومقلية بطرق طهي متنوعة',
    'شاهد العروض',
    '/ar/offers',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'hero_slide_translation_demo_2_en',
    'hero_slide_demo_2',
    'en',
    'Seafood selection',
    'Grilled and fried dishes with multiple cooking styles',
    'See offers',
    '/en/offers',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("heroSlideId", "locale") DO UPDATE SET
  "title" = EXCLUDED."title",
  "subtitle" = EXCLUDED."subtitle",
  "primaryButtonLabel" = EXCLUDED."primaryButtonLabel",
  "primaryButtonUrl" = EXCLUDED."primaryButtonUrl",
  "secondaryButtonLabel" = EXCLUDED."secondaryButtonLabel",
  "secondaryButtonUrl" = EXCLUDED."secondaryButtonUrl",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "menu_categories" (
  "id",
  "restaurantId",
  "slug",
  "isVisible",
  "sortOrder",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'menu_category_demo_fresh_fish',
    'restaurant_default',
    'fresh-fish',
    true,
    1,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'menu_category_demo_seafood',
    'restaurant_default',
    'seafood',
    true,
    2,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO UPDATE SET
  "isVisible" = EXCLUDED."isVisible",
  "sortOrder" = EXCLUDED."sortOrder",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "menu_category_translations" (
  "id",
  "menuCategoryId",
  "locale",
  "name",
  "description",
  "slug",
  "createdAt",
  "updatedAt"
)
VALUES
  ('menu_category_translation_demo_fresh_fish_ar', 'menu_category_demo_fresh_fish', 'ar', 'الأسماك الطازجة', 'أسماك يومية طازجة', 'fresh-fish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_category_translation_demo_fresh_fish_en', 'menu_category_demo_fresh_fish', 'en', 'Fresh fish', 'Daily fresh catch', 'fresh-fish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_category_translation_demo_seafood_ar', 'menu_category_demo_seafood', 'ar', 'المأكولات البحرية', 'روبيان ومحار ومأكولات بحرية', 'seafood', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_category_translation_demo_seafood_en', 'menu_category_demo_seafood', 'en', 'Seafood', 'Shrimp, shellfish, and seafood dishes', 'seafood', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("menuCategoryId", "locale") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "menu_items" (
  "id",
  "restaurantId",
  "menuCategoryId",
  "imageAssetId",
  "isAvailable",
  "isFeatured",
  "isVisible",
  "sortOrder",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
  ('menu_item_demo_hamour', 'restaurant_default', 'menu_category_demo_fresh_fish', 'media_demo_menu_hamour', true, true, true, 1, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_demo_singari', 'restaurant_default', 'menu_category_demo_fresh_fish', 'media_demo_menu_singari', true, true, true, 2, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_demo_shrimp', 'restaurant_default', 'menu_category_demo_seafood', 'media_demo_menu_shrimp', true, true, true, 1, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_demo_platter', 'restaurant_default', 'menu_category_demo_seafood', 'media_demo_menu_platter', true, true, true, 2, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "imageAssetId" = EXCLUDED."imageAssetId",
  "isFeatured" = EXCLUDED."isFeatured",
  "isVisible" = EXCLUDED."isVisible",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "menu_item_translations" (
  "id",
  "menuItemId",
  "locale",
  "name",
  "description",
  "slug",
  "createdAt",
  "updatedAt"
)
VALUES
  ('menu_item_translation_demo_hamour_ar', 'menu_item_demo_hamour', 'ar', 'سمك هامور طازج', 'هامور طازج يومياً يُحضّر حسب الطلب', 'hamour', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_hamour_en', 'menu_item_demo_hamour', 'en', 'Fresh grouper', 'Daily fresh grouper prepared to order', 'hamour', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_singari_ar', 'menu_item_demo_singari', 'ar', 'سمك سنجاري', 'سمك سنجاري مشوي على الفحم', 'singari', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_singari_en', 'menu_item_demo_singari', 'en', 'Singari fish', 'Charcoal-grilled singari fish', 'singari', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_shrimp_ar', 'menu_item_demo_shrimp', 'ar', 'روبيان مشوي', 'روبيان طازج متبل ومشوي', 'shrimp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_shrimp_en', 'menu_item_demo_shrimp', 'en', 'Grilled shrimp', 'Fresh seasoned grilled shrimp', 'shrimp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_platter_ar', 'menu_item_demo_platter', 'ar', 'صحن مأكولات بحرية', 'تشكيلة مأكولات بحرية للمشاركة', 'seafood-platter', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_item_translation_demo_platter_en', 'menu_item_demo_platter', 'en', 'Seafood platter', 'Sharing seafood platter', 'seafood-platter', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("menuItemId", "locale") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "menu_item_price_variants" (
  "id",
  "menuItemId",
  "price",
  "unit",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES
  ('menu_variant_demo_hamour_kg', 'menu_item_demo_hamour', 95.00, 'كجم', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_demo_singari_piece', 'menu_item_demo_singari', 65.00, 'حبة', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_demo_shrimp_plate', 'menu_item_demo_shrimp', 55.00, 'طبق', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_demo_platter_large', 'menu_item_demo_platter', 180.00, 'كبير', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "price" = EXCLUDED."price",
  "unit" = EXCLUDED."unit",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "menu_item_price_variant_translations" (
  "id",
  "priceVariantId",
  "locale",
  "name",
  "createdAt",
  "updatedAt"
)
VALUES
  ('menu_variant_translation_demo_hamour_kg_ar', 'menu_variant_demo_hamour_kg', 'ar', 'كيلو', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_hamour_kg_en', 'menu_variant_demo_hamour_kg', 'en', 'Kilo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_singari_piece_ar', 'menu_variant_demo_singari_piece', 'ar', 'حبة', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_singari_piece_en', 'menu_variant_demo_singari_piece', 'en', 'Piece', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_shrimp_plate_ar', 'menu_variant_demo_shrimp_plate', 'ar', 'طبق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_shrimp_plate_en', 'menu_variant_demo_shrimp_plate', 'en', 'Plate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_platter_large_ar', 'menu_variant_demo_platter_large', 'ar', 'كبير', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu_variant_translation_demo_platter_large_en', 'menu_variant_demo_platter_large', 'en', 'Large', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("priceVariantId", "locale") DO UPDATE SET
  "name" = EXCLUDED."name",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "gallery_categories" (
  "id",
  "restaurantId",
  "slug",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES (
  'gallery_category_demo_kitchen',
  'restaurant_default',
  'kitchen',
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "gallery_category_translations" (
  "id",
  "galleryCategoryId",
  "locale",
  "name",
  "description",
  "createdAt",
  "updatedAt"
)
VALUES
  ('gallery_category_translation_demo_kitchen_ar', 'gallery_category_demo_kitchen', 'ar', 'من المطبخ', 'صور من مطبخ المطعم', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_category_translation_demo_kitchen_en', 'gallery_category_demo_kitchen', 'en', 'From the kitchen', 'Photos from our kitchen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("galleryCategoryId", "locale") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "gallery_images" (
  "id",
  "restaurantId",
  "galleryCategoryId",
  "mediaAssetId",
  "isFeatured",
  "isVisible",
  "sortOrder",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
  ('gallery_image_demo_1', 'restaurant_default', 'gallery_category_demo_kitchen', 'media_demo_gallery_1', true, true, 1, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_demo_2', 'restaurant_default', 'gallery_category_demo_kitchen', 'media_demo_gallery_2', true, true, 2, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_demo_3', 'restaurant_default', 'gallery_category_demo_kitchen', 'media_demo_gallery_3', true, true, 3, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "mediaAssetId" = EXCLUDED."mediaAssetId",
  "isFeatured" = EXCLUDED."isFeatured",
  "isVisible" = EXCLUDED."isVisible",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "gallery_image_translations" (
  "id",
  "galleryImageId",
  "locale",
  "caption",
  "altText",
  "createdAt",
  "updatedAt"
)
VALUES
  ('gallery_image_translation_demo_1_ar', 'gallery_image_demo_1', 'ar', 'طبق سمك طازج', 'طبق سمك طازج', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_translation_demo_1_en', 'gallery_image_demo_1', 'en', 'Fresh fish plate', 'Fresh fish plate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_translation_demo_2_ar', 'gallery_image_demo_2', 'ar', 'مأكولات بحرية', 'مأكولات بحرية', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_translation_demo_2_en', 'gallery_image_demo_2', 'en', 'Seafood dish', 'Seafood dish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_translation_demo_3_ar', 'gallery_image_demo_3', 'ar', 'وجبة مشوية', 'وجبة مشوية', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery_image_translation_demo_3_en', 'gallery_image_demo_3', 'en', 'Grilled meal', 'Grilled meal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("galleryImageId", "locale") DO UPDATE SET
  "caption" = EXCLUDED."caption",
  "altText" = EXCLUDED."altText",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "offers" (
  "id",
  "restaurantId",
  "imageAssetId",
  "isActive",
  "isFeatured",
  "sortOrder",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES (
  'offer_demo_weekend',
  'restaurant_default',
  'media_demo_offer_1',
  true,
  true,
  1,
  'PUBLISHED',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "imageAssetId" = EXCLUDED."imageAssetId",
  "isActive" = EXCLUDED."isActive",
  "isFeatured" = EXCLUDED."isFeatured",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "offer_translations" (
  "id",
  "offerId",
  "locale",
  "title",
  "description",
  "ctaLabel",
  "ctaUrl",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'offer_translation_demo_weekend_ar',
    'offer_demo_weekend',
    'ar',
    'عرض نهاية الأسبوع',
    'خصم 15% على الأطباق البحرية المختارة كل جمعة وسبت',
    'اطلب الآن',
    '/ar/offers',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'offer_translation_demo_weekend_en',
    'offer_demo_weekend',
    'en',
    'Weekend offer',
    '15% off selected seafood dishes every Friday and Saturday',
    'Order now',
    '/en/offers',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("offerId", "locale") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "ctaLabel" = EXCLUDED."ctaLabel",
  "ctaUrl" = EXCLUDED."ctaUrl",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "reviews" (
  "id",
  "restaurantId",
  "customerName",
  "email",
  "phone",
  "rating",
  "title",
  "comment",
  "status",
  "isFeatured",
  "publicNameMode",
  "approvedById",
  "approvedAt",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'review_demo_1',
    'restaurant_default',
    'أحمد المنصوري',
    'ahmed.demo@example.com',
    '+97450000001',
    5,
    'تجربة رائعة',
    'سمك طازج جداً وخدمة ممتازة. أنصح بزيارة المطعم للعائلات.',
    'APPROVED',
    true,
    'SHORTENED',
    'user_default_admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP - INTERVAL '12 days',
    CURRENT_TIMESTAMP
  ),
  (
    'review_demo_2',
    'restaurant_default',
    'فاطمة الكواري',
    'fatima.demo@example.com',
    NULL,
    4,
    'مأكولات بحرية لذيذة',
    'الروبيان المشوي كان ممتازاً والأسعار واضحة.',
    'APPROVED',
    true,
    'FIRST_NAME',
    'user_default_admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP - INTERVAL '8 days',
    CURRENT_TIMESTAMP
  ),
  (
    'review_demo_3',
    'restaurant_default',
    'John Smith',
    'john.demo@example.com',
    '+97450000003',
    5,
    NULL,
    'Great seafood restaurant with fresh daily catch and friendly staff.',
    'APPROVED',
    false,
    'FIRST_NAME',
    'user_default_admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "isFeatured" = EXCLUDED."isFeatured",
  "comment" = EXCLUDED."comment",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Replace SEO rows used by the public homepage sections.
DELETE FROM "seo_entry_translations"
WHERE "seoEntryId" IN (
  SELECT "id"
  FROM "seo_entries"
  WHERE "restaurantId" = 'restaurant_default'
    AND "routePath" IN (
      '/ar',
      '/ar/menu',
      '/ar/about',
      '/ar/menu/hamour',
      '/ar/menu/shrimp',
      '/ar/menu/seafood-platter',
      '/ar/menu/singari',
      '/ar/gallery',
      '/ar/gallery/kitchen',
      '/ar/gallery/plates'
    )
);

DELETE FROM "seo_entries"
WHERE "restaurantId" = 'restaurant_default'
  AND "routePath" IN (
    '/ar',
    '/ar/menu',
    '/ar/about',
    '/ar/menu/hamour',
    '/ar/menu/shrimp',
    '/ar/menu/seafood-platter',
    '/ar/menu/singari',
    '/ar/gallery',
    '/ar/gallery/kitchen',
    '/ar/gallery/plates'
  );

INSERT INTO "seo_entries" (
  "id",
  "restaurantId",
  "entityType",
  "entityId",
  "routePath",
  "canonicalPath",
  "ogImageAssetId",
  "robotsIndex",
  "robotsFollow",
  "isSitemapIncluded",
  "createdAt",
  "updatedAt"
)
VALUES
  ('seo_demo_home', 'restaurant_default', 'PAGE', 'home', '/ar', '/ar', 'media_demo_hero_1', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_home_slide_2', 'restaurant_default', 'PAGE', 'daily-catch', '/ar/menu', '/ar/menu', 'media_demo_hero_2', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_about', 'restaurant_default', 'ABOUT', 'about', '/ar/about', '/ar/about', 'media_demo_menu_platter', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_menu_hamour', 'restaurant_default', 'MENU_ITEM', 'hamour', '/ar/menu/hamour', '/ar/menu/hamour', 'media_demo_menu_hamour', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_menu_shrimp', 'restaurant_default', 'MENU_ITEM', 'shrimp', '/ar/menu/shrimp', '/ar/menu/shrimp', 'media_demo_menu_shrimp', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_menu_platter', 'restaurant_default', 'MENU_ITEM', 'seafood-platter', '/ar/menu/seafood-platter', '/ar/menu/seafood-platter', 'media_demo_menu_platter', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_menu_singari', 'restaurant_default', 'MENU_ITEM', 'singari', '/ar/menu/singari', '/ar/menu/singari', 'media_demo_menu_singari', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_gallery_1', 'restaurant_default', 'GALLERY', 'gallery-1', '/ar/gallery', '/ar/gallery', 'media_demo_gallery_1', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_gallery_2', 'restaurant_default', 'GALLERY', 'gallery-2', '/ar/gallery/kitchen', '/ar/gallery/kitchen', 'media_demo_gallery_2', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_demo_gallery_3', 'restaurant_default', 'GALLERY', 'gallery-3', '/ar/gallery/plates', '/ar/gallery/plates', 'media_demo_gallery_3', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "seo_entry_translations" (
  "id",
  "seoEntryId",
  "locale",
  "seoTitle",
  "seoDescription",
  "ogTitle",
  "ogDescription",
  "createdAt",
  "updatedAt"
)
VALUES
  ('seo_translation_demo_home_ar', 'seo_demo_home', 'ar', 'مطعم المأكولات البحرية | أسماك طازجة يومياً', 'استمتع بأسماك طازجة ومأكولات بحرية في تجربة عربية أولاً.', 'أسماك طازجة', 'مطعم مأكولات بحرية', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_home_en', 'seo_demo_home', 'en', 'Seafood Restaurant | Fresh fish daily', 'Enjoy fresh fish and seafood with Arabic-first hospitality.', 'Fresh fish', 'Seafood restaurant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_home_slide_2_ar', 'seo_demo_home_slide_2', 'ar', 'منيو اليوم', 'اكتشف أطباق اليوم من الأسماك الطازجة وطرق الطهي المميزة.', 'منيو اليوم', 'أطباق اليوم', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_home_slide_2_en', 'seo_demo_home_slide_2', 'en', 'Today''s menu', 'Discover today''s fresh fish dishes and signature cooking styles.', 'Today''s menu', 'Daily dishes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_about_ar', 'seo_demo_about', 'ar', 'عن مطعم المأكولات البحرية', 'نقدّم تجربة مأكولات بحرية عربية أصيلة مع اهتمام بالطزاجة والجودة وخدمة العائلات.', 'عن المطعم', 'تجربة بحرية أصيلة', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_about_en', 'seo_demo_about', 'en', 'About our seafood restaurant', 'We serve an authentic Arabic seafood experience focused on freshness, quality, and family hospitality.', 'About us', 'Authentic seafood', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_hamour_ar', 'seo_demo_menu_hamour', 'ar', 'سمك هامور طازج', 'هامور طازج يُحضّر حسب الطلب.', 'سمك هامور', 'هامور طازج', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_hamour_en', 'seo_demo_menu_hamour', 'en', 'Fresh grouper', 'Daily fresh grouper prepared to order.', 'Fresh grouper', 'Grouper dish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_shrimp_ar', 'seo_demo_menu_shrimp', 'ar', 'روبيان مشوي', 'روبيان طازج متبل ومشوي.', 'روبيان مشوي', 'روبيان', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_shrimp_en', 'seo_demo_menu_shrimp', 'en', 'Grilled shrimp', 'Fresh seasoned grilled shrimp.', 'Grilled shrimp', 'Shrimp dish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_platter_ar', 'seo_demo_menu_platter', 'ar', 'صحن مأكولات بحرية', 'تشكيلة مأكولات بحرية للمشاركة.', 'صحن بحرية', 'تشكيلة بحرية', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_platter_en', 'seo_demo_menu_platter', 'en', 'Seafood platter', 'Sharing seafood platter.', 'Seafood platter', 'Platter', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_singari_ar', 'seo_demo_menu_singari', 'ar', 'سمك سنجاري', 'سمك سنجاري مشوي على الفحم.', 'سمك سنجاري', 'سنجاري', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_menu_singari_en', 'seo_demo_menu_singari', 'en', 'Singari fish', 'Charcoal-grilled singari fish.', 'Singari fish', 'Singari', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_gallery_1_ar', 'seo_demo_gallery_1', 'ar', 'معرض الصور', 'صور من مطبخ المطعم وأطباقه.', 'معرض الصور', 'من المطبخ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_gallery_1_en', 'seo_demo_gallery_1', 'en', 'Photo gallery', 'Photos from our kitchen and dishes.', 'Gallery', 'From the kitchen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_gallery_2_ar', 'seo_demo_gallery_2', 'ar', 'من المطبخ', 'لقطات من تحضير المأكولات البحرية.', 'من المطبخ', 'تحضير الأطباق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_gallery_2_en', 'seo_demo_gallery_2', 'en', 'From the kitchen', 'Moments from seafood preparation.', 'Kitchen', 'Preparation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_gallery_3_ar', 'seo_demo_gallery_3', 'ar', 'أطباق مشوية', 'أطباق سمك ومأكولات بحرية مشوية.', 'أطباق مشوية', 'مشويات', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seo_translation_demo_gallery_3_en', 'seo_demo_gallery_3', 'en', 'Grilled plates', 'Grilled fish and seafood plates.', 'Grilled plates', 'Grilled dishes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("seoEntryId", "locale") DO UPDATE SET
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "ogTitle" = EXCLUDED."ogTitle",
  "ogDescription" = EXCLUDED."ogDescription",
  "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;
