import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lab = await prisma.lab.upsert({
    where: {
      code: "LAB001",
    },
    update: {},
    create: {
      name: "LabFlow Demo Laboratory",
      code: "LAB001",
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@labflow.local",
    },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@labflow.local",
      role: "ADMIN",
      labId: lab.id,
    },
  });

  const cbc = await prisma.testDefinition.upsert({
    where: {
      labId_code: {
        labId: lab.id,
        code: "CBC",
      },
    },
    update: {},
    create: {
      labId: lab.id,
      code: "CBC",
      name: "Complete Blood Count",
      slaMinutes: 120,
    },
  });

  const glucose = await prisma.testDefinition.upsert({
    where: {
      labId_code: {
        labId: lab.id,
        code: "GLU",
      },
    },
    update: {},
    create: {
      labId: lab.id,
      code: "GLU",
      name: "Blood Glucose",
      slaMinutes: 60,
    },
  });

  const now = new Date();

  const sampleDueAt = new Date(
    now.getTime() + 120 * 60 * 1000
  );

  const glucoseDueAt = new Date(
    now.getTime() + 60 * 60 * 1000
  );

  const sample = await prisma.sample.upsert({
    where: {
      labId_accessionNumber: {
        labId: lab.id,
        accessionNumber: "ACC-0001",
      },
    },
    update: {},
    create: {
      labId: lab.id,
      accessionNumber: "ACC-0001",
      patientReference: "PATIENT-DEMO-001",
      specimenType: "Blood",
      priority: "ROUTINE",
      status: "RECEIVED",
      receivedAt: now,
      dueAt: sampleDueAt,
    },
  });

  await prisma.sampleTest.upsert({
    where: {
      sampleId_testDefinitionId: {
        sampleId: sample.id,
        testDefinitionId: cbc.id,
      },
    },
    update: {},
    create: {
      sampleId: sample.id,
      testDefinitionId: cbc.id,
      status: "PENDING",
      dueAt: sampleDueAt,
    },
  });

  await prisma.sampleTest.upsert({
    where: {
      sampleId_testDefinitionId: {
        sampleId: sample.id,
        testDefinitionId: glucose.id,
      },
    },
    update: {},
    create: {
      sampleId: sample.id,
      testDefinitionId: glucose.id,
      status: "PENDING",
      dueAt: glucoseDueAt,
    },
  });

  const existingEvent = await prisma.sampleEvent.findFirst({
    where: {
      sampleId: sample.id,
      type: "CREATED",
    },
  });

  if (!existingEvent) {
    await prisma.sampleEvent.create({
      data: {
        sampleId: sample.id,
        actorId: admin.id,
        type: "CREATED",
        toStatus: "RECEIVED",
        note: "Sample registered in LabFlow.",
      },
    });
  }

  console.log("LabFlow seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });