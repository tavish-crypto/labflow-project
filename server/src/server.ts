import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sampleRouter from "./modules/samples/sample.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "labflow-api",
  });
});

app.use("/api/samples", sampleRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LabFlow API running on port ${PORT}`);
});