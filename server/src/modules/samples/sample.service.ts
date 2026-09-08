import {
  createSample,
  createSampleStatusEvent,
  createSampleTest,
  findAllSamples,
  findAllTestDefinitions,
  findSampleById,
  findSampleTestById,
  findTestDefinitionById,
  updateSampleStatus,
  updateSampleTestStatus,
} from "./sample.repository.js";
import type { CreateSampleInput } from "./sample.validation.js";
type SampleStatus =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";

export async function getAllSamples() {
  return findAllSamples();
}
export async function getSampleById(id: string) {
  return findSampleById(id);
}


export async function createNewSample(input: CreateSampleInput) {
  return createSample({
    labId: input.labId,
    accessionNumber: input.accessionNumber,
    patientReference: input.patientReference,
    specimenType: input.specimenType,
    priority: input.priority,
    dueAt: new Date(input.dueAt),
  });
}


const allowedTransitions: Record<
  SampleStatus,
  SampleStatus[]
> = {
  RECEIVED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
};

export async function changeSampleStatus(
  id: string,
  newStatus: SampleStatus
) {
  const sample = await findSampleById(id);

  if (!sample) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  const currentStatus = sample.status as SampleStatus;

  const allowed = allowedTransitions[currentStatus];

  if (!allowed.includes(newStatus)) {
    return {
      success: false as const,
      reason: "INVALID_TRANSITION" as const,
      currentStatus,
      newStatus,
    };
  }

  const updatedSample = await updateSampleStatus(
    id,
    newStatus
  );

  await createSampleStatusEvent({
    sampleId: id,
    fromStatus: currentStatus,
    toStatus: newStatus,
  });

  return {
    success: true as const,
    sample: updatedSample,
  };
}

export async function assignTestToSample(
  sampleId: string,
  testDefinitionId: string
) {
  const sample = await findSampleById(sampleId);

  if (!sample) {
    return {
      success: false as const,
      reason: "SAMPLE_NOT_FOUND" as const,
    };
  }

  const testDefinition =
    await findTestDefinitionById(
      testDefinitionId
    );

  if (!testDefinition) {
    return {
      success: false as const,
      reason: "TEST_NOT_FOUND" as const,
    };
  }

  if (sample.labId !== testDefinition.labId) {
    return {
      success: false as const,
      reason: "LAB_MISMATCH" as const,
    };
  }

  const dueAt = new Date(
    Date.now() +
      testDefinition.slaMinutes *
        60 *
        1000
  );

  const sampleTest = await createSampleTest({
    sampleId,
    testDefinitionId,
    dueAt,
  });

  return {
    success: true as const,
    sampleTest,
  };
}

type SampleTestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

  const allowedTestTransitions: Record<
  SampleTestStatus,
  SampleTestStatus[]
> = {
  PENDING: [
    "IN_PROGRESS",
    "FAILED",
    "CANCELLED",
  ],

  IN_PROGRESS: [
    "COMPLETED",
    "FAILED",
    "CANCELLED",
  ],

  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export async function changeSampleTestStatus(
  sampleId: string,
  sampleTestId: string,
  newStatus: SampleTestStatus
) {
  const sample = await findSampleById(sampleId);

  if (!sample) {
    return {
      success: false as const,
      reason: "SAMPLE_NOT_FOUND" as const,
    };
  }

  const sampleTest =
    await findSampleTestById(sampleTestId);

  if (!sampleTest) {
    return {
      success: false as const,
      reason:
        "SAMPLE_TEST_NOT_FOUND" as const,
    };
  }

  if (sampleTest.sampleId !== sampleId) {
    return {
      success: false as const,
      reason: "TEST_SAMPLE_MISMATCH" as const,
    };
  }

  const currentStatus =
    sampleTest.status as SampleTestStatus;

  if (
    !allowedTestTransitions[
      currentStatus
    ].includes(newStatus)
  ) {
    return {
      success: false as const,
      reason:
        "INVALID_TRANSITION" as const,
      currentStatus,
      newStatus,
    };
  }

  const updated =
    await updateSampleTestStatus(
      sampleTestId,
      newStatus
    );

  return {
    success: true as const,
    sampleTest: updated,
  };
}

export async function getAllTestDefinitions() {
  return findAllTestDefinitions();
}