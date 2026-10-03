import { db } from "../../db.js";
import type { ExceptionStatus, ExceptionSeverity, ExceptionType } from "@prisma/client";

export interface ExceptionFilters {
  status?: ExceptionStatus;
  severity?: ExceptionSeverity;
  type?: ExceptionType;
}

export async function findAllExceptions(filters?: ExceptionFilters) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.severity) where.severity = filters.severity;
  if (filters?.type) where.type = filters.type;

  return db.operationalException.findMany({
    where,
    include: {
      sample: {
        select: {
          id: true,
          accessionNumber: true,
          patientReference: true,
          specimenType: true,
          priority: true,
          status: true,
          dueAt: true,
        },
      },
      resolvedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
