CREATE TABLE "UpdateDocument" (
    "id" SERIAL NOT NULL,
    "updateId" INTEGER NOT NULL,
    "namaFile" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "ukuran" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UpdateDocument_updateId_uploadedAt_idx" ON "UpdateDocument"("updateId", "uploadedAt");

ALTER TABLE "UpdateDocument" ADD CONSTRAINT "UpdateDocument_updateId_fkey"
FOREIGN KEY ("updateId") REFERENCES "ProjectUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
