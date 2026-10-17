-- Cards get an identifier: their identity in exported and imported files, unique
-- per user (the id stays internal). Existing cards get a short random one, like
-- the API makes for new cards: 6 lowercase letters and digits without look-alikes.
CREATE FUNCTION pg_temp.card_identifier() RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT string_agg(substr('abcdefghjkmnpqrstuvwxyz23456789', 1 + floor(random() * 31)::int, 1), '') FROM generate_series(1, 6)
$$;--> statement-breakpoint
ALTER TABLE "card" ADD COLUMN "identifier" text;--> statement-breakpoint
UPDATE "card" SET "identifier" = pg_temp.card_identifier();--> statement-breakpoint
-- Re-roll the rare clash within one user's cards until there are none.
DO $$
BEGIN
  LOOP
    UPDATE "card" SET "identifier" = pg_temp.card_identifier()
    WHERE "id" IN (
      SELECT "id" FROM (
        SELECT "id", row_number() OVER (PARTITION BY "user_id", "identifier" ORDER BY "id") AS n FROM "card"
      ) d WHERE n > 1
    );
    EXIT WHEN NOT FOUND;
  END LOOP;
END
$$;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "identifier" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "card_user_identifier_idx" ON "card" USING btree ("user_id","identifier");
