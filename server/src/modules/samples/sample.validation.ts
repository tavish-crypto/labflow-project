import { z } from "zod";

export const createSampleSchema = z.object({
  labId: z.string().min(1, "labId is required"),

  accessionNumber: z
    .string()
    .min(1, "accessionNumber is required")
    .max(100),

  patientReference: z
    .string()
    .max(100)
    .optional(),

  specimenType: z
    .string()
    .min(1, "specimenType is required")
    .max(100),

  priority: z.enum([
    "ROUTINE",
    "URGENT",
    "STAT",
  ]),

  dueAt: z
    .string()
    .datetime({
      message: "dueAt must be a valid ISO datetime",
    }),
});

export const updateSampleStatusSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "IN_PROGRESS",
    "COMPLETED",
    "REJECTED",
  ]),
});

export type UpdateSampleStatusInput = z.infer<
  typeof updateSampleStatusSchema
>;

export type CreateSampleInput = z.infer<
  typeof createSampleSchema
>;

