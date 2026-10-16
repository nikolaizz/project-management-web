import "dotenv/config";
import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js";
import masterRoutes from "./routes/master.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/projects", projectRoutes);
app.use("/master", masterRoutes);

// Dua baris ini HARUS paling bawah, setelah semua route
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});