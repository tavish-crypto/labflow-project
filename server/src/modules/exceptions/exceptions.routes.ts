import { Router } from "express";
import { getExceptionsController } from "./exceptions.controller.js";

export const exceptionsRouter = Router();

exceptionsRouter.get("/", getExceptionsController);

export default exceptionsRouter;
