import { Router } from "express";
import {
  getSamplesController,
  getSampleByIdController,
  createSampleController,
  updateSampleStatusController,
} from "./sample.controller.js";



const sampleRouter = Router();

sampleRouter.get("/", getSamplesController);
sampleRouter.get("/:id", getSampleByIdController);
sampleRouter.post("/", createSampleController);
sampleRouter.patch(
  "/:id/status",
  updateSampleStatusController
);

export default sampleRouter;