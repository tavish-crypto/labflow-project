import { Router } from "express";
import {
  getSamplesController,
  getSampleByIdController,
  createSampleController,
  updateSampleStatusController,
  assignTestController,
updateSampleTestStatusController,
getTestDefinitionsController,
createExceptionController,
updateExceptionStatusController,
} from "./sample.controller.js";



const sampleRouter = Router();

sampleRouter.get("/", getSamplesController);
sampleRouter.get(
  "/test-definitions",
  getTestDefinitionsController
);
sampleRouter.get("/:id", getSampleByIdController);
sampleRouter.post("/", createSampleController);
sampleRouter.patch(
  "/:id/status",
  updateSampleStatusController
);
sampleRouter.post(
  "/:id/tests",
  assignTestController
);
sampleRouter.patch(
  "/:id/tests/:sampleTestId/status",
  updateSampleTestStatusController
);
sampleRouter.post(
  "/:id/exceptions",
  createExceptionController
);

sampleRouter.patch(
  "/:id/exceptions/:exceptionId/status",
  updateExceptionStatusController
);

export default sampleRouter;