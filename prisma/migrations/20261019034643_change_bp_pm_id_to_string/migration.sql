-- AlterTable
ALTER TABLE "BusinessPartner" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "BusinessPartner_id_seq";

-- AlterTable
ALTER TABLE "ProjectManager" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "ProjectManager_id_seq";
