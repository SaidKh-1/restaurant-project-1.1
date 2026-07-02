# Reservations

## Purpose

The reservation system lets customers request a table without creating an account. Admin manages requests from the Arabic-first dashboard.

## Public Form Fields

Customers submit:

- `name`
- `phone`
- `email` optional.
- `date`
- `time`
- `guests`
- `notes`

The form should appear in the الحجز section and support Arabic-first UX.

## Customer Account Rule

Customers do not need accounts to create reservations.

## Reservation Statuses

- pending
- accepted
- rejected
- cancelled

Statuses can be displayed in Arabic in admin while stored as stable values.

## Admin Actions

Admin can:

- View reservations.
- Accept reservations.
- Reject reservations.
- Edit reservations.
- Delete reservations.
- Contact customer.

Customer phone and email are private and visible only to admin.

## Validation Rules

- Name is required.
- Phone is required.
- Email is optional but must be valid if provided.
- Date is required.
- Time is required.
- Guests count is required and must be valid.
- Notes should have a safe length limit.

## Security And Spam

- Validate all reservation form fields.
- Plan spam protection later.
- Do not expose reservation data publicly.
- Protect reservation management behind admin login.

## Future Enhancements

- Opening-hours validation.
- Capacity rules.
- Table assignment.
- WhatsApp confirmation.
- Email confirmation.
- Calendar integration.
- Automated reminders.
