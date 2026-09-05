import { db } from "../../db.js";

export async function findAllSamples() {
  return db.sample.findMany({
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
}

export async function findSampleById(id: string) {
  return db.sample.findUnique({
    where: {
      id,
    },
    include: {
      tests: {
        include: {
          testDefinition: true,
        },
      },
      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
      exceptions: true,
    },
  });
}

export async function createSample(data: {
  labId: string;
  accessionNumber: string;
  patientReference?: string;
  specimenType: string;
  priority: "ROUTINE" | "URGENT" | "STAT";
  dueAt: Date;
}) {
  return db.sample.create({
    data: {
      labId: data.labId,
      accessionNumber: data.accessionNumber,
      patientReference: data.patientReference,
      specimenType: data.specimenType,
      priority: data.priority,
      dueAt: data.dueAt,
    },
  });
}