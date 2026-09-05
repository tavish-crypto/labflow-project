import {
  findAllSamples,
  findSampleById,
  createSample,
} from "./sample.repository.js";

export async function getAllSamples() {
  return findAllSamples();
}
export async function getSampleById(id: string) {
  return findSampleById(id);
}

type CreateSampleInput = {
  labId: string;
  accessionNumber: string;
  patientReference?: string;
  specimenType: string;
  priority: "ROUTINE" | "URGENT" | "STAT";
  dueAt: string;
};

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