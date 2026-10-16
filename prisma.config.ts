import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Pengaturan Prisma: lokasi schema, migrasi, perintah seed, dan URL database.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});