# Project Architecture

## Architecture Identity

This project is an Arabic-first reusable Restaurant CMS Platform built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM. The first implementation targets a seafood restaurant, but the architecture must avoid permanent hardcoded restaurant text so the platform can be reused for other restaurants later.

## Routing Model

- Arabic is the default public experience.
- Default public route: `/ar`.
- English public route: `/en`.
- Arabic pages use RTL layout.
- English pages use LTR layout.
- The root route should direct users to the Arabic experience unless a later locale detection rule is intentionally designed.
- Admin dashboard is Arabic-first. English admin UI can be added later.

## High-Level Areas

- Public website: Arabic-first seafood restaurant pages and sections.
- Admin dashboard: Arabic-first CMS for all owner-managed content.
- Content management layer: bilingual public content, seafood menu data, theme settings, SEO metadata, and media.
- Data access layer: Prisma-backed PostgreSQL access organized by feature domain.
- Integration layer: Google Maps, WhatsApp links, social links, image storage, and future notification services.

## Public Website Architecture

The public website should render database-managed content for:

- الرئيسية
- منيو اليوم
- الأسماك الطازجة
- المأكولات البحرية
- الأطباق الخاصة
- طرق الطهي
- العروض
- عن المطعم
- مدير المطعم
- معرض الصور
- التقييمات
- الحجز
- تواصل معنا
- الخريطة
- الفوتر

Public pages should be optimized for Arabic SEO first, with English equivalents available through `/en` when content exists.

## Admin Architecture

The admin dashboard should manage:

- Homepage and hero slider.
- Menu categories, items, price variants, and cooking methods.
- Offers, gallery, reviews, reservations, messages, manager profile, about content, theme, SEO, site settings, users, and permissions.

Admin mutations must validate input, check authentication, and enforce permissions on the server. UI visibility alone is not authorization.

## Content Source Rules

- Restaurant-specific text should come from database records or admin settings when possible.
- Seafood examples may be used as seed or demo content later, but should not be permanently embedded in components.
- Editable content must support Arabic and English fields.
- Arabic fields are primary and should be complete before Arabic public publishing.

## Seafood Domain Model Areas

The architecture should account for:

- Menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Item availability.
- Featured items.
- Homepage section visibility.
- Manager profile reuse across homepage, about page, and manager section.

## Next.js App Router Principles

- Prefer Server Components for public content rendering.
- Use Client Components only for interactive controls such as sliders, forms, upload widgets, and dashboard interactions.
- Generate metadata dynamically per locale.
- Keep `/ar` and `/en` behavior explicit.
- Protect admin layouts and routes at the server boundary.

## Scalability Principles

- Keep the platform reusable for different restaurants.
- Keep seafood-specific categories configurable in the database.
- Avoid coupling public page sections to one restaurant's fixed text.
- Preserve a future path for multi-location support, staff permissions, notifications, analytics, and online ordering.

## Architecture Constraints

- Do not write application code from this documentation task.
- Do not modify the `app` folder from documentation-only tasks.
- Do not modify `package.json` unless a future implementation task explicitly approves dependency changes.
- Do not hardcode permanent restaurant content in application components.
