import type { Request, Response } from "express";
import {
  getAllSamples,
  getSampleById,
  createNewSample,
} from "./sample.service.js";

export async function getSamplesController(
  _req: Request,
  res: Response
) {
  try {
    const samples = await getAllSamples();

    res.json({
      data: samples,
    });
  } catch (error) {
    console.error("Failed to fetch samples:", error);

    res.status(500).json({
      error: "Failed to fetch samples",
    });
  }
}

export async function getSampleByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    

// const sample = await getSampleById(id);
if (typeof id !== "string") {
  res.status(400).json({
    error: "Invalid sample id",
  });
  return;
}


    const sample = await getSampleById(id);

    if (!sample) {
      res.status(404).json({
        error: "Sample not found",
      });
      return;
    }

    res.json({
      data: sample,
    });
  } catch (error) {
    console.error("Failed to fetch sample:", error);

    res.status(500).json({
      error: "Failed to fetch sample",
    });
  }
}

export async function createSampleController(
  req: Request,
  res: Response
) {
  try {
    const {
      labId,
      accessionNumber,
      patientReference,
      specimenType,
      priority,
      dueAt,
    } = req.body;

    if (
      !labId ||
      !accessionNumber ||
      !specimenType ||
      !priority ||
      !dueAt
    ) {
      res.status(400).json({
        error: "Missing required fields",
      });
      return;
    }

    const sample = await createNewSample({
      labId,
      accessionNumber,
      patientReference,
      specimenType,
      priority,
      dueAt,
    });

    res.status(201).json({
      data: sample,
    });
  } catch (error) {
    console.error("Failed to create sample:", error);

    res.status(500).json({
      error: "Failed to create sample",
    });
  }
}