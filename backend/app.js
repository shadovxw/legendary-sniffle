import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import revealRoutes from "./routes/reveal.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/reveal", revealRoutes);

export default app;
