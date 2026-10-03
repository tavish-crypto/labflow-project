import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lab = await prisma.lab.upsert({
    where: {
      code: "LAB001",
    },
    update: {},
    create: {
      name: "Jaipur Diagnostics",
      code: "LAB001",
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      email: "tavish@labflow.local",
    },
    update: {
      name: "Tavish Modi",
    },
    create: {
      name: "Tavish Modi",
      email: "tavish@labflow.local",
      role: "ADMIN",
      labId: lab.id,
    },
  });

  // Test definitions
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

  const lft = await prisma.testDefinition.upsert({
    where: {
      labId_code: {
        labId: lab.id,
        code: "LFT",
      },
    },
    update: {},
    create: {
      labId: lab.id,
      code: "LFT",
      name: "Liver Function Test",
      slaMinutes: 180,
    },
  });

  const lipid = await prisma.testDefinition.upsert({
    where: {
      labId_code: {
        labId: lab.id,
        code: "LIPID",
      },
    },
    update: {},
    create: {
      labId: lab.id,
      code: "LIPID",
      name: "Lipid Profile",
      slaMinutes: 90,
    },
  });

  const now = new Date();

  // Helper dates
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);
  const minsAhead = (m: number) => new Date(now.getTime() + m * 60 * 1000);

  // Clear existing operational exceptions, sample tests, sample events, and samples for fresh seed if desired
  // Or upsert carefully. Upsert is safer.

  const sampleData = [
    {
      accessionNumber: "ACC-1001",
      patientReference: "PAT-3821",
      specimenType: "Blood",
      priority: "STAT" as const,
      status: "IN_PROGRESS" as const,
      receivedAt: minsAgo(90),
      dueAt: minsAgo(15), // BREACHED
      completedAt: null,
      tests: [
        { testDef: cbc, status: "IN_PROGRESS" as const, dueAt: minsAgo(15), startedAt: minsAgo(45) },
        { testDef: glucose, status: "COMPLETED" as const, dueAt: minsAgo(30), startedAt: minsAgo(50), completedAt: minsAgo(10) },
      ],
      exceptions: [
        {
          type: "EQUIPMENT_FAILURE" as const,
          severity: "HIGH" as const,
          status: "ACKNOWLEDGED" as const,
          message: "CBC analyzer stopped responding. Unable to process sample.",
          createdAt: minsAgo(20),
        },
      ],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(90) },
        { type: "STATUS_CHANGED" as const, fromStatus: "RECEIVED" as const, toStatus: "IN_PROGRESS" as const, note: "Sample processing started.", createdAt: minsAgo(60) },
        { type: "EXCEPTION_RAISED" as const, toStatus: "IN_PROGRESS" as const, note: "Equipment failure reported on CBC analyzer.", createdAt: minsAgo(20) },
      ],
    },
    {
      accessionNumber: "ACC-1002",
      patientReference: "PAT-4102",
      specimenType: "Serum",
      priority: "URGENT" as const,
      status: "IN_PROGRESS" as const,
      receivedAt: minsAgo(45),
      dueAt: minsAhead(15), // AT_RISK (< 30m)
      completedAt: null,
      tests: [
        { testDef: glucose, status: "IN_PROGRESS" as const, dueAt: minsAhead(15), startedAt: minsAgo(20) },
      ],
      exceptions: [
        {
          type: "DELAY" as const,
          severity: "MEDIUM" as const,
          status: "OPEN" as const,
          message: "Reagent preparation taking longer than expected.",
          createdAt: minsAgo(10),
        },
      ],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(45) },
        { type: "STATUS_CHANGED" as const, fromStatus: "RECEIVED" as const, toStatus: "IN_PROGRESS" as const, note: "Sample processing started.", createdAt: minsAgo(30) },
        { type: "EXCEPTION_RAISED" as const, toStatus: "IN_PROGRESS" as const, note: "Delay exception raised.", createdAt: minsAgo(10) },
      ],
    },
    {
      accessionNumber: "ACC-1003",
      patientReference: "PAT-1094",
      specimenType: "Plasma",
      priority: "ROUTINE" as const,
      status: "RECEIVED" as const,
      receivedAt: minsAgo(15),
      dueAt: minsAhead(105), // SAFE
      completedAt: null,
      tests: [
        { testDef: lipid, status: "PENDING" as const, dueAt: minsAhead(105) },
      ],
      exceptions: [],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(15) },
      ],
    },
    {
      accessionNumber: "ACC-1004",
      patientReference: "PAT-9921",
      specimenType: "Blood",
      priority: "ROUTINE" as const,
      status: "COMPLETED" as const,
      receivedAt: minsAgo(180),
      dueAt: minsAgo(60),
      completedAt: minsAgo(45),
      tests: [
        { testDef: cbc, status: "COMPLETED" as const, dueAt: minsAgo(60), startedAt: minsAgo(120), completedAt: minsAgo(45) },
      ],
      exceptions: [],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(180) },
        { type: "STATUS_CHANGED" as const, fromStatus: "RECEIVED" as const, toStatus: "IN_PROGRESS" as const, note: "Sample processing started.", createdAt: minsAgo(150) },
        { type: "STATUS_CHANGED" as const, fromStatus: "IN_PROGRESS" as const, toStatus: "COMPLETED" as const, note: "Sample processing completed.", createdAt: minsAgo(45) },
      ],
    },
    {
      accessionNumber: "ACC-1005",
      patientReference: "PAT-8812",
      specimenType: "Urine",
      priority: "ROUTINE" as const,
      status: "RECEIVED" as const,
      receivedAt: minsAgo(30),
      dueAt: minsAhead(150),
      completedAt: null,
      tests: [],
      exceptions: [],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(30) },
      ],
    },
    {
      accessionNumber: "ACC-1006",
      patientReference: "PAT-5531",
      specimenType: "Serum",
      priority: "STAT" as const,
      status: "IN_PROGRESS" as const,
      receivedAt: minsAgo(40),
      dueAt: minsAhead(20), // AT_RISK
      completedAt: null,
      tests: [
        { testDef: lft, status: "IN_PROGRESS" as const, dueAt: minsAhead(20), startedAt: minsAgo(25) },
      ],
      exceptions: [
        {
          type: "QUALITY_ISSUE" as const,
          severity: "CRITICAL" as const,
          status: "ACKNOWLEDGED" as const,
          message: "Hemolyzed specimen detected during centrifugation.",
          createdAt: minsAgo(15),
        },
      ],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(40) },
        { type: "STATUS_CHANGED" as const, fromStatus: "RECEIVED" as const, toStatus: "IN_PROGRESS" as const, note: "Sample processing started.", createdAt: minsAgo(30) },
        { type: "EXCEPTION_RAISED" as const, toStatus: "IN_PROGRESS" as const, note: "Quality issue reported.", createdAt: minsAgo(15) },
      ],
    },
    {
      accessionNumber: "ACC-1008",
      patientReference: "PAT-6620",
      specimenType: "Plasma",
      priority: "ROUTINE" as const,
      status: "COMPLETED" as const,
      receivedAt: minsAgo(240),
      dueAt: minsAgo(120),
      completedAt: minsAgo(90),
      tests: [
        { testDef: lipid, status: "COMPLETED" as const, dueAt: minsAgo(120), startedAt: minsAgo(180), completedAt: minsAgo(90) },
      ],
      exceptions: [],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(240) },
      ],
    },
    {
      accessionNumber: "ACC-1014",
      patientReference: "PAT-7741",
      specimenType: "Blood",
      priority: "ROUTINE" as const,
      status: "REJECTED" as const,
      receivedAt: minsAgo(120),
      dueAt: minsAhead(60),
      completedAt: null,
      tests: [],
      exceptions: [
        {
          type: "MISSING_INFORMATION" as const,
          severity: "LOW" as const,
          status: "RESOLVED" as const,
          message: "Patient requisition form missing signature.",
          createdAt: minsAgo(100),
        },
      ],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(120) },
        { type: "STATUS_CHANGED" as const, fromStatus: "RECEIVED" as const, toStatus: "REJECTED" as const, note: "Sample rejected due to protocol failure.", createdAt: minsAgo(90) },
      ],
    },
    {
      accessionNumber: "ACC-1104",
      patientReference: "PAT-1104",
      specimenType: "Blood",
      priority: "STAT" as const,
      status: "IN_PROGRESS" as const,
      receivedAt: minsAgo(50),
      dueAt: minsAgo(10), // BREACHED
      completedAt: null,
      tests: [
        { testDef: cbc, status: "FAILED" as const, dueAt: minsAgo(10), startedAt: minsAgo(40) },
      ],
      exceptions: [
        {
          type: "QUALITY_ISSUE" as const,
          severity: "CRITICAL" as const,
          status: "OPEN" as const,
          message: "Control out of range during calibration check.",
          createdAt: minsAgo(5),
        },
      ],
      events: [
        { type: "CREATED" as const, toStatus: "RECEIVED" as const, note: "Created and received specimen in laboratory.", createdAt: minsAgo(50) },
        { type: "STATUS_CHANGED" as const, fromStatus: "RECEIVED" as const, toStatus: "IN_PROGRESS" as const, note: "Sample processing started.", createdAt: minsAgo(40) },
        { type: "EXCEPTION_RAISED" as const, toStatus: "IN_PROGRESS" as const, note: "Critical quality issue detected.", createdAt: minsAgo(5) },
      ],
    },
  ];

  for (const s of sampleData) {
    const sample = await prisma.sample.upsert({
      where: {
        labId_accessionNumber: {
          labId: lab.id,
          accessionNumber: s.accessionNumber,
        },
      },
      update: {
        patientReference: s.patientReference,
        specimenType: s.specimenType,
        priority: s.priority,
        status: s.status,
        receivedAt: s.receivedAt,
        dueAt: s.dueAt,
        completedAt: s.completedAt,
      },
      create: {
        labId: lab.id,
        accessionNumber: s.accessionNumber,
        patientReference: s.patientReference,
        specimenType: s.specimenType,
        priority: s.priority,
        status: s.status,
        receivedAt: s.receivedAt,
        dueAt: s.dueAt,
        completedAt: s.completedAt,
      },
    });

    // Seed sample tests
    for (const t of s.tests) {
      await prisma.sampleTest.upsert({
        where: {
          sampleId_testDefinitionId: {
            sampleId: sample.id,
            testDefinitionId: t.testDef.id,
          },
        },
        update: {
          status: t.status,
          dueAt: t.dueAt,
          startedAt: t.startedAt || null,
          completedAt: t.completedAt || null,
        },
        create: {
          sampleId: sample.id,
          testDefinitionId: t.testDef.id,
          status: t.status,
          dueAt: t.dueAt,
          startedAt: t.startedAt || null,
          completedAt: t.completedAt || null,
        },
      });
    }

    // Seed exceptions if none exist yet for sample
    for (const exc of s.exceptions) {
      const existing = await prisma.operationalException.findFirst({
        where: { sampleId: sample.id, type: exc.type, message: exc.message },
      });

      if (!existing) {
        await prisma.operationalException.create({
          data: {
            sampleId: sample.id,
            type: exc.type,
            severity: exc.severity,
            status: exc.status,
            message: exc.message,
            createdAt: exc.createdAt,
            resolvedById: exc.status === "RESOLVED" ? admin.id : null,
            resolvedAt: exc.status === "RESOLVED" ? now : null,
          },
        });
      }
    }

    // Seed sample events if none exist yet
    for (const ev of s.events) {
      const existing = await prisma.sampleEvent.findFirst({
        where: { sampleId: sample.id, type: ev.type, note: ev.note },
      });

      if (!existing) {
        await prisma.sampleEvent.create({
          data: {
            sampleId: sample.id,
            actorId: admin.id,
            type: ev.type,
            fromStatus: (ev as any).fromStatus || null,
            toStatus: (ev as any).toStatus || null,
            note: ev.note,
            createdAt: ev.createdAt,
          },
        });
      }
    }
  }

  console.log("LabFlow seed completed with comprehensive sample records.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });