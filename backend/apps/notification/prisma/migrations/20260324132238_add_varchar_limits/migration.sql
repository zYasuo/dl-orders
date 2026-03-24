-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "sequence_id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" VARCHAR(5000) NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "source_event_id" VARCHAR(100) NOT NULL,
    "recipient_email" VARCHAR(254) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "product_description" VARCHAR(2000) NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_sequence_id_key" ON "notifications"("sequence_id");
