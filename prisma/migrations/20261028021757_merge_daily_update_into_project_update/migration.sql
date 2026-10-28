/*
  Warnings:

  - You are about to drop the `DailyUpdate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tanggal` to the `ProjectUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyUpdate" DROP CONSTRAINT "DailyUpdate_projectId_fkey";

-- DropForeignKey
ALTER TABLE "DailyUpdate" DROP CONSTRAINT "DailyUpdate_updatedById_fkey";

-- AlterTable
ALTER TABLE "ProjectUpdate" ADD COLUMN     "tanggal" DATE NOT NULL;

-- DropTable
DROP TABLE "DailyUpdate";
