import prisma from "../src/lib/prisma.js";

const daily = await prisma.dailyUpdate.deleteMany();
const riwayat = await prisma.projectUpdate.deleteMany();
console.log(`Terhapus: ${daily.count} daily update, ${riwayat.count} riwayat update`);
await prisma.$disconnect();