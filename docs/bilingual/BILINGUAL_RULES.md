# Bilingual Rules

## Language Priority

Arabic is the default and primary language of the platform. English is optional and available through a language switcher.

## Route Rules

- Default public route: `/ar`.
- English public route: `/en`.
- Arabic pages use RTL.
- English pages use LTR.
- The website should open in Arabic by default.
- Language switching should preserve equivalent page context where possible.

## Admin Language Rules

- Admin dashboard is Arabic-first.
- Admin interface can support English later.
- Admin section labels should prioritize Arabic restaurant owner workflows.
- Every editable public content field must support Arabic and English.

## Content Field Rules

Every editable public field should support Arabic and English, including:

- Names.
- Descriptions.
- Section titles.
- Button labels.
- Image alt text.
- Captions.
- Manager bio.
- About content.
- Menu item names.
- Price variant names.
- Cooking method names.
- SEO titles.
- SEO descriptions.
- Open Graph text.

## Publishing Rules

- Arabic content is required for Arabic publishing.
- English content is required only when the English version of that content is published.
- Admin should see missing English content as a completion warning, not necessarily a blocker.
- Public pages must never display broken placeholders for missing translations.

## Directionality Rules

- Arabic content must render with RTL direction.
- English content must render with LTR direction.
- Icons, arrows, spacing, navigation, tables, forms, and menus should respect direction.
- Avoid hardcoded left/right assumptions in future implementation.

## SEO Language Rules

- Arabic SEO is primary.
- English SEO is supported.
- Arabic metadata is used by default.
- Each public page should support `seoTitleAr`, `seoTitleEn`, `seoDescriptionAr`, `seoDescriptionEn`, and `ogImage`.
- Sitemap and structured data should include locale-aware public URLs.

## Seafood Content Rules

Arabic seafood terms should be treated as primary labels, including:

- الأسماك الطازجة
- المأكولات البحرية
- الأطباق الخاصة
- طرق الطهي
- خدمات المطعم

English equivalents should be editable, not assumed permanently in code.

## Quality Checklist

- `/ar` works as the primary public experience.
- `/en` works when English content exists.
- Arabic layout feels native.
- Admin content editing starts with Arabic.
- Customer-private data is not exposed during translation or display.
