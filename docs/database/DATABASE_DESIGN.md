# Database Design

## Database Direction

The platform will use PostgreSQL with Prisma ORM. The database must support an Arabic-first reusable Restaurant CMS Platform, with the first implementation configured for a seafood restaurant.

This document is planning only. It does not create a schema or Prisma models.

## Core Principles

- Arabic is the primary content language.
- English content is optional but supported for every editable public content field.
- Public Arabic pages read Arabic fields by default.
- Public English pages read English fields where available.
- Restaurant content should be database-managed whenever possible.
- Seafood categories and examples should be configurable data, not permanent code.

## Candidate Core Entities

- Restaurant settings.
- Site settings.
- Theme settings.
- Homepage sections.
- Hero slides.
- Manager profile.
- About content.
- Media assets.
- Menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Offers.
- Reservations.
- Messages.
- Reviews.
- Gallery images.
- SEO metadata.
- Admin users.
- Roles and permissions.

## Bilingual Field Standard

Editable public content should use explicit Arabic and English fields or a translation model. Required examples:

- `nameAr`
- `nameEn`
- `descriptionAr`
- `descriptionEn`
- `seoTitleAr`
- `seoTitleEn`
- `seoDescriptionAr`
- `seoDescriptionEn`

Arabic values should be required for publishing Arabic public content. English values can be optional unless the English page or section is published.

## Seafood Menu Categories

The first implementation should support these default categories as data:

1. الأسماك الطازجة
2. المأكولات البحرية
3. الأطباق الخاصة
4. طرق الطهي
5. خدمات المطعم

Categories should be editable by admin and support Arabic and English names, descriptions, visibility, sort order, and optional images.

## Menu Item Model Requirements

Each menu item should support:

- `nameAr`
- `nameEn`
- `descriptionAr`
- `descriptionEn`
- Category reference.
- Image reference.
- Availability state.
- Featured state.
- Sort order.
- Optional cooking method assignments.
- One or more price variants.

Admin can add, edit, delete, hide unavailable items, and mark featured items.

## Price Variant Requirements

Each price variant should support:

- `nameAr`
- `nameEn`
- `price`
- `unit`
- Sort order.
- Active or inactive state.

Supported initial units:

- كجم
- حبة
- طبق
- صغير
- كبير

Examples include بلطي مصري with variants مقلي أو مشوي and مدخن, or طواجن بحرية with صغير and كبير.

## Cooking Methods

Cooking methods are dynamic and editable from the admin dashboard. Default methods:

- مقلي
- مشوي
- سنجاري
- مدخن
- فرن

Admin can add, edit, delete, enable, disable, and assign cooking methods to menu items. Admin can also show or hide the cooking methods section on the public website.

## Reviews Data Rules

Reviews should store:

- Full customer name.
- Email, private and admin-only.
- Optional or configurable phone.
- Rating from 1 to 5.
- Optional title.
- Required comment.
- Optional image.
- Status.
- Featured flag.
- Public name display mode.
- Created date.

Customer email must never be exposed publicly. Public pages show only approved reviews.

## Reservation Data Rules

Reservations should store:

- Name.
- Phone.
- Optional email.
- Date.
- Time.
- Guests.
- Notes.
- Status: pending, accepted, rejected, cancelled.

Admin can accept, reject, edit, delete, or contact the customer.

## Message Data Rules

Messages should store:

- Name.
- Required phone or WhatsApp.
- Optional email.
- Subject.
- Message.
- Status.
- Created date.

Phone and email are private and visible only to admin.

## Media Reuse Rule

Manager image, logo, favicon, hero images, gallery images, menu images, review images, and Open Graph images should reference reusable media records where practical. If the manager image changes once in admin, every section using that manager profile should update automatically.
