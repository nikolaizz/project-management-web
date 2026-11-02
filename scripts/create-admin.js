import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  const { BOOTSTRAP_ADMIN_NAME: nama, BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: password } = process.env;
  if (!nama?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "") || !password || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new Error("Isi BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, dan password 8-72 byte di .env.");
  }
  if (await prisma.user.count({ where: { role: "ADMIN" } })) {
    throw new Error("Admin sudah tersedia. Buat akun berikutnya dari menu Konfigurasi.");
  }

  await prisma.user.create({
    data: {
      id: `USER-${randomUUID()}`,
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });
  console.log("Admin awal berhasil dibuat. Hapus nilai BOOTSTRAP_ADMIN_* dari .env.");
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
