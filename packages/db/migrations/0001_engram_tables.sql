CREATE TABLE "card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"deck_id" uuid NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"hint" text,
	"extra" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"suspended" boolean DEFAULT false NOT NULL,
	"buried_until" timestamp with time zone,
	"state" smallint DEFAULT 0 NOT NULL,
	"due" timestamp with time zone DEFAULT now() NOT NULL,
	"interval" integer DEFAULT 0 NOT NULL,
	"ease" real DEFAULT 0 NOT NULL,
	"stability" real DEFAULT 0 NOT NULL,
	"difficulty" real DEFAULT 0 NOT NULL,
	"step" smallint DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"last_review" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_quest" (
	"user_id" text NOT NULL,
	"day" text NOT NULL,
	"metric" text NOT NULL,
	"target" integer NOT NULL,
	"xp" integer NOT NULL,
	"coins" integer NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "daily_quest_user_id_day_metric_pk" PRIMARY KEY("user_id","day","metric")
);
--> statement-breakpoint
CREATE TABLE "deck" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"preset_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT 'book' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck_preset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"new_per_day" integer DEFAULT 20 NOT NULL,
	"reviews_per_day" integer DEFAULT 200 NOT NULL,
	"learning_steps" text[] DEFAULT '{1m,10m}'::text[] NOT NULL,
	"graduating_interval" integer DEFAULT 1 NOT NULL,
	"easy_interval" integer DEFAULT 4 NOT NULL,
	"new_card_order" text DEFAULT 'sequential' NOT NULL,
	"relearning_steps" text[] DEFAULT '{10m}'::text[] NOT NULL,
	"minimum_interval" integer DEFAULT 1 NOT NULL,
	"leech_threshold" integer DEFAULT 8 NOT NULL,
	"leech_action" text DEFAULT 'tag' NOT NULL,
	"maximum_interval" integer DEFAULT 36500 NOT NULL,
	"starting_ease" real DEFAULT 2.5 NOT NULL,
	"easy_bonus" real DEFAULT 1.3 NOT NULL,
	"interval_modifier" real DEFAULT 1 NOT NULL,
	"hard_interval" real DEFAULT 1.2 NOT NULL,
	"new_interval" real DEFAULT 0 NOT NULL,
	"fsrs" boolean DEFAULT false NOT NULL,
	"desired_retention" real DEFAULT 0.9 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"last_sent_day" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscription_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "review_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_id" uuid NOT NULL,
	"deck_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"state_before" smallint NOT NULL,
	"state_after" smallint NOT NULL,
	"interval_before" integer NOT NULL,
	"interval_after" integer NOT NULL,
	"ease_after" real NOT NULL,
	"duration_ms" integer NOT NULL,
	"memory_before" jsonb,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"day" text NOT NULL,
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streak_freeze" (
	"user_id" text NOT NULL,
	"day" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "streak_freeze_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"daily_goal" integer DEFAULT 100 NOT NULL,
	"rollover_hour" smallint DEFAULT 4 NOT NULL,
	"learn_ahead_minutes" smallint DEFAULT 20 NOT NULL,
	"time_zone" text DEFAULT 'UTC' NOT NULL,
	"streak_freezes" smallint DEFAULT 1 NOT NULL,
	"reminder_hour" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "support_level" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_quest" ADD CONSTRAINT "daily_quest_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_parent_id_deck_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_preset_id_deck_preset_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."deck_preset"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_preset" ADD CONSTRAINT "deck_preset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_log" ADD CONSTRAINT "review_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_log" ADD CONSTRAINT "review_log_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_log" ADD CONSTRAINT "review_log_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward" ADD CONSTRAINT "reward_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_freeze" ADD CONSTRAINT "streak_freeze_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_user_due_idx" ON "card" USING btree ("user_id","due");--> statement-breakpoint
CREATE INDEX "card_deck_state_idx" ON "card" USING btree ("deck_id","state","due");--> statement-breakpoint
CREATE INDEX "deck_user_idx" ON "deck" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deck_parent_idx" ON "deck" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "deck_preset_user_idx" ON "deck_preset" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deck_preset_one_default_idx" ON "deck_preset" USING btree ("user_id") WHERE "deck_preset"."is_default";--> statement-breakpoint
CREATE INDEX "push_subscription_user_idx" ON "push_subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_log_user_time_idx" ON "review_log" USING btree ("user_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "review_log_card_idx" ON "review_log" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_once_idx" ON "reward" USING btree ("user_id","day","kind","key");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");