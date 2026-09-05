import { Router } from "express";
import {
  getSamplesController,
  getSampleByIdController,
  createSampleController,
} from "./sample.controller.js";

const sampleRouter = Router();

sampleRouter.get("/", getSamplesController);
sampleRouter.get("/:id", getSampleByIdController);
sampleRouter.post("/", createSampleController);

export default sampleRouter;