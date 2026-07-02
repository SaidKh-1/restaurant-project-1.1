# Menu Management

## Purpose

Menu management is the core feature for the seafood restaurant CMS. Admin can manage seafood categories, menu items, multiple price variants, availability, featured items, and cooking method assignments.

## Default Seafood Categories

1. الأسماك الطازجة
2. المأكولات البحرية
3. الأطباق الخاصة
4. طرق الطهي
5. خدمات المطعم

Categories are editable content and should not be permanently hardcoded in application code.

## Menu Item Fields

Each menu item supports:

- `nameAr`
- `nameEn`
- `descriptionAr`
- `descriptionEn`
- Category.
- Image.
- Availability.
- Featured status.
- Sort order.
- Cooking method assignments.
- Price variants.

Admin can hide unavailable items and mark featured items.

## Price Variant Fields

Each variant supports:

- `nameAr`
- `nameEn`
- `price`
- `unit`

Supported units:

- كجم
- حبة
- طبق
- صغير
- كبير

Admin can add, edit, and delete price variants.

## Arabic-First Menu Examples

### الأسماك الطازجة

- بوري مصري: 40 ر.ق / كجم
- حنشان مصري: 100 ر.ق / كجم
- قارص تركي: 70 ر.ق / كجم
- دنيس تركي: 60 ر.ق / كجم
- بلطي مصري:
  - مقلي أو مشوي: 25 ر.ق / كجم
  - مدخن: 30 ر.ق / كجم
- ماكريل: 45 ر.ق / كجم
- شعري: 35 ر.ق / كجم
- سلطان إبراهيم: 40 ر.ق / كجم
- هامور كبير: 80 ر.ق / كجم
- سالمون نرويجي: 70 ر.ق / كجم

### المأكولات البحرية

- استاكوزا / أم الروبيان: 30 ر.ق / حبة
- روبيان وسط: 60 ر.ق / كجم
- روبيان كبير:
  - مشوي أو مقلي: 100 ر.ق / كجم
  - بترفلاي: 100 ر.ق / كجم
- سبيط / خثاق: 60 ر.ق / كجم
- كاليماري: 50 ر.ق / كجم

### الأطباق الخاصة

- فيليه أبيض:
  - مشوي أو مقلي: 70 ر.ق / كجم
- براكودا مدخن:
  - عادي: 45 ر.ق / كجم
  - مع البطاطس: 55 ر.ق
- شوربة سي فود: 20 ر.ق
- ملوخية بالجمبري: 20 ر.ق
- طواجن بحرية:
  - صغير: 55 ر.ق
  - كبير: 90 ر.ق

These examples are content examples for setup or seed planning. They should remain editable through the CMS.

## Cooking Methods

Cooking methods are dynamic and configurable from the dashboard.

Default methods:

- مقلي
- مشوي
- سنجاري
- مدخن
- فرن

Admin can:

- Add cooking methods.
- Edit cooking methods.
- Delete cooking methods.
- Enable or disable cooking methods.
- Assign cooking methods to menu items.
- Show or hide the cooking methods section publicly.

## Public Menu Rules

- Arabic menu is primary.
- English menu appears under `/en` when content exists.
- Price variants should be easy to read.
- Unavailable hidden items should not appear publicly.
- Featured items can appear in homepage sections.
- Menu content should support Arabic SEO.
