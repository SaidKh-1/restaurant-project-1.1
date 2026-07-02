# SEO Plan

## SEO Objective

Arabic SEO is primary. The seafood restaurant website should rank well for Arabic seafood, fresh fish, restaurant location, menu, offers, reservation, and local search queries. English SEO is supported through `/en`, but Arabic metadata is the default.

## Route And Locale SEO

- Arabic public route: `/ar`.
- English public route: `/en`.
- Arabic metadata is used by default.
- English metadata is used for English pages when available.
- Language alternates should connect Arabic and English versions.
- Canonical URLs should be explicit for each locale.

## Required SEO Fields

Each public page should support:

- `seoTitleAr`
- `seoTitleEn`
- `seoDescriptionAr`
- `seoDescriptionEn`
- `ogImage`

Arabic SEO fields are required for Arabic publication. English SEO fields are required when English pages are published.

## Seafood SEO Targets

Arabic-first content should support searchable sections such as:

- منيو اليوم
- الأسماك الطازجة
- المأكولات البحرية
- الأطباق الخاصة
- طرق الطهي
- العروض
- الحجز
- تواصل معنا
- الخريطة

Menu categories, item names, price variants, cooking methods, offers, reviews, and manager/about content should be crawlable when public.

## Structured Data

Support JSON-LD structured data for:

- Restaurant.
- LocalBusiness.
- Menu.
- MenuItem.
- Offer.
- Review.
- AggregateRating only when valid.
- BreadcrumbList.

Structured data must only represent published, visible, truthful content. Do not invent ratings, reviews, prices, or availability.

## Open Graph

Open Graph data should support:

- Arabic title and description by default.
- English title and description for `/en`.
- Configurable `ogImage`.
- Restaurant brand image fallback.
- Offer-specific and page-specific images where available.

## Sitemap And Robots

The project should support:

- `sitemap.xml`.
- `robots.txt`.
- Public Arabic URLs.
- Public English URLs when enabled.
- Exclusion of admin routes.
- Exclusion of draft, archived, private, and unpublished content.

## Local SEO

Admin-managed local SEO fields should include:

- Restaurant name in Arabic and English.
- Address in Arabic and English.
- Phone and WhatsApp.
- Opening hours.
- Google Maps link or coordinates.
- Cuisine and seafood specialty descriptors.
- Social media links.

## Image SEO

- Every public image should support Arabic and English alt text.
- Seafood menu item images should describe the dish clearly.
- Gallery images should have meaningful captions.
- Manager image should have reusable alt text.
- Large images must be optimized to protect mobile performance.

## Admin SEO Controls

Admin should be able to manage:

- Page metadata.
- Open Graph image.
- Homepage SEO.
- Menu category SEO.
- Offer SEO.
- About and manager SEO.
- Gallery SEO.
- Review page SEO if applicable.

## SEO Acceptance Checklist

- `/ar` has complete Arabic metadata.
- `/en` has English metadata when enabled.
- Arabic route is the default public experience.
- `sitemap.xml` and `robots.txt` are supported.
- JSON-LD uses real published data.
- Admin pages are not indexed.
- Customer-private review, message, and reservation data is never exposed.
