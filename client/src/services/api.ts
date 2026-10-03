import type {
  Sample,
  TestDefinition,
  SampleTest,
  OperationalException,
  GlobalExceptionItem,
  SampleEvent,
  DashboardSummary,
  CreateSamplePayload,
  CreateExceptionPayload,
  SampleStatus,
  TestStatus,
  ExceptionStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/api/dashboard/summary`);
  return handleResponse<DashboardSummary>(res);
}

export async function fetchSamples(): Promise<Sample[]> {
  const res = await fetch(`${API_BASE}/api/samples`);
  return handleResponse<Sample[]>(res);
}

export async function fetchSampleById(id: string): Promise<Sample> {
  const res = await fetch(`${API_BASE}/api/samples/${id}`);
  return handleResponse<Sample>(res);
}

export async function createSample(payload: CreateSamplePayload): Promise<Sample> {
  const res = await fetch(`${API_BASE}/api/samples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Sample>(res);
}

export async function updateSampleStatus(id: string, status: SampleStatus): Promise<Sample> {
  const res = await fetch(`${API_BASE}/api/samples/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Sample>(res);
}

export async function fetchTestDefinitions(): Promise<TestDefinition[]> {
  const res = await fetch(`${API_BASE}/api/samples/test-definitions`);
  return handleResponse<TestDefinition[]>(res);
}

export async function assignTestToSample(sampleId: string, testDefinitionId: string): Promise<SampleTest> {
  const res = await fetch(`${API_BASE}/api/samples/${sampleId}/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testDefinitionId }),
  });
  return handleResponse<SampleTest>(res);
}

export async function updateTestStatus(
  sampleId: string,
  sampleTestId: string,
  status: TestStatus
): Promise<SampleTest> {
  const res = await fetch(`${API_BASE}/api/samples/${sampleId}/tests/${sampleTestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<SampleTest>(res);
}

export async function createException(
  sampleId: string,
  payload: CreateExceptionPayload
): Promise<OperationalException> {
  const res = await fetch(`${API_BASE}/api/samples/${sampleId}/exceptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<OperationalException>(res);
}

export async function updateExceptionStatus(
  sampleId: string,
  exceptionId: string,
  status: ExceptionStatus
): Promise<OperationalException> {
  const res = await fetch(`${API_BASE}/api/samples/${sampleId}/exceptions/${exceptionId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<OperationalException>(res);
}

export async function fetchExceptions(filters?: {
  status?: string;
  severity?: string;
  type?: string;
}): Promise<GlobalExceptionItem[]> {
  const query = new URLSearchParams();
  if (filters?.status) query.set('status', filters.status);
  if (filters?.severity) query.set('severity', filters.severity);
  if (filters?.type) query.set('type', filters.type);

  const res = await fetch(`${API_BASE}/api/exceptions?${query.toString()}`);
  return handleResponse<GlobalExceptionItem[]>(res);
}

export async function fetchSampleEvents(sampleId: string): Promise<SampleEvent[]> {
  const res = await fetch(`${API_BASE}/api/samples/${sampleId}/events`);
  return handleResponse<SampleEvent[]>(res);
}

