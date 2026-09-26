import { Router } from "express";
import { getDashboardSummmaryController} from "./dashboard.controller";
export const dashboardRouter = Router()
dashboardRouter.get("/summary",getDashboardSummmaryController)


