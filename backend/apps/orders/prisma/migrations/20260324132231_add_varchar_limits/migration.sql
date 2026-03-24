-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "sequence_id" SERIAL NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "product_id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "recipient" VARCHAR(254) NOT NULL,
    "product_name" VARCHAR(200) NOT NULL DEFAULT '',
    "product_description" VARCHAR(2000) NOT NULL DEFAULT '',
    "idempotency_key" VARCHAR(36) NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_sequence_id_key" ON "orders"("sequence_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");
