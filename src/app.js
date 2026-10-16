import "dotenv/config";
import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js";
import masterRoutes from "./routes/master.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// Membuat aplikasi Express yang akan menerima request HTTP.
const app = express();

// Mengizinkan request lintas domain dan membaca body request berformat JSON.
app.use(cors());
app.use(express.json());

// Endpoint sederhana untuk memastikan server sedang berjalan.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mendaftarkan kelompok URL untuk fitur project dan data referensi.
app.use("/projects", projectRoutes);
app.use("/master", masterRoutes);

// Middleware ini harus dipasang setelah route agar menangani route yang tidak cocok
// dan error yang diteruskan oleh handler route.
app.use(notFound);
app.use(errorHandler);

// Gunakan PORT dari environment jika tersedia, atau port 3000 untuk lokal.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});