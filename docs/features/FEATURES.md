# Features

## Platform Feature Summary

This is a reusable Arabic-first Restaurant CMS Platform. The first implementation is for a seafood restaurant. Features should be configurable through the admin dashboard and backed by database content whenever possible.

## Language Rules

- Arabic is the default public language.
- Public website opens at `/ar`.
- English is optional at `/en`.
- Arabic pages use RTL.
- English pages use LTR.
- Admin dashboard is Arabic-first.
- Every editable public content field supports Arabic and English.

## Public Website Features

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

## Admin Dashboard Features

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

## Seafood Menu Features

- Seafood categories are editable.
- Menu items support Arabic and English names and descriptions.
- Menu items support multiple price variants.
- Admin can add, edit, and delete price variants.
- Admin can hide unavailable items.
- Admin can mark featured items.
- Cooking methods are dynamic and assignable to menu items.

## Customer Interaction Features

- Customers can submit reservations without accounts.
- Customers can send messages without accounts.
- Customers can submit reviews without accounts.
- Reviews require admin approval before public display.
- Private customer contact details are visible only to admin.

## CMS Reusability Rules

- Do not permanently hardcode seafood restaurant text in application code.
- Seafood labels and menu examples should be stored as editable content or seed data later.
- Platform should allow future restaurant types without rewriting core CMS features.

## Feature Completion Standard

A feature is complete only when it supports:

- Arabic-first UX.
- Optional English content.
- Secure admin management.
- Server-side validation.
- Mobile-first public display.
- SEO-aware public output where relevant.
- Private customer data protection.
