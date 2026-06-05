/**
 * Add 'admin' role to users.role column.
 *
 * Knex's table.enum() in this version creates a CHECK constraint,
 * not a native PostgreSQL enum type. This migration handles both
 * cases so it works regardless of the Knex version.
 */
export function up(knex) {
  return knex.schema.raw(`
    DO $$
    BEGIN
      -- Case 1: Native PostgreSQL enum type exists
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role') THEN
        ALTER TYPE users_role ADD VALUE IF NOT EXISTS 'admin';
      -- Case 2: CHECK constraint — drop old, add new with 'admin'
      ELSE
        ALTER TABLE users
          DROP CONSTRAINT IF EXISTS users_role_check,
          ADD CONSTRAINT users_role_check
            CHECK (role IN ('student', 'lecturer', 'lab-coordinator', 'admin'));
      END IF;
    END
    $$;
  `);
}

export function down(knex) {
  // PostgreSQL does not support removing values from an enum type.
  // For the check-constraint path, reverting would mean dropping the
  // constraint and re-adding it without 'admin'. We skip this because
  // the enum already existed in production and 'admin' is additive.
  return knex.schema.raw('SELECT 1');
}
