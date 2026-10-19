-- Drop the foreign keys while converting both sides of each relation.
ALTER TABLE "Project" DROP CONSTRAINT "Project_pmId_fkey";
ALTER TABLE "Project" DROP CONSTRAINT "Project_bpId_fkey";

-- Convert existing numeric IDs to text without changing their visible values.
ALTER TABLE "ProjectManager" ALTER COLUMN "id" TYPE TEXT USING "id"::text;
ALTER TABLE "BusinessPartner" ALTER COLUMN "id" TYPE TEXT USING "id"::text;
ALTER TABLE "Project" ALTER COLUMN "pmId" TYPE TEXT USING "pmId"::text;
ALTER TABLE "Project" ALTER COLUMN "bpId" TYPE TEXT USING "bpId"::text;

-- User.id is also String in the current Prisma schema.
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "User_id_seq";
ALTER TABLE "User" ALTER COLUMN "id" TYPE TEXT USING "id"::text;

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_pmId_fkey"
  FOREIGN KEY ("pmId") REFERENCES "ProjectManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project"
  ADD CONSTRAINT "Project_bpId_fkey"
  FOREIGN KEY ("bpId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
