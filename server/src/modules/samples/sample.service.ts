import {
  createSample,
  createSampleStatusEvent,
  findAllSamples,
  findSampleById,
  updateSampleStatus,
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