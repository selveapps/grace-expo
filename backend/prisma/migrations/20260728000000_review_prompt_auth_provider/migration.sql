-- Review prompt log (App Store review ask policy) + provider auth identity.

ALTER TABLE "user" ADD COLUMN "auth_provider" TEXT NOT NULL DEFAULT 'guest';

-- appleSub / googleSub become the join key for Sign in with Apple / Google.
CREATE UNIQUE INDEX "user_apple_sub_key" ON "user"("apple_sub");
CREATE UNIQUE INDEX "user_google_sub_key" ON "user"("google_sub");

CREATE TABLE "review_prompt" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "surface" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_prompt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "review_prompt_user_id_idx" ON "review_prompt"("user_id");

ALTER TABLE "review_prompt" ADD CONSTRAINT "review_prompt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
