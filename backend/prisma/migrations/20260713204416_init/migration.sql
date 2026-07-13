-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "guest_device_id" TEXT,
    "apple_sub" TEXT,
    "google_sub" TEXT,
    "email" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "user_id" UUID NOT NULL,
    "carrying" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gentleness" TEXT,
    "rhythm" TEXT,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "saved_verse" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ref" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflection" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "word" TEXT NOT NULL,
    "note" TEXT,
    "ref" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "user_id" UUID NOT NULL,
    "platform" TEXT,
    "product_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'free',
    "expires_at" TIMESTAMPTZ(6),
    "original_txn_id" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "user_id" UUID NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("user_id","book")
);

-- CreateTable
CREATE TABLE "bible_verse" (
    "id" SERIAL NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "testament" TEXT NOT NULL,

    CONSTRAINT "bible_verse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_guest_device_id_key" ON "user"("guest_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_verse_user_id_ref_key" ON "saved_verse"("user_id", "ref");

-- CreateIndex
CREATE INDEX "bible_verse_book_chapter_idx" ON "bible_verse"("book", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "bible_verse_book_chapter_verse_key" ON "bible_verse"("book", "chapter", "verse");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_verse" ADD CONSTRAINT "saved_verse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflection" ADD CONSTRAINT "reflection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
