ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "activationTokenHash" TEXT,
  ADD COLUMN "activationExpiresAt" TIMESTAMP(3);
