-- CreateEnum
CREATE TYPE "KategoriProject" AS ENUM ('FS', 'CR_FORM', 'AIR_FORM', 'IC_FORM', 'SC_FORM');

-- CreateEnum
CREATE TYPE "JenisProject" AS ENUM ('NEW', 'ADDENDUM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'INISIASI', 'ON_PROGRESS', 'PENDING', 'ON_HOLD', 'SELESAI');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'VIEWER');

-- CreateTable
CREATE TABLE "ProjectManager" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "ProjectManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartner" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "BusinessPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PROJECT_MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "kategori" "KategoriProject" NOT NULL,
    "jenis" "JenisProject" NOT NULL,
    "kodeProject" TEXT,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "pmId" INTEGER NOT NULL,
    "bpId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "ownerPic" TEXT NOT NULL,
    "tanggalProject" DATE NOT NULL,
    "targetGoLive" DATE,
    "status" "ProjectStatus" NOT NULL DEFAULT 'INISIASI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "namaFile" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "ukuran" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUpdate" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "tanggalInput" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProjectStatus" NOT NULL,
    "aktivitas" TEXT NOT NULL,
    "kendala" TEXT,
    "nextAction" TEXT NOT NULL,

    CONSTRAINT "ProjectUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectManager_nama_key" ON "ProjectManager"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartner_nama_key" ON "BusinessPartner"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_nama_key" ON "Unit"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_kodeProject_key" ON "Project"("kodeProject");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_nama_idx" ON "Project"("nama");

-- CreateIndex
CREATE INDEX "ProjectUpdate_projectId_tanggalInput_idx" ON "ProjectUpdate"("projectId", "tanggalInput");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_pmId_fkey" FOREIGN KEY ("pmId") REFERENCES "ProjectManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_bpId_fkey" FOREIGN KEY ("bpId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUpdate" ADD CONSTRAINT "ProjectUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
