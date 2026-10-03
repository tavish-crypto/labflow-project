import type { Request, Response } from "express";
import { getAllExceptions } from "./exceptions.service.js";
import type { ExceptionStatus, ExceptionSeverity, ExceptionType } from "@prisma/client";

export async function getExceptionsController(req: Request, res: Response) {
  try {
    const { status, severity, type } = req.query;

    const filters = {
      status: typeof status === "string" ? (status as ExceptionStatus) : undefined,
      severity: typeof severity === "string" ? (severity as ExceptionSeverity) : undefined,
      type: typeof type === "string" ? (type as ExceptionType) : undefined,
    };

    const exceptions = await getAllExceptions(filters);

    res.json({
      data: exceptions,
    });
  } catch (error) {
    console.error("Failed to fetch exceptions:", error);
    res.status(500).json({
      error: "Failed to fetch exceptions",
    });
  }
}
