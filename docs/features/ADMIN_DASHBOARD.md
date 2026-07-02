# Admin Dashboard

## Purpose

The admin dashboard is Arabic-first and gives the restaurant owner control over the seafood restaurant website without touching code. The interface may support English later, but current dashboard planning should prioritize Arabic owner workflows.

## Required Sections

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

## Dashboard Responsibilities

Admin users can manage:

- Public Arabic and English content.
- Seafood menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Featured and unavailable menu items.
- Homepage sections.
- Hero images.
- Offers.
- Reservations.
- Customer messages.
- Review moderation.
- Gallery images.
- Manager profile.
- About content.
- Theme settings.
- SEO settings.
- Site settings.
- Users and permissions.

## User And Permission Planning

Plan for:

- Owner with full access.
- Manager with operational access.
- Staff with limited reservations, messages, and menu availability access.
- Content editor with website content access.

Roles may be simplified in the first release, but permissions should be planned.

## Arabic-First UX

- Primary labels should be Arabic.
- Admin forms should present Arabic fields first.
- English content fields should be available for public `/en` content.
- Statuses should be clear for Arabic-speaking owners.

## Security Rules

- Admin login is required.
- Admin pages are protected.
- Mutations require server-side authorization.
- Customer private data appears only inside authorized admin views.
- Admin routes must not be indexed.

## Dashboard Quality Standard

The owner should be able to:

- Update seafood menu prices.
- Add or hide items.
- Manage cooking methods.
- Approve reviews.
- Respond to messages through WhatsApp link.
- Accept or reject reservations.
- Change theme and hero images.
- Update manager image once and see it reused everywhere.
