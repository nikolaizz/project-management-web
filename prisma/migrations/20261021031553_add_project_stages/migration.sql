-- CreateEnum
CREATE TYPE "TahapKomite" AS ENUM ('PRA_KOMITE', 'KOMITE_TI_B', 'KOMITE_TI_A');

-- CreateEnum
CREATE TYPE "StatusTahapan" AS ENUM ('PLANNED', 'ON_PROGRESS', 'SELESAI');

-- CreateTable
CREATE TABLE "ProjectStage" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "tahap" "TahapKomite" NOT NULL,
    "tanggalRencana" DATE,
    "status" "StatusTahapan" NOT NULL DEFAULT 'PLANNED',
    "catatan" TEXT,

    CONSTRAINT "ProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStage_projectId_tahap_key" ON "ProjectStage"("projectId", "tahap");

-- AddForeignKey
ALTER TABLE "ProjectStage" ADD CONSTRAINT "ProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
