ALTER TABLE "User"
  ADD COLUMN "projectManagerId" TEXT,
  ADD COLUMN "businessPartnerId" TEXT,
  ALTER COLUMN "role" SET DEFAULT 'VIEWER';

CREATE UNIQUE INDEX "User_projectManagerId_key" ON "User"("projectManagerId");
CREATE UNIQUE INDEX "User_businessPartnerId_key" ON "User"("businessPartnerId");

ALTER TABLE "User"
  ADD CONSTRAINT "User_projectManagerId_fkey"
    FOREIGN KEY ("projectManagerId") REFERENCES "ProjectManager"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "User_businessPartnerId_fkey"
    FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
