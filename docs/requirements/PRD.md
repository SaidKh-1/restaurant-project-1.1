# Product Requirements Document

## Product Vision

Build a reusable Arabic-first Restaurant CMS Platform. The first implementation is a seafood restaurant website and admin dashboard where the owner can manage public content, menu items, prices, cooking methods, reservations, messages, reviews, gallery images, theme, SEO, and restaurant settings without touching code.

Arabic is the primary product language. The public website opens in Arabic by default at `/ar`. English is optional through a language switcher at `/en`. Every editable public content field must support Arabic and English, but the first-class editorial and dashboard experience is Arabic-first.

## Platform Positioning

- Project type: reusable Restaurant CMS Platform.
- First implementation: Arabic-first seafood restaurant.
- Public default route: `/ar`.
- English public route: `/en`.
- Arabic layout: RTL.
- English layout: LTR.
- Admin dashboard: Arabic-first, with English interface support possible later.
- Content source: database and admin settings wherever possible.
- Permanent hardcoded restaurant copy in application code is not allowed.

## Primary Goals

- Deliver a production-ready seafood restaurant website with strong Arabic SEO.
- Let the restaurant owner manage content, branding, menu, prices, images, reservations, messages, reviews, and SEO without developer help.
- Support English public content through a language switcher without making English the default.
- Keep the platform reusable for other restaurant types later.
- Preserve fast loading, mobile-first UX, secure admin access, and future scalability.

## Public Website Sections

The Arabic-first public website should support these sections:

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

Each section should be configurable from the admin dashboard where practical.

## Admin Dashboard Sections

The admin dashboard should be Arabic-first and include:

- لوحة التحكم
- إدارة الصفحة الرئيسية
- Hero Slider
- إدارة المنيو
- الأقسام
- الأصناف
- خيارات الأسعار
- طرق الطهي
- العروض
- الحجوزات
- الرسائل
- التقييمات
- معرض الصور
- مدير المطعم
- عن المطعم
- مكتبة الصور
- إدارة المظهر
- إعدادات SEO
- إعدادات الموقع
- المستخدمون والصلاحيات

## Core Content Requirements

- Every editable public text field supports Arabic and English.
- Arabic content is required for public publishing.
- English content is optional but supported.
- Admin should see which English fields are incomplete without blocking Arabic-first publishing unless a business rule requires both.
- Media fields should support Arabic and English alt text and captions.
- SEO fields should support Arabic and English metadata.

## Seafood Menu Requirements

The first implementation must support seafood-specific menu structures:

- الأسماك الطازجة
- المأكولات البحرية
- الأطباق الخاصة
- طرق الطهي
- خدمات المطعم

Menu items must support multiple price variants. Each item has `nameAr`, `nameEn`, `descriptionAr`, and `descriptionEn`. Each variant has `nameAr`, `nameEn`, `price`, and `unit`. Supported units include كجم، حبة، طبق، صغير، كبير.

## Operational Requirements

- Customers do not need accounts to submit reservations, messages, or reviews.
- Reviews are not published automatically by default.
- Customer emails and private contact data must never appear publicly.
- Admin can approve, reject, delete, feature, or archive reviews.
- Admin can accept, reject, edit, delete, or contact reservation customers.
- Admin can read, archive, delete, mark as read, and reply to messages by WhatsApp link, with email reply support planned later.

## Non-Functional Requirements

- Arabic SEO is primary.
- English SEO is supported.
- Public pages must be mobile-first and fast.
- Admin routes must require login.
- Roles and permissions should be planned from the start.
- All forms must be validated.
- Spam protection for contact, review, and reservation forms should be planned.
- PostgreSQL and Prisma should support a reusable, scalable content model.

## Out Of Scope For Documentation Update

- Application code.
- React components.
- Database schema or Prisma models.
- Package installation.
- `package.json` changes.
