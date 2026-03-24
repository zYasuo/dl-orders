-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "sequence_id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "max_quantity" INTEGER NOT NULL DEFAULT 100,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "created_by" VARCHAR(254) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventories_sequence_id_key" ON "inventories"("sequence_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_name_key" ON "inventories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_product_id_key" ON "inventories"("product_id");
