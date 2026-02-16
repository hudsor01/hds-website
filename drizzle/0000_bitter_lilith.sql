CREATE TABLE "ab_test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_name" text NOT NULL,
	"variant_name" text NOT NULL,
	"session_id" text,
	"user_id" text,
	"converted" boolean DEFAULT false,
	"conversion_event" text,
	"conversion_value" numeric,
	"properties" jsonb,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversion_funnel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funnel_name" text NOT NULL,
	"step_name" text NOT NULL,
	"step_order" integer NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"page_path" text,
	"completed" boolean DEFAULT false,
	"completion_time" timestamp with time zone,
	"time_to_complete" integer,
	"properties" jsonb,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"category" text,
	"action" text,
	"label" text,
	"value" numeric,
	"properties" jsonb,
	"session_id" text,
	"user_id" text,
	"url" text,
	"pathname" text,
	"user_agent" text,
	"ip_address" "inet",
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pathname" text NOT NULL,
	"page_title" text,
	"page_views" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"avg_time_on_page" numeric,
	"bounce_rate" numeric,
	"exit_rate" numeric,
	"date" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "web_vitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" numeric NOT NULL,
	"rating" text,
	"delta" numeric,
	"navigation_type" text,
	"url" text,
	"pathname" text,
	"session_id" text,
	"user_agent" text,
	"ip_address" "inet",
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"profile_image" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blog_authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_post_tags" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "blog_post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"feature_image" text,
	"published_at" timestamp with time zone,
	"reading_time" integer DEFAULT 5 NOT NULL,
	"featured" boolean DEFAULT false,
	"published" boolean DEFAULT true,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "blog_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"category" text NOT NULL,
	"published" boolean DEFAULT false,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "help_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "testimonial_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"project_name" text,
	"message" text,
	"status" text DEFAULT 'pending',
	"submitted_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"testimonial_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "testimonial_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"company" text,
	"content" text NOT NULL,
	"rating" integer,
	"image_url" text,
	"video_url" text,
	"featured" boolean DEFAULT false,
	"published" boolean DEFAULT true,
	"project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_engagement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid,
	"recipient_email" text NOT NULL,
	"event_type" text NOT NULL,
	"link_url" text,
	"user_agent" text,
	"ip_address" text,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"status" text DEFAULT 'active',
	"source" text,
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"unsubscribed_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "scheduled_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"sequence_id" text NOT NULL,
	"step_id" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"status" text DEFAULT 'pending',
	"variables" jsonb DEFAULT '{}'::jsonb,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calculator_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"company" text,
	"calculator_type" text NOT NULL,
	"inputs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"results" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lead_score" integer,
	"lead_quality" text,
	"contacted" boolean DEFAULT false NOT NULL,
	"contacted_at" timestamp with time zone,
	"converted" boolean DEFAULT false NOT NULL,
	"converted_at" timestamp with time zone,
	"conversion_value" numeric,
	"notes" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"referrer" text,
	"landing_page" text,
	"user_agent" text,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_attribution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"session_id" text,
	"touchpoint" text NOT NULL,
	"channel" text,
	"source" text,
	"medium" text,
	"campaign" text,
	"content" text,
	"term" text,
	"referrer" text,
	"landing_page" text,
	"touchpoint_order" integer,
	"is_first_touch" boolean DEFAULT false,
	"is_last_touch" boolean DEFAULT false,
	"attribution_weight" numeric,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"note_type" text,
	"content" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"company" text,
	"source" text,
	"status" text DEFAULT 'new',
	"score" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showcase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"showcase_type" text DEFAULT 'quick' NOT NULL,
	"client_name" text,
	"industry" text,
	"project_type" text,
	"category" text,
	"challenge" text,
	"solution" text,
	"results" text,
	"technologies" jsonb DEFAULT '[]'::jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"image_url" text,
	"og_image_url" text,
	"gallery_images" jsonb,
	"gradient_class" text DEFAULT 'surface-overlay',
	"external_link" text,
	"github_link" text,
	"testimonial_text" text,
	"testimonial_author" text,
	"testimonial_role" text,
	"testimonial_video_url" text,
	"project_duration" text,
	"team_size" integer,
	"featured" boolean DEFAULT false,
	"published" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "showcase_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"response_time_ms" integer,
	"request_body" jsonb,
	"request_headers" jsonb,
	"request_size_bytes" integer,
	"response_body" jsonb,
	"response_headers" jsonb,
	"response_size_bytes" integer,
	"error_message" text,
	"user_agent" text,
	"ip_address" "inet",
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cron_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"items_processed" integer,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "error_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"error_type" text NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"stack_trace" text,
	"url" text,
	"method" text,
	"route" text,
	"request_id" text,
	"user_id" text,
	"user_email" text,
	"environment" text,
	"vercel_region" text,
	"metadata" jsonb,
	"resolved_at" timestamp with time zone,
	"resolved_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processing_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_name" text NOT NULL,
	"task_type" text NOT NULL,
	"payload" jsonb,
	"priority" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"last_attempt_at" timestamp with time zone,
	"next_attempt_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"status" text NOT NULL,
	"status_code" integer,
	"response_body" jsonb,
	"error_message" text,
	"processing_time_ms" integer,
	"retry_count" integer DEFAULT 0,
	"idempotency_key" text,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ttl_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_code" text NOT NULL,
	"county" text,
	"purchase_price" integer,
	"name" text,
	"email" text,
	"inputs" jsonb NOT NULL,
	"results" jsonb NOT NULL,
	"view_count" integer DEFAULT 0,
	"last_viewed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ttl_calculations_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_blog_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_blog_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."blog_authors"("id") ON DELETE no action ON UPDATE no action;