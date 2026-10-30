-- CreateTable
CREATE TABLE "ProjectStageHistory" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "tahap" "TahapKomite" NOT NULL,
    "tanggalRencana" DATE,
    "status" "StatusTahapan" NOT NULL,
    "catatan" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedById" TEXT,

    CONSTRAINT "ProjectStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectStageHistory_projectId_changedAt_idx" ON "ProjectStageHistory"("projectId", "changedAt");

-- AddForeignKey
ALTER TABLE "ProjectStageHistory" ADD CONSTRAINT "ProjectStageHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStageHistory" ADD CONSTRAINT "ProjectStageHistory_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
