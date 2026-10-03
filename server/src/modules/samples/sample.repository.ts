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

export async function updateSampleStatus(
  id: string,
  status: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED"
) {
  return db.sample.update({
    where: {
      id,
    },
    data: {
      status,
      completedAt:
        status === "COMPLETED"
          ? new Date()
          : null,
    },
  });
}

export async function createSampleStatusEvent(data: {
  sampleId: string;
  fromStatus: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  toStatus: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
}) {
  return db.sampleEvent.create({
    data: {
      sampleId: data.sampleId,
      type: "STATUS_CHANGED",
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      note: `Sample status changed from ${data.fromStatus} to ${data.toStatus}`,
    },
  });
}

export async function findTestDefinitionById(
  id: string
) {
  return db.testDefinition.findUnique({
    where: {
      id,
    },
  });
}


export async function createSampleTest(data: {
  sampleId: string;
  testDefinitionId: string;
  dueAt: Date;
}) {
  return db.sampleTest.create({
    data: {
      sampleId: data.sampleId,
      testDefinitionId: data.testDefinitionId,
      dueAt: data.dueAt,
    },
    include: {
      testDefinition: true,
    },
  });
}

export async function findSampleTestById(
  id: string
) {
  return db.sampleTest.findUnique({
    where: {
      id,
    },
    include: {
      testDefinition: true,
    },
  });
}

export async function updateSampleTestStatus(
  id: string,
  status:
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
) {
  return db.sampleTest.update({
    where: {
      id,
    },
    data: {
      status,

      startedAt:
        status === "IN_PROGRESS"
          ? new Date()
          : undefined,

      completedAt:
        status === "COMPLETED"
          ? new Date()
          : undefined,
    },
    include: {
      testDefinition: true,
    },
  });
}
export async function findAllTestDefinitions() {
  return db.testDefinition.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function createOperationalException(data:{
    sampleId: string;
    type:
    | "DELAY"
    | "QUALITY_ISSUE"
    | "MISSING_INFORMATION"
    | "EQUIPMENT_FAILURE"
    | "OTHER"
    severity?:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    message: string
}){
  return db.operationalException.create({
    data:{
      sampleId: data.sampleId,
      type: data.type,
      severity: data.severity ?? "MEDIUM",
      message: data.message,

    },
  })
}

export async function findOperationalExceptionById(
  id: string
) {
  return db.operationalException.findUnique({
    where: {
      id,
    },
  });
}

export async function updateOperationalExceptionStatus(
  id: string,
  data:{
    status: 
    | "OPEN"
    | "ACKNOWLEDGED"
    | "RESOLVED"
    resolvedById?: string;
  }
) {
  return db.operationalException.update({
    where:{
      id,
    },
    data:{
      status: data.status,
      resolvedAt: 
      data.status === "RESOLVED"
      ? new Date()
      : null,
    
    resolvedById:
    data.status === "RESOLVED"
    ? data.resolvedById
    :null,
    }
  })
  
}

export async function findSampleEvents(sampleId:string){
  return db.sampleEvent.findMany({
    where:{
      sampleId,
    },
    orderBy:{
      createdAt: "asc",
    },
    include:{
      actor:{
        select:{
          id:true,
          name:true,
          email:true,
        },
      },
    },
  });
}

export async function createGenericSampleEvent(data: {
  sampleId: string;
  type: "CREATED" | "STATUS_CHANGED" | "NOTE_ADDED" | "EXCEPTION_RAISED" | "EXCEPTION_RESOLVED";
  fromStatus?: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  toStatus?: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  note?: string;
}) {
  return db.sampleEvent.create({
    data: {
      sampleId: data.sampleId,
      type: data.type,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      note: data.note,
    },
  });
}