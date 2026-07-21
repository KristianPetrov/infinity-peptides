import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to prepare the payment method enum.");
}

const sql = neon(databaseUrl);

// drizzle-kit push recreates changed Postgres enums. If rows still contain the
// old value, that process can stop after converting the column to text. Repair
// both the original enum state and that partially-applied state before pushing.
await sql`
  DO $$
  DECLARE
    column_udt text;
    enum_exists boolean;
    has_venmo boolean;
    has_apple_cash boolean;
    invalid_value text;
  BEGIN
    SELECT columns.udt_name
    INTO column_udt
    FROM information_schema.columns
    WHERE columns.table_schema = 'public'
      AND columns.table_name = 'orders'
      AND columns.column_name = 'payment_method';

    -- A fresh database has no orders table yet; drizzle-kit will create it.
    IF column_udt IS NULL THEN
      RETURN;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM pg_type
      JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE pg_namespace.nspname = 'public'
        AND pg_type.typname = 'payment_method'
    ) INTO enum_exists;

    IF NOT enum_exists THEN
      IF column_udt <> 'text' THEN
        RAISE EXCEPTION 'payment_method enum is missing while orders.payment_method uses type %', column_udt;
      END IF;

      CREATE TYPE public.payment_method AS ENUM ('zelle', 'apple_cash');
    ELSE
      SELECT EXISTS (
        SELECT 1
        FROM pg_enum
        JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
        JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
        WHERE pg_namespace.nspname = 'public'
          AND pg_type.typname = 'payment_method'
          AND pg_enum.enumlabel = 'venmo'
      ) INTO has_venmo;

      SELECT EXISTS (
        SELECT 1
        FROM pg_enum
        JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
        JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
        WHERE pg_namespace.nspname = 'public'
          AND pg_type.typname = 'payment_method'
          AND pg_enum.enumlabel = 'apple_cash'
      ) INTO has_apple_cash;

      IF has_venmo AND NOT has_apple_cash THEN
        ALTER TYPE public.payment_method RENAME VALUE 'venmo' TO 'apple_cash';
      ELSIF NOT has_venmo AND NOT has_apple_cash THEN
        RAISE EXCEPTION 'payment_method enum contains neither venmo nor apple_cash';
      END IF;
    END IF;

    IF column_udt = 'text' THEN
      UPDATE public.orders
      SET payment_method = 'apple_cash'
      WHERE payment_method = 'venmo';

      SELECT payment_method
      INTO invalid_value
      FROM public.orders
      WHERE payment_method NOT IN ('zelle', 'apple_cash')
      LIMIT 1;

      IF invalid_value IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot convert unknown payment method value: %', invalid_value;
      END IF;

      ALTER TABLE public.orders
      ALTER COLUMN payment_method TYPE public.payment_method
      USING payment_method::public.payment_method;
    ELSIF column_udt = 'payment_method' AND has_venmo AND has_apple_cash THEN
      UPDATE public.orders
      SET payment_method = 'apple_cash'
      WHERE payment_method = 'venmo';
    ELSIF column_udt <> 'payment_method' THEN
      RAISE EXCEPTION 'Unexpected orders.payment_method type: %', column_udt;
    END IF;
  END
  $$;
`;

const [databaseState] = await sql`
  SELECT to_regclass('public.orders')::text AS orders_table
`;

if (!databaseState?.orders_table) {
  console.log("Fresh database detected; payment method enum will be created by drizzle-kit.");
} else {
  const state = await sql`
    SELECT payment_method::text AS method, count(*)::int AS count
    FROM public.orders
    GROUP BY payment_method
    ORDER BY payment_method
  `;

  console.log("Payment method enum is ready:", state);
}
