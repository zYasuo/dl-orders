-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email_encrypted" VARCHAR(600) NOT NULL,
    "email_lookup_hash" VARCHAR(64) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "email_encrypted" VARCHAR(600) NOT NULL,
    "email_lookup_hash" VARCHAR(64) NOT NULL,
    "link_reset_password" VARCHAR(500) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_logs" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_login_attempt" TIMESTAMP(3) NOT NULL,
    "last_login_attempt_ip" VARCHAR(45),
    "last_login_attempt_success" BOOLEAN NOT NULL DEFAULT false,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_lookup_hash_key" ON "users"("email_lookup_hash");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_email_lookup_hash_key" ON "password_resets"("email_lookup_hash");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_link_reset_password_key" ON "password_resets"("link_reset_password");

-- CreateIndex
CREATE UNIQUE INDEX "auth_logs_user_id_key" ON "auth_logs"("user_id");

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_logs" ADD CONSTRAINT "auth_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
