import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Adapter menghubungkan Prisma Client dengan PostgreSQL menggunakan URL database.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Satu client dipakai bersama oleh controller agar koneksi tidak dibuat berulang.
const prisma = new PrismaClient({ adapter });

export default prisma;