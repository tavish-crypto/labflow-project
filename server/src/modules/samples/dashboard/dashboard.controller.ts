import { Request,Response } from "express";
import { getDashboardSummmary } from "./dashboard.service";
export async function getDashboardSummmaryController(
    _req: Request,
    res: Response
) {
    try{
        const summary = await getDashboardSummmary();
        res.status(200).json({
            data: summary,
        });
    }catch(error){
        console.error("Failed to get dashboard summary:", error);
        res.status(500).json({
            error:"Failed to get dashboard summary"
        })
    }
}