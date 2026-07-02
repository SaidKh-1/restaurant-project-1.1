# Reviews

## Purpose

The reviews system lets customers submit feedback without creating accounts. Reviews are private by default until approved by admin.

## Customer Account Rule

Customers do not need to create accounts to submit reviews.

## Public Review Form Fields

- `customerName` required.
- `email` required, private, visible only to admin.
- `phone` optional or configurable.
- `rating` required from 1 to 5.
- `title` optional.
- `comment` required.
- `image` optional.

## Privacy Rules

- Customer email must never appear publicly.
- Customer phone must never appear publicly.
- Admin review details show full private data.
- Public review cards show only approved display data.

## Moderation Rules

- Reviews are not published automatically by default.
- Admin must approve reviews before they appear on the public website.
- Public visitors only see approved or published reviews.

## Admin Actions

Admin can:

- Approve reviews.
- Reject reviews.
- Delete reviews.
- Feature reviews.
- Archive reviews.

## Public Name Display Modes

Admin can choose:

- Full name مثل أحمد محمد
- First name only مثل أحمد
- Shortened name مثل أحمد م.

## Public Review Card

Public review card shows:

- Rating.
- Displayed name.
- Comment.
- Optional image.
- Created date.

## Admin Review Details

Admin review details show:

- Full customer name.
- Email.
- Phone if provided.
- Rating.
- Title.
- Comment.
- Image.
- Status.

## SEO Rules

- Only approved and publicly visible reviews may be used in public pages.
- Do not expose private email or phone through metadata or structured data.
- Do not generate aggregate rating structured data unless it is accurate and based on published reviews.

## Future Enhancements

- Review image moderation.
- Spam detection.
- Review reply from admin.
- External review source links.
- Featured review ordering.
