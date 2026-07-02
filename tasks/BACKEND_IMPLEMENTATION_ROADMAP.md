# Backend Implementation Roadmap

## Purpose

This roadmap defines the step-by-step backend implementation plan for Phase 3 of the Arabic-first Seafood Restaurant CMS Platform.

This is a planning document only. Do not implement these steps until the owner approves the roadmap.

## Backend Goals

- Use PostgreSQL as the production database.
- Use Prisma ORM for database access and migrations.
- Preserve Arabic as the default public language.
- Support English content through translation tables.
- Keep the CMS reusable for future restaurants.
- Protect admin routes with authentication, roles, and permissions.
- Keep customer private data out of public APIs.
- Support the admin dashboard and public website through backend services and REST APIs.

## Implementation Rules

- Do not write application code before approval.
- Do not modify the `app` folder before approval.
- Do not install packages before approval.
- Do not modify `package.json` before approval.
- Do not create a Prisma schema before approval.
- Before writing Next.js backend code, read the relevant guide in `node_modules/next/dist/docs/`.

## Phase 0: Pre-Implementation Review

### Objective

Confirm the approved backend scope before any code changes.

### Steps

1. Review `docs/database/ENTITY_RELATIONSHIP.md`.
2. Review `docs/database/TABLES.md`.
3. Review `docs/database/RELATIONS.md`.
4. Review `docs/security/SECURITY_PLAN.md`.
5. Review `docs/api/API_PLAN.md`.
6. Review `docs/bilingual/BILINGUAL_RULES.md`.
7. Review relevant Next.js App Router documentation in `node_modules/next/dist/docs/`.
8. Confirm local PostgreSQL or hosted PostgreSQL target.
9. Confirm file upload storage strategy.
10. Confirm authentication strategy.

### Approval Gate

Stop if any database table, auth strategy, upload strategy, or API boundary needs changes.

## Phase 1: Install Required Packages

### Objective

Install only the packages needed for the approved backend foundation.

### Package Categories

- Prisma tooling.
- Prisma client.
- Server-side validation.
- Password hashing.
- Authentication/session helpers if needed.
- File upload helpers if needed.
- Image processing if approved.

### Candidate Packages

- `prisma`
- `@prisma/client`
- `zod`
- `argon2` or `bcryptjs`
- `jose` if token-based auth is selected.
- `sharp` if server-side image processing is approved.

### Steps

1. Confirm final dependency list.
2. Install packages through the project package manager.
3. Verify `package.json` and lockfile changes are expected.
4. Document why each dependency exists.

### Acceptance Criteria

- No unnecessary dependency is added.
- Auth and upload dependencies match the approved architecture.
- Package changes are reviewed before continuing.

## Phase 2: Configure PostgreSQL

### Objective

Prepare PostgreSQL for local development and future production deployment.

### Steps

1. Choose local PostgreSQL setup: local service, Docker, or hosted development database.
2. Create a development database for the CMS.
3. Create a least-privilege database user for the app.
4. Confirm database encoding supports Arabic text.
5. Confirm timezone expectations.
6. Confirm database backup expectations for production.
7. Document development, staging, and production database separation.

### Acceptance Criteria

- Development database is reachable.
- Arabic text storage is verified.
- Database credentials are not committed.
- Production database setup remains separate from development.

## Phase 3: Configure Prisma

### Objective

Initialize Prisma after database and package decisions are approved.

### Steps

1. Initialize Prisma configuration.
2. Configure Prisma datasource for PostgreSQL.
3. Configure Prisma client generation.
4. Decide Prisma output conventions.
5. Add a safe Prisma client access pattern for server-side backend code.
6. Document Prisma migration workflow.

### Acceptance Criteria

- Prisma is configured for PostgreSQL.
- Prisma does not expose database credentials.
- Prisma workflow supports development and production migrations.

## Phase 4: Configure Environment Variables

### Objective

Define environment variables required by the backend without committing secrets.

### Required Environment Areas

- Database connection.
- Authentication secrets.
- Session or token configuration.
- Application base URL.
- Upload storage.
- Public media URL.
- Optional Google Maps configuration.
- Optional email or notification configuration later.

### Planned Variables

- `DATABASE_URL`
- `DIRECT_URL` if required by the deployment provider.
- `AUTH_SECRET`
- `SESSION_COOKIE_NAME`
- `APP_URL`
- `UPLOAD_PROVIDER`
- `UPLOAD_DIR` or storage provider credentials.
- `PUBLIC_MEDIA_BASE_URL`
- `GOOGLE_MAPS_API_KEY` if needed later.

### Steps

1. Create local environment template documentation.
2. Add local secret values only to ignored environment files.
3. Confirm `.gitignore` protects secret files.
4. Document staging and production environment requirements.

### Acceptance Criteria

- No secret is committed.
- Local development variables are clear.
- Production variables are documented.

## Phase 5: Create Prisma Schema

### Objective

Translate the documented database architecture into Prisma models.

### Model Groups

- Restaurant and settings.
- Translations.
- Media assets.
- Theme settings.
- Homepage sections.
- Hero slides.
- Menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Offers.
- Gallery.
- Reviews.
- Contact messages.
- Reservations.
- SEO entries.
- Users.
- Roles.
- Permissions.
- Sessions.
- Audit logs.

### Steps

1. Define enums for locale, statuses, units, roles, visibility, and review name display mode.
2. Define base restaurant and settings models.
3. Define translation models with unique parent-plus-locale constraints.
4. Define media asset and media translation models.
5. Define theme settings and media references.
6. Define homepage and hero slider models.
7. Define menu models, price variants, and cooking method join table.
8. Define offer and gallery models.
9. Define review, message, and reservation models.
10. Define SEO models.
11. Define user, role, permission, session, and audit models.
12. Add indexes for common public and admin query paths.
13. Review referential actions before migration generation.

### Acceptance Criteria

- Schema matches `docs/database/TABLES.md`.
- Relations match `docs/database/RELATIONS.md`.
- Arabic and English translation strategy is normalized.
- Customer private data is modeled but not public by default.
- Referential actions are intentional.

## Phase 6: Generate Migrations

### Objective

Create and review database migrations from the approved Prisma schema.

### Steps

1. Generate the initial migration.
2. Review SQL output before applying to shared environments.
3. Apply migration to the development database.
4. Run Prisma client generation.
5. Validate tables, indexes, constraints, and foreign keys.
6. Document rollback expectations.

### Acceptance Criteria

- Migration applies cleanly.
- Database tables match the documented architecture.
- Constraints protect translation uniqueness and join table uniqueness.
- Prisma client generation succeeds.

## Phase 7: Seed Default Data

### Objective

Seed the minimum required Arabic-first seafood CMS data for development.

### Seed Groups

- Default restaurant.
- Arabic restaurant translation.
- Optional English restaurant translation.
- Restaurant settings.
- Contact settings.
- Theme settings.
- Homepage sections.
- Hero placeholder records if approved.
- Default seafood categories.
- Default cooking methods.
- Default roles.
- Default permissions.
- Owner admin user.
- SEO entries for core public routes.

### Default Seafood Categories

1. الأسماك الطازجة
2. المأكولات البحرية
3. الأطباق الخاصة
4. طرق الطهي
5. خدمات المطعم

### Default Cooking Methods

- مقلي
- مشوي
- سنجاري
- مدخن
- فرن

### Acceptance Criteria

- `/ar` content foundation exists.
- English records are optional and clearly marked.
- Owner role has full permissions.
- Staff and content roles can be added safely.
- Seed data is idempotent.

## Phase 8: Authentication

### Objective

Protect the Arabic-first admin dashboard and admin APIs.

### Steps

1. Confirm session-based or token-based auth strategy.
2. Implement password hashing.
3. Implement login.
4. Implement logout.
5. Implement session validation.
6. Implement admin route protection.
7. Protect admin API mutations.
8. Track failed login attempts or prepare rate limiting.
9. Ensure secure cookie settings for production.

### Acceptance Criteria

- Admin login is required.
- Admin pages are protected.
- Admin APIs reject unauthenticated requests.
- Passwords are never stored in plain text.
- Sessions can expire or be revoked.

## Phase 9: Roles And Permissions

### Objective

Enforce backend authorization for owner, manager, staff, and content editor workflows.

### Steps

1. Define permission keys.
2. Seed default permissions.
3. Seed default roles.
4. Assign owner role to the initial admin user.
5. Create backend permission-check helpers.
6. Add authorization checks to every admin mutation.
7. Add audit logs for sensitive actions.

### Permission Groups

- Dashboard.
- Menu.
- Cooking methods.
- Offers.
- Reservations.
- Messages.
- Reviews.
- Gallery.
- Manager profile.
- Theme.
- SEO.
- Settings.
- Users and permissions.

### Acceptance Criteria

- Authorization is enforced server-side.
- Owner can manage everything.
- Staff can be restricted later.
- Sensitive changes are auditable.

## Phase 10: REST API

### Objective

Create a secure REST API layer for admin operations and public submissions.

### API Design Rules

- Public read APIs return only published content.
- Public write APIs allow no-account submissions for reviews, messages, and reservations.
- Admin APIs require authentication.
- Admin mutations require permissions.
- All inputs are validated server-side.
- Customer private data is never returned publicly.

### Public API Groups

- Public restaurant settings.
- Public homepage.
- Public hero slider.
- Public menu categories and items.
- Public cooking methods.
- Public offers.
- Public gallery.
- Public approved reviews.
- Public contact settings.
- Public SEO metadata.
- Public reservation submission.
- Public message submission.
- Public review submission.

### Admin API Groups

- Auth.
- Dashboard summary.
- Restaurant settings.
- Contact settings.
- Social links.
- Theme settings.
- Homepage sections.
- Hero slides.
- Menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Offers.
- Gallery and media.
- Reviews moderation.
- Messages.
- Reservations.
- Manager profile.
- SEO entries.
- Users.
- Roles.
- Permissions.

### Acceptance Criteria

- REST endpoints follow consistent response and error shapes.
- Validation errors are clear.
- Admin-only fields stay private.
- Public APIs are locale-aware and Arabic-first.

## Phase 11: File Uploads

### Objective

Support secure image uploads for CMS features.

### Upload Use Cases

- Logo.
- Favicon.
- Hero images.
- Manager image.
- Menu item images.
- Offer images.
- Gallery images.
- Review images.
- Open Graph images.

### Steps

1. Confirm local or external storage provider.
2. Define allowed image MIME types.
3. Define file size limits.
4. Generate safe storage keys.
5. Store media metadata in `media_assets`.
6. Store Arabic and English alt text in `media_translations`.
7. Restrict review image display until review approval.
8. Prevent deletion of media still referenced by public records.

### Acceptance Criteria

- Uploads validate type and size.
- Original filenames are not trusted.
- Media records are reusable.
- Public image metadata supports Arabic and English.

## Phase 12: Admin Dashboard Backend

### Objective

Provide backend services for every Arabic-first admin dashboard section.

### Admin Backend Modules

- لوحة التحكم summary.
- إدارة الصفحة الرئيسية.
- Hero Slider.
- إدارة المنيو.
- الأقسام.
- الأصناف.
- خيارات الأسعار.
- طرق الطهي.
- العروض.
- الحجوزات.
- الرسائل.
- التقييمات.
- معرض الصور.
- مدير المطعم.
- عن المطعم.
- مكتبة الصور.
- إدارة المظهر.
- إعدادات SEO.
- إعدادات الموقع.
- المستخدمون والصلاحيات.

### Steps

1. Build service boundaries by domain.
2. Add admin list, detail, create, update, publish, archive, delete, and reorder operations where needed.
3. Add Arabic-first translation validation.
4. Add optional English completeness warnings.
5. Add permission checks.
6. Add audit logs for sensitive actions.
7. Add dashboard summary queries.

### Acceptance Criteria

- Owner can manage all CMS content through backend APIs.
- Unavailable menu items can be hidden.
- Featured items, offers, gallery images, and reviews can be selected.
- Reviews require approval before public visibility.
- Manager profile image updates everywhere through one reference.

## Phase 13: Public Website Backend

### Objective

Provide backend data for the Arabic-first public website and optional English website.

### Public Backend Modules

- `/ar` default restaurant shell data.
- `/en` optional English shell data.
- Homepage sections.
- Hero slider.
- Menu categories.
- Menu items.
- Price variants.
- Cooking methods.
- Offers.
- Manager profile.
- About content.
- Gallery.
- Approved reviews.
- Contact settings.
- Map data.
- SEO metadata.
- Sitemap data.
- Robots rules.
- JSON-LD structured data.

### Steps

1. Build locale-aware public query services.
2. Ensure Arabic is the default locale.
3. Add fallback rules that never show broken placeholders.
4. Filter by published status, visibility, active dates, and locale availability.
5. Exclude private customer fields.
6. Build metadata query helpers.
7. Build sitemap query helpers.
8. Build structured data query helpers.

### Acceptance Criteria

- `/ar` reads Arabic public content by default.
- `/en` reads English content only when enabled and available.
- Public reviews include only approved display fields.
- Messages and reservations are never public.
- SEO uses Arabic metadata by default.
- Public data is fast, filtered, and safe.

## Final Backend Readiness Checklist

- Required packages approved.
- PostgreSQL configured.
- Prisma configured.
- Environment variables documented and protected.
- Prisma schema reviewed before migration.
- Migrations reviewed before application.
- Seed data idempotent.
- Authentication protects admin routes.
- Roles and permissions enforce server-side authorization.
- REST APIs validate all inputs.
- Uploads are secure.
- Admin backend covers all dashboard sections.
- Public backend supports Arabic-first pages and optional English pages.
- No private customer data appears publicly.

## Stop Point

Stop here and wait for owner approval before implementation.
