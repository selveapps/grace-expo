-- Tea like/save engagement
CREATE TABLE "tea_engagement" (
    "user_id" UUID NOT NULL,
    "tea_id" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tea_engagement_pkey" PRIMARY KEY ("user_id","tea_id")
);

ALTER TABLE "tea_engagement" ADD CONSTRAINT "tea_engagement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
