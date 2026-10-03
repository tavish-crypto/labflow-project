export type SamplePriority = 'ROUTINE' | 'URGENT' | 'STAT';
export type SampleStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type TestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ExceptionType = 'DELAY' | 'QUALITY_ISSUE' | 'MISSING_INFORMATION' | 'EQUIPMENT_FAILURE' | 'OTHER';
export type ExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ExceptionStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
export type SampleEventType = 'CREATED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'EXCEPTION_RAISED' | 'EXCEPTION_RESOLVED';

export type SlaStatus = 'SAFE' | 'AT_RISK' | 'BREACHED' | 'COMPLETED' | 'NOT_APPLICABLE';

export interface TestDefinition {
  id: string;
  labId: string;
  code: string;
  name: string;
  slaMinutes: number;
}

export interface SampleTest {
  id: string;
  sampleId: string;
  testDefinitionId: string;
  status: TestStatus;
  dueAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  testDefinition?: TestDefinition;
  slaStatus?: SlaStatus;
  minutesRemaining?: number | null;
}

export interface OperationalException {
  id: string;
  sampleId: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  message: string;
  resolvedById?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface GlobalExceptionItem extends OperationalException {
  sample?: {
    id: string;
    accessionNumber: string;
    patientReference?: string | null;
    specimenType: string;
    priority: SamplePriority;
    status: SampleStatus;
    dueAt: string;
  };
  resolvedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface SampleEvent {
  id: string;
  sampleId: string;
  actorId?: string | null;
  type: SampleEventType;
  fromStatus?: SampleStatus | null;
  toStatus?: SampleStatus | null;
  note?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface Sample {
  id: string;
  labId: string;
  accessionNumber: string;
  patientReference?: string | null;
  specimenType: string;
  priority: SamplePriority;
  status: SampleStatus;
  collectedAt?: string | null;
  receivedAt: string;
  dueAt: string;
  completedAt?: string | null;
  tests?: SampleTest[];
  events?: SampleEvent[];
  exceptions?: OperationalException[];
  overallSlaStatus?: SlaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  RECEIVED?: number;
  IN_PROGRESS?: number;
  COMPLETED?: number;
  REJECTED?: number;
  OPEN?: number;
  ACKNOWLEDGED?: number;
  RESOLVED?: number;
  slaAtRisk?: number;
  slaBreached?: number;
}

export interface CreateSamplePayload {
  labId: string;
  accessionNumber: string;
  patientReference?: string;
  specimenType: string;
  priority: SamplePriority;
  dueAt: string;
}

export interface CreateExceptionPayload {
  type: ExceptionType;
  severity?: ExceptionSeverity;
  message: string;
}
