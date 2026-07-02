# UI UX Plan

## UI Direction

The platform UI is Arabic-first. The first restaurant website should feel fresh, appetizing, premium, and seafood-focused while remaining configurable for future restaurants.

The public website opens in Arabic at `/ar`, uses RTL layout, and presents seafood sections naturally for Arabic-speaking customers. English is available at `/en` through a language switcher and uses LTR layout.

## Arabic-First Public Sections

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

The admin should be able to show or hide homepage sections. Reordering sections should be supported later if practical.

## Public UX Priorities

- Make Arabic browsing feel native, not translated.
- Prioritize seafood menu discovery.
- Make prices, units, and variants easy to scan.
- Make WhatsApp, reservation, map, and contact actions obvious on mobile.
- Use strong food imagery without hurting performance.
- Keep language switching visible but secondary to the Arabic-first flow.

## Admin UX Priorities

The admin dashboard is Arabic-first and should be understandable to a restaurant owner:

- لوحة التحكم
- إدارة الصفحة الرئيسية
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
- إدارة المظهر
- إعدادات SEO
- إعدادات الموقع

Admin English interface support can be added later, but all editable public content fields must support Arabic and English from the start.

## Menu UX Rules

- Items can have multiple price variants.
- Variant names and units should be visible and easy to compare.
- Unavailable items can be hidden by admin.
- Featured items should stand out visually.
- Cooking methods should be displayed only when enabled.
- Seafood categories should be prominent in Arabic.

## Review UX Rules

- Customers can submit reviews without accounts.
- Review form should ask for customer name, email, rating, comment, and optional fields.
- Email is private and must never appear publicly.
- Public cards show rating, displayed name, comment, optional image, and created date.
- Admin controls how names appear publicly: full name, first name only, or shortened name.

## Theme Builder UX Rules

Admin can change:

- Primary color.
- Secondary color.
- Button color.
- Header color.
- Footer color.
- Logo.
- Favicon.
- Hero images.
- Homepage section visibility.

Theme customization should remain guided so the owner cannot accidentally break readability, contrast, or brand consistency.

## Accessibility And Directionality

- Arabic pages use RTL.
- English pages use LTR.
- Use logical spacing and alignment.
- Keep focus states visible.
- Ensure color contrast after theme changes.
- Provide useful alt text in Arabic and English.
- Make forms keyboard-accessible and mobile-friendly.

## Mobile-First Standard

Customers should be able to:

- Open `/ar`.
- Browse seafood menu categories.
- Understand price variants.
- See cooking methods.
- Submit a reservation.
- Send a message.
- Submit a review.
- Open WhatsApp.
- Open the map.

All should be possible comfortably from a phone.
