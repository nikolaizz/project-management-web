import "dotenv/config";
import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js";
import documentRoutes from "./routes/document.routes.js";
import masterRoutes from "./routes/master.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import dailyUpdateRoutes from "./routes/dailyUpdate.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/projects", projectRoutes);
app.use("/documents", documentRoutes);
app.use("/master", masterRoutes);
app.use("/daily-updates", dailyUpdateRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});