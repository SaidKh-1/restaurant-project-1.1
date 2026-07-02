# Messages

## Purpose

The messages system lets customers contact the restaurant from تواصل معنا without creating an account. Messages appear in the admin dashboard for follow-up.

## Public Form Fields

Customers submit:

- `name` required.
- `phone` or WhatsApp required.
- `email` optional.
- `subject` required.
- `message` required.

The form is Arabic-first and should also support English labels under `/en`.

## Privacy Rules

- Customer phone is private.
- Customer email is private.
- Private contact data is visible only to admin.
- Public pages, metadata, and structured data must never expose message contact data.

## Admin Actions

Admin can:

- Read messages.
- Archive messages.
- Delete messages.
- Mark messages as read.
- Reply by WhatsApp link.
- Reply by email later.

## Message Statuses

Recommended statuses:

- new
- read
- archived
- deleted

## Validation And Spam

- Name is required.
- Phone or WhatsApp is required.
- Subject is required.
- Message is required.
- Email must be valid if provided.
- Message text should have length limits.
- Spam protection should be added later.

## Future Enhancements

- Email reply tracking.
- Staff assignment.
- Labels.
- Search and filters.
- Notification emails.
- WhatsApp templates.
