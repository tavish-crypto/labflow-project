-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "SamplePriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SampleEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'NOTE_ADDED', 'EXCEPTION_RAISED', 'EXCEPTION_RESOLVED');

-- CreateEnum
CREATE TYPE "ExceptionSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ExceptionStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('DELAY', 'QUALITY_ISSUE', 'MISSING_INFORMATION', 'EQUIPMENT_FAILURE', 'OTHER');

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDefinition" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slaMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "accessionNumber" TEXT NOT NULL,
    "patientReference" TEXT,
    "specimenType" TEXT NOT NULL,
    "priority" "SamplePriority" NOT NULL DEFAULT 'ROUTINE',
    "status" "SampleStatus" NOT NULL DEFAULT 'RECEIVED',
    "collectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleTest" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "testDefinitionId" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleEvent" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "SampleEventType" NOT NULL,
    "fromStatus" "SampleStatus",
    "toStatus" "SampleStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalException" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "type" "ExceptionType" NOT NULL,
    "severity" "ExceptionSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "ExceptionStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_code_key" ON "Lab"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_labId_idx" ON "User"("labId");

-- CreateIndex
CREATE INDEX "TestDefinition_labId_idx" ON "TestDefinition"("labId");

-- CreateIndex
CREATE UNIQUE INDEX "TestDefinition_labId_code_key" ON "TestDefinition"("labId", "code");

-- CreateIndex
CREATE INDEX "Sample_labId_status_idx" ON "Sample"("labId", "status");

-- CreateIndex
CREATE INDEX "Sample_labId_dueAt_idx" ON "Sample"("labId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_labId_accessionNumber_key" ON "Sample"("labId", "accessionNumber");

-- CreateIndex
CREATE INDEX "SampleTest_sampleId_idx" ON "SampleTest"("sampleId");

-- CreateIndex
CREATE INDEX "SampleTest_status_dueAt_idx" ON "SampleTest"("status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "SampleTest_sampleId_testDefinitionId_key" ON "SampleTest"("sampleId", "testDefinitionId");

-- CreateIndex
CREATE INDEX "SampleEvent_sampleId_createdAt_idx" ON "SampleEvent"("sampleId", "createdAt");

-- CreateIndex
CREATE INDEX "SampleEvent_actorId_idx" ON "SampleEvent"("actorId");

-- CreateIndex
CREATE INDEX "OperationalException_sampleId_status_idx" ON "OperationalException"("sampleId", "status");

-- CreateIndex
CREATE INDEX "OperationalException_severity_status_idx" ON "OperationalException"("severity", "status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDefinition" ADD CONSTRAINT "TestDefinition_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTest" ADD CONSTRAINT "SampleTest_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTest" ADD CONSTRAINT "SampleTest_testDefinitionId_fkey" FOREIGN KEY ("testDefinitionId") REFERENCES "TestDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleEvent" ADD CONSTRAINT "SampleEvent_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleEvent" ADD CONSTRAINT "SampleEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalException" ADD CONSTRAINT "OperationalException_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalException" ADD CONSTRAINT "OperationalException_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
