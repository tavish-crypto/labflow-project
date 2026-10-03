import type { Sample, SlaStatus, SamplePriority, SampleStatus, ExceptionSeverity, ExceptionStatus } from '../types';

export function getSampleSlaStatus(sample: Sample): SlaStatus {
  if (sample.status === 'COMPLETED') return 'COMPLETED';
  if (sample.status === 'REJECTED') return 'NOT_APPLICABLE';
  if (sample.overallSlaStatus && sample.overallSlaStatus !== 'NOT_APPLICABLE') {
    return sample.overallSlaStatus;
  }

  // Fallback to dueAt time calculation
  const due = new Date(sample.dueAt).getTime();
  const now = Date.now();
  const diffMinutes = Math.ceil((due - now) / (1000 * 60));

  if (diffMinutes < 0) return 'BREACHED';
  if (diffMinutes <= 30) return 'AT_RISK';
  return 'SAFE';
}

export function getSlaBadgeInfo(sla: SlaStatus) {
  switch (sla) {
    case 'BREACHED':
      return { label: 'Breached', colorClass: 'badge-breached' };
    case 'AT_RISK':
      return { label: 'At risk', colorClass: 'badge-at-risk' };
    case 'SAFE':
      return { label: 'Safe', colorClass: 'badge-safe' };
    case 'COMPLETED':
      return { label: 'Completed', colorClass: 'badge-completed' };
    default:
      return { label: 'N/A', colorClass: 'badge-slate' };
  }
}

export function getPriorityBadgeInfo(priority: SamplePriority) {
  switch (priority) {
    case 'STAT':
      return { label: 'STAT', colorClass: 'badge-stat' };
    case 'URGENT':
      return { label: 'Urgent', colorClass: 'badge-urgent' };
    case 'ROUTINE':
      return { label: 'Routine', colorClass: 'badge-routine' };
  }
}

export function getStatusBadgeInfo(status: SampleStatus) {
  switch (status) {
    case 'RECEIVED':
      return { label: 'Received', colorClass: 'badge-received' };
    case 'IN_PROGRESS':
      return { label: 'In progress', colorClass: 'badge-in-progress' };
    case 'COMPLETED':
      return { label: 'Completed', colorClass: 'badge-completed' };
    case 'REJECTED':
      return { label: 'Rejected', colorClass: 'badge-rejected' };
  }
}

export function getSeverityBadgeInfo(severity: ExceptionSeverity) {
  switch (severity) {
    case 'CRITICAL':
      return { label: 'Critical', colorClass: 'badge-critical' };
    case 'HIGH':
      return { label: 'High', colorClass: 'badge-high' };
    case 'MEDIUM':
      return { label: 'Medium', colorClass: 'badge-medium' };
    case 'LOW':
      return { label: 'Low', colorClass: 'badge-low' };
  }
}

export function getExceptionStatusBadgeInfo(status: ExceptionStatus) {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', colorClass: 'badge-open' };
    case 'ACKNOWLEDGED':
      return { label: 'Acknowledged', colorClass: 'badge-acknowledged' };
    case 'RESOLVED':
      return { label: 'Resolved', colorClass: 'badge-resolved' };
  }
}
