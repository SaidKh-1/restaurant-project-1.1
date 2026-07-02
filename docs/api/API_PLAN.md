# API Plan

## API Objective

The API layer should support an Arabic-first seafood restaurant CMS with secure admin mutations, public customer submissions, bilingual content reads, and future integration growth.

This document is planning only and does not define implemented endpoints.

## Public Read Needs

Public pages should read published content for:

- `/ar` Arabic default pages.
- `/en` English optional pages.
- Homepage sections.
- Hero slider.
- Seafood menu categories.
- Menu items and price variants.
- Cooking methods.
- Offers.
- Gallery.
- Approved reviews.
- Manager profile.
- About content.
- Contact settings.
- Google Maps and WhatsApp data.
- SEO metadata.

Public responses must exclude private admin fields and unpublished content.

## Public Submission Needs

Customers can submit:

- Reviews.
- Messages from تواصل معنا.
- Reservations.

Customers do not need accounts for these submissions.

## Review Submission Contract

Review form fields:

- `customerName` required.
- `email` required, private, visible only to admin.
- `phone` optional or configurable.
- `rating` required from 1 to 5.
- `title` optional.
- `comment` required.
- `image` optional.

Reviews default to pending and require admin approval before public display.

## Message Submission Contract

Message form fields:

- `name` required.
- `phone` or WhatsApp required.
- `email` optional.
- `subject` required.
- `message` required.

Messages appear in the admin dashboard. Phone and email are private.

## Reservation Submission Contract

Reservation form fields:

- `name`
- `phone`
- `email` optional.
- `date`
- `time`
- `guests`
- `notes`

Reservation statuses:

- pending
- accepted
- rejected
- cancelled

## Admin API Needs

Admin can manage:

- Homepage sections.
- Hero slider.
- Menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Offers.
- Reservations.
- Messages.
- Reviews.
- Gallery.
- Manager profile.
- About content.
- Media library.
- Theme settings.
- SEO settings.
- Site settings.
- Users and permissions.

All admin mutations require authentication, authorization, and server-side validation.

## Public Review Response Rules

Public visitors only see approved or published reviews. Public review cards show:

- Rating.
- Displayed name.
- Comment.
- Optional image.
- Created date.

Public responses must not include email, phone, internal status history, or admin notes.

## Error And Validation Rules

APIs should produce clear errors for:

- Missing required fields.
- Invalid rating.
- Invalid date or time.
- Invalid price or unit.
- Invalid image.
- Unauthorized admin access.
- Forbidden action.
- Not found content.
- Spam or rate-limited submission.

## Future Integration Needs

- WhatsApp reply links.
- Email replies for messages.
- Reservation notifications.
- Calendar integration.
- Analytics events.
- Online ordering.
- Payment provider webhooks.
