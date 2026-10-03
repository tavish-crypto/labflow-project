import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sampleRouter from "./modules/samples/sample.routes.js";
import { dashboardRouter } from "./modules/samples/dashboard/dashboard.routes.js";
import exceptionsRouter from "./modules/exceptions/exceptions.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "labflow-api",
  });
});

app.use("/api/samples", sampleRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/exceptions", exceptionsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LabFlow API running on port ${PORT}`);
});