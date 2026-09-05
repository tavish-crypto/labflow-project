import {
  findAllSamples,
  findSampleById,
  createSample,
} from "./sample.repository.js";
import type { CreateSampleInput } from "./sample.validation.js";

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