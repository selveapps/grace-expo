-- Story listening progress + persisted support tickets
CREATE TABLE "story_progress" (
    "user_id" UUID NOT NULL,
    "story_id" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "story_progress_pkey" PRIMARY KEY ("user_id","story_id")
);

CREATE TABLE "support_ticket" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "reply" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "story_progress" ADD CONSTRAINT "story_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
