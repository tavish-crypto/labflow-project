import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import {
  fetchSampleById,
  updateSampleStatus,
  assignTestToSample,
  updateTestStatus,
  createException,
  updateExceptionStatus,
  fetchSampleEvents,
} from '../services/api';
import type {
  Sample,
  SampleStatus,
  TestStatus,
  ExceptionStatus,
  SampleEvent,
  CreateExceptionPayload,
} from '../types';
import {
  getSampleSlaStatus,
  getSlaBadgeInfo,
  getPriorityBadgeInfo,
  getStatusBadgeInfo,
  getSeverityBadgeInfo,
  getExceptionStatusBadgeInfo,
} from '../utils/sla';
import { formatTime, formatDateTime } from '../utils/formatters';
import { UpdateSampleStatusModal } from '../components/UpdateSampleStatusModal';
import { AssignTestModal } from '../components/AssignTestModal';
import { RaiseExceptionModal } from '../components/RaiseExceptionModal';

type DetailTab = 'overview' | 'tests' | 'exceptions' | 'timeline';

export const SampleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as DetailTab) || 'overview';

  const [sample, setSample] = useState<Sample | null>(null);
  const [events, setEvents] = useState<SampleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isAssignTestOpen, setIsAssignTestOpen] = useState(false);
  const [isRaiseExceptionOpen, setIsRaiseExceptionOpen] = useState(false);

  const loadSampleData = async () => {
    if (!id) return;
    try {
      const [sampleData, eventsData] = await Promise.all([
        fetchSampleById(id),
        fetchSampleEvents(id),
      ]);
      setSample(sampleData);
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSampleData();
  }, [id]);

  const setTab = (tab: DetailTab) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: '30px', width: '200px', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '60px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div className="page-container">
        <Link to="/samples" className="back-link">
          <ArrowLeft size={16} /> Back to samples
        </Link>
        <div className="empty-state-card" style={{ marginTop: '2rem' }}>
          <div className="empty-state-title">Sample Not Found</div>
          <div className="empty-state-sub">{error || 'The requested sample could not be found.'}</div>
        </div>
      </div>
    );
  }

  const slaStatus = getSampleSlaStatus(sample);
  const slaBadge = getSlaBadgeInfo(slaStatus);
  const priorityBadge = getPriorityBadgeInfo(sample.priority);
  const statusBadge = getStatusBadgeInfo(sample.status);

  const testsCount = sample.tests?.length || 0;
  const exceptionsCount = sample.exceptions?.length || 0;
  const timelineCount = events.length;

  // Actions
  const handleUpdateStatus = async (newStatus: SampleStatus) => {
    if (!id) return;
    await updateSampleStatus(id, newStatus);
    await loadSampleData();
  };

  const handleAssignTest = async (testDefinitionId: string) => {
    if (!id) return;
    await assignTestToSample(id, testDefinitionId);
    await loadSampleData();
  };

  const handleUpdateTestStatus = async (testId: string, status: TestStatus) => {
    if (!id) return;
    await updateTestStatus(id, testId, status);
    await loadSampleData();
  };

  const handleRaiseException = async (_sId: string, payload: CreateExceptionPayload) => {
    if (!id) return;
    await createException(id, payload);
    await loadSampleData();
  };

  const handleExceptionStatusChange = async (exceptionId: string, status: ExceptionStatus) => {
    if (!id) return;
    await updateExceptionStatus(id, exceptionId, status);
    await loadSampleData();
  };

  return (
    <div className="page-container">
      {/* Back Link */}
      <Link to="/samples" className="back-link">
        <ArrowLeft size={16} /> Back to samples
      </Link>

      {/* Header Info */}
      <div className="sample-detail-header">
        <div>
          <div className="sample-title-row">
            <h1 className="sample-acc-large">{sample.accessionNumber}</h1>
            <span className={`badge ${priorityBadge.colorClass}`}>{priorityBadge.label}</span>
            <span className={`badge ${slaBadge.colorClass}`}>{slaBadge.label}</span>
          </div>
          <div className="sample-sub-meta">
            {sample.patientReference ? `${sample.patientReference} · ` : ''}
            {sample.specimenType} sample
          </div>
        </div>

        <button className="btn-primary" onClick={() => setIsUpdateStatusOpen(true)}>
          Update status
        </button>
      </div>

      {/* Tabs */}
      <div className="detail-tabs-bar">
        <button
          className={`detail-tab ${currentTab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          className={`detail-tab ${currentTab === 'tests' ? 'active' : ''}`}
          onClick={() => setTab('tests')}
        >
          Tests · {testsCount}
        </button>
        <button
          className={`detail-tab ${currentTab === 'exceptions' ? 'active' : ''}`}
          onClick={() => setTab('exceptions')}
        >
          Exceptions · {exceptionsCount}
        </button>
        <button
          className={`detail-tab ${currentTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setTab('timeline')}
        >
          Timeline · {timelineCount}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div>
          {/* Top 4 Stat Cards */}
          <div className="overview-top-cards">
            <div className="overview-stat-card">
              <div className="overview-stat-label">Status</div>
              <div className="overview-stat-val">
                <span className={`badge ${statusBadge.colorClass}`}>{statusBadge.label}</span>
              </div>
            </div>

            <div className="overview-stat-card">
              <div className="overview-stat-label">SLA</div>
              <div className="overview-stat-val">
                <span className={`badge ${slaBadge.colorClass}`}>{slaBadge.label}</span>
              </div>
            </div>

            <div className="overview-stat-card">
              <div className="overview-stat-label">Received</div>
              <div className="overview-stat-val">{formatTime(sample.receivedAt)}</div>
            </div>

            <div className="overview-stat-card">
              <div className="overview-stat-label">Due</div>
              <div className="overview-stat-val">
                {sample.status === 'COMPLETED' ? '—' : formatTime(sample.dueAt)}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="overview-two-col">
            <div className="card-dark">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Sample information
              </h3>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="info-label">Patient Reference</td>
                    <td className="info-value">{sample.patientReference || '—'}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Specimen</td>
                    <td className="info-value">{sample.specimenType}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Priority</td>
                    <td className="info-value">{sample.priority}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Received</td>
                    <td className="info-value">{formatDateTime(sample.receivedAt)}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Due</td>
                    <td className="info-value">{formatDateTime(sample.dueAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card-dark">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Notes & Operational Details
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Specimen collected and logged into LabFlow operational platform. Ensure required tests are assigned and SLA deadlines monitored.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TESTS */}
      {currentTab === 'tests' && (
        <div>
          <div className="tests-header">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tests</h3>
            <button className="btn-outline-blue" onClick={() => setIsAssignTestOpen(true)}>
              <Plus size={16} /> Assign test
            </button>
          </div>

          {!sample.tests || sample.tests.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-title">No tests assigned</div>
              <div className="empty-state-sub">Assign a laboratory test definition to begin processing.</div>
            </div>
          ) : (
            sample.tests.map((test) => {
              const testSla = getSlaBadgeInfo(test.slaStatus || 'SAFE');
              return (
                <div key={test.id} className="test-card-dark">
                  <div className="test-card-header">
                    <div>
                      <div className="test-card-name">
                        {test.testDefinition?.name || test.testDefinition?.code || 'Lab Test'}
                      </div>
                      <div className="test-card-meta">
                        due {formatTime(test.dueAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${testSla.colorClass}`}>{testSla.label}</span>

                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                        value={test.status}
                        onChange={(e) => handleUpdateTestStatus(test.id, e.target.value as TestStatus)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  <div className="test-progress-bar">
                    <div
                      className="test-progress-fill"
                      style={{
                        width:
                          test.status === 'COMPLETED'
                            ? '100%'
                            : test.status === 'IN_PROGRESS'
                            ? '60%'
                            : '10%',
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: EXCEPTIONS */}
      {currentTab === 'exceptions' && (
        <div>
          <div className="tests-header">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Operational exceptions</h3>
            <button className="btn-outline-blue" onClick={() => setIsRaiseExceptionOpen(true)}>
              <Plus size={16} /> Raise exception
            </button>
          </div>

          {!sample.exceptions || sample.exceptions.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-title">No operational exceptions</div>
              <div className="empty-state-sub">No issues or disruptions have been raised for this sample.</div>
            </div>
          ) : (
            sample.exceptions.map((ex) => {
              const severityBadge = getSeverityBadgeInfo(ex.severity);
              const statusBadge = getExceptionStatusBadgeInfo(ex.status);
              const title = ex.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <div
                  key={ex.id}
                  className={`exception-card-dark ${
                    ex.severity === 'CRITICAL'
                      ? 'ex-border-critical'
                      : ex.severity === 'HIGH'
                      ? 'ex-border-high'
                      : ''
                  }`}
                >
                  <div className="exception-card-top">
                    <div className="exception-card-title">
                      <span>{title}</span>
                      <span className={`badge ${severityBadge.colorClass}`}>{severityBadge.label}</span>
                      <span className={`badge ${statusBadge.colorClass}`}>{statusBadge.label}</span>
                    </div>

                    {ex.status === 'OPEN' && (
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleExceptionStatusChange(ex.id, 'ACKNOWLEDGED')}
                      >
                        Acknowledge
                      </button>
                    )}

                    {(ex.status === 'OPEN' || ex.status === 'ACKNOWLEDGED') && (
                      <button
                        className="btn-outline-blue"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
                        onClick={() => handleExceptionStatusChange(ex.id, 'RESOLVED')}
                      >
                        <CheckCircle size={14} /> Resolve exception
                      </button>
                    )}
                  </div>

                  <div className="exception-message">{ex.message}</div>

                  <div className="exception-meta-grid">
                    <div>
                      <div className="exception-meta-label">Created</div>
                      <div className="exception-meta-val">{formatTime(ex.createdAt)}</div>
                    </div>
                    <div>
                      <div className="exception-meta-label">Acknowledged</div>
                      <div className="exception-meta-val">
                        {ex.status !== 'OPEN' ? 'Acknowledged' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="exception-meta-label">Resolved</div>
                      <div className="exception-meta-val">
                        {ex.status === 'RESOLVED' ? formatTime(ex.resolvedAt || ex.createdAt) : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {currentTab === 'timeline' && (
        <div className="timeline-container">
          {events.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-title">No timeline events recorded</div>
            </div>
          ) : (
            <div className="timeline-list">
              {events.map((ev) => {
                let dotClass = 'dot-blue';
                let eventTitle = 'Event';

                switch (ev.type) {
                  case 'CREATED':
                    dotClass = 'dot-cyan';
                    eventTitle = 'Sample received';
                    break;
                  case 'STATUS_CHANGED':
                    dotClass = 'dot-blue';
                    eventTitle = `Status changed (${ev.fromStatus || ''} → ${ev.toStatus || ''})`;
                    break;
                  case 'EXCEPTION_RAISED':
                    dotClass = 'dot-amber';
                    eventTitle = 'Exception raised';
                    break;
                  case 'EXCEPTION_RESOLVED':
                    dotClass = 'dot-green';
                    eventTitle = 'Exception resolved';
                    break;
                  default:
                    dotClass = 'dot-violet';
                    eventTitle = ev.type.replace('_', ' ');
                }

                return (
                  <div key={ev.id} className="timeline-item">
                    <div className={`timeline-dot ${dotClass}`} />
                    <div className="timeline-body">
                      <div>
                        <div className="timeline-event-title">{eventTitle}</div>
                        <div className="timeline-event-note">{ev.note || 'Recorded in laboratory log'}</div>
                      </div>
                      <div className="timeline-event-time">{formatTime(ev.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <UpdateSampleStatusModal
        isOpen={isUpdateStatusOpen}
        onClose={() => setIsUpdateStatusOpen(false)}
        currentStatus={sample.status}
        onUpdateStatus={handleUpdateStatus}
      />

      <AssignTestModal
        isOpen={isAssignTestOpen}
        onClose={() => setIsAssignTestOpen(false)}
        onAssign={handleAssignTest}
        existingTests={sample.tests || []}
      />

      <RaiseExceptionModal
        isOpen={isRaiseExceptionOpen}
        onClose={() => setIsRaiseExceptionOpen(false)}
        onSubmit={handleRaiseException}
        sampleId={sample.id}
      />
    </div>
  );
};
