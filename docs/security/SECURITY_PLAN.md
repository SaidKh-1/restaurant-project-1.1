# Security Plan

## Security Objective

Protect the Arabic-first seafood restaurant CMS, admin dashboard, customer reviews, messages, reservations, image uploads, and private contact data.

## Core Rules

- Admin login is required.
- Admin pages are protected.
- Use roles and permissions.
- Validate all forms.
- Protect contact, review, and reservation forms from spam later.
- Customer private data must never appear publicly.

## Admin Security

Admin sections such as لوحة التحكم, إدارة المنيو, الحجوزات, الرسائل, التقييمات, إعدادات SEO, إعدادات الموقع, and المستخدمون والصلاحيات must require authentication.

Authorization should be planned for:

- Owner.
- Manager.
- Staff.
- Content editor.

The first release may use fewer roles, but the design should not block role expansion.

## Private Customer Data

Private fields include:

- Review email.
- Review phone.
- Message phone or WhatsApp.
- Message email.
- Reservation phone.
- Reservation email.
- Internal admin notes.

These fields are visible only to authorized admin users and must not be exposed in public pages, metadata, sitemap, Open Graph, JSON-LD, or public API responses.

## Review Security

- Customers do not need accounts to submit reviews.
- Reviews are not published automatically by default.
- Admin must approve reviews before public display.
- Customer email is required but private.
- Optional review image must be validated before storage and display.
- Admin can approve, reject, delete, feature, or archive reviews.

## Message Security

- Messages from تواصل معنا must validate name, phone or WhatsApp, subject, and message.
- Phone and email are private.
- Admin can read, archive, delete, mark as read, reply by WhatsApp link, or reply by email later.
- Message content must be displayed safely in admin.

## Reservation Security

- Customers do not need accounts.
- Reservation fields must be validated.
- Admin can accept, reject, edit, delete, or contact customer.
- Reservation data is private operational data.

## Upload Security

- Validate file type.
- Validate file size.
- Do not trust original filenames.
- Store media metadata.
- Restrict optional review image uploads.
- Restrict admin-uploaded logo, favicon, hero, gallery, manager, menu, and Open Graph images.

## Form Abuse Protection

Plan spam protection for:

- Contact messages.
- Customer reviews.
- Reservations.
- Login attempts.

Initial tools may include rate limiting, hidden fields, IP throttling, moderation, and later CAPTCHA if needed.

## Implementation Constraints

- Do not rely on client-side validation alone.
- Do not expose admin routes to crawlers.
- Do not show unpublished reviews.
- Do not publish private customer data.
- Do not allow arbitrary HTML from admin or customers without a strict sanitization strategy.
