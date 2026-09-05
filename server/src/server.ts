import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db.js";

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

app.get("/api/samples", async (_req, res) => {
  try {
    const samples = await db.sample.findMany({
      include: {
        tests: {
          include: {
            testDefinition: true,
          },
        },
        events: true,
        exceptions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      data: samples,
    });
  } catch (error) {
    console.error("Failed to fetch samples:", error);

    res.status(500).json({
      error: "Failed to fetch samples",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LabFlow API running on port ${PORT}`);
});