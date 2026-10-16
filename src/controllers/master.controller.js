import prisma from "../lib/prisma.js";
import { KATEGORI, JENIS, STATUS } from "../constants/enums.js";

// Membuat handler untuk mengambil seluruh baris dari model Prisma yang diberikan.
// Fungsi ini dipakai ulang untuk beberapa jenis data master yang bentuk responsnya sama.
const listOf = (model) => async (req, res, next) => {
  try {
    // Urutkan nama agar data master tampil konsisten, misalnya saat mengisi dropdown.
    const data = await prisma[model].findMany({ orderBy: { nama: "asc" } });
    res.json({ success: true, data });
  } catch (err) {
    // Teruskan error ke middleware error utama Express.
    next(err);
  }
};

// Handler yang menggunakan fungsi umum di atas untuk masing-masing model data master.
export const getProjectManagers = listOf("projectManager");
export const getBusinessPartners = listOf("businessPartner");
export const getUnits = listOf("unit");

// Mengirimkan pilihan kategori, jenis, dan status yang berlaku di aplikasi.
export function getEnums(req, res) {
  res.json({
    success: true,
    data: { kategori: KATEGORI, jenis: JENIS, status: STATUS },
  });
}