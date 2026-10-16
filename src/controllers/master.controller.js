import prisma from "../lib/prisma.js";
import { KATEGORI, JENIS, STATUS } from "../constants/enums.js";

// Pabrik fungsi: membuat handler "ambil semua data dari tabel X"
const listOf = (model) => async (req, res, next) => {
  try {
    const data = await prisma[model].findMany({ orderBy: { nama: "asc" } });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getProjectManagers = listOf("projectManager");
export const getBusinessPartners = listOf("businessPartner");
export const getUnits = listOf("unit");

export function getEnums(req, res) {
  res.json({
    success: true,
    data: { kategori: KATEGORI, jenis: JENIS, status: STATUS },
  });
}