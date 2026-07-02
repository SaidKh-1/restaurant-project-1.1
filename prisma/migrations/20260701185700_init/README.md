# Initial Migration Notes

## Rollback Expectations

This initial migration creates the full CMS database foundation for the development Neon database.

Prisma Migrate does not generate automatic down migrations. For this development database, rollback should be handled by resetting the development database with Prisma Migrate if seeded or test data can be discarded.

For any shared staging or production environment later, do not reset the database. Take a verified backup before applying migrations and roll back with a restore or a reviewed manual corrective migration.
