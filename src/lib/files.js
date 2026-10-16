import path from "node:path";
import { mkdirSync } from "node:fs";
import fs from "node:fs/promises";

// Folder tempat file disimpan: <root proyek>/uploads
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

// Hapus file fisik dari disk. File yang sudah tidak ada diabaikan.
export async function removeFiles(filenames) {
  await Promise.all(
    filenames.map(async (name) => {
      try {
        await fs.unlink(path.join(UPLOAD_DIR, name));
      } catch (err) {
        if (err.code !== "ENOENT") console.error("Gagal hapus file:", name, err);
      }
    })
  );
}