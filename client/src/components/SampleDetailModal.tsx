import React, { useState, useEffect } from 'react';
import type {
  Sample,
  SampleStatus,
  TestDefinition,
  TestStatus,
  ExceptionStatus
} from '../types';
import { fetchSampleById, fetchTestDefinitions } from '../services/api';
import {
  X,
  Plus,
  AlertTriangle,
  FlaskConical,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

interface SampleDetailModalProps {
  sampleId: string | null;
  onClose: () => void;
  onUpdateSampleStatus: (id: string, status: SampleStatus) => Promise<void>;
  onAssignTest: (sampleId: string, testDefId: string) => Promise<void>;
  onUpdateTestStatus: (sampleId: string, testId: string, status: TestStatus) => Promise<void>;
  onUpdateExceptionStatus: (sampleId: string, exceptionId: string, status: ExceptionStatus) => Promise<void>;
  onOpenExceptionModal: (sampleId: string, accessionNumber: string) => void;
}

type DetailTab = 'OVERVIEW' | 'EXCEPTIONS' | 'TIMELINE';

export const SampleDetailModal: React.FC<SampleDetailModalProps> = ({
  sampleId,
  onClose,
  onUpdateSampleStatus,
  onAssignTest,
  onUpdateTestStatus,
  onUpdateExceptionStatus,
  onOpenExceptionModal,
}) => {
  const [sample, setSample] = useState<Sample | null>(null);
  const [testDefs, setTestDefs] = useState<TestDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('OVERVIEW');
  const [selectedTestDefId, setSelectedTestDefId] = useState('');

  const loadDetails = async () => {
    if (!sampleId) return;
    setLoading(true);
    setError(null);
    try {
      const [sampleData, defs] = await Promise.all([
        fetchSampleById(sampleId),
        fetchTestDefinitions(),
      ]);
      setSample(sampleData);
      setTestDefs(defs);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sampleId) {
      loadDetails();
      setActiveTab('OVERVIEW');
    }
  }, [sampleId]);

  if (!sampleId) return null;

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestDefId || !sample) return;
    try {
      await onAssignTest(sample.id, selectedTestDefId);
      setSelectedTestDefId('');
      await loadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to assign test');
    }
  };

  const handleSampleStatusChange = async (newStatus: SampleStatus) => {
    if (!sample) return;
    try {
      await onUpdateSampleStatus(sample.id, newStatus);
      await loadDetails();
    } catch (err: any) {
      alert(err.message || 'Status change failed');
    }
  };

  const handleTestStatusChange = async (testId: string, newStatus: TestStatus) => {
    if (!sample) return;
    try {
      await onUpdateTestStatus(sample.id, testId, newStatus);
      await loadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update test status');
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    if (!sample) return;
    try {
      await onUpdateExceptionStatus(sample.id, exceptionId, 'RESOLVED');
      await loadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve exception');
    }
  };

  const openExceptionsCount = sample?.exceptions?.filter((e) => e.status !== 'RESOLVED').length || 0;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon">
              <FlaskConical size={22} />
            </div>
            <div>
              <h2 className="drawer-acc">{sample?.accessionNumber || 'Loading...'}</h2>
              <span className="drawer-sub">Lab ID: {sample?.labId || '—'}</span>
            </div>
          </div>

          <div className="drawer-actions">
            <button className="icon-btn-rounded" onClick={loadDetails} title="Refresh Specimen">
              <RefreshCw size={16} />
            </button>
            <button className="icon-btn-rounded" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Navigation Tabs */}
        <div className="drawer-tabs">
          <button
            className={`drawer-tab ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            <FileText size={15} /> Overview & Tests
          </button>

          <button
            className={`drawer-tab ${activeTab === 'EXCEPTIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('EXCEPTIONS')}
          >
            <AlertTriangle size={15} /> Exceptions {openExceptionsCount > 0 && <span className="tab-pill-alert">{openExceptionsCount}</span>}
          </button>

          <button
            className={`drawer-tab ${activeTab === 'TIMELINE' ? 'active' : ''}`}
            onClick={() => setActiveTab('TIMELINE')}
          >
            <Clock size={15} /> Event History
          </button>
        </div>

        {/* Content Body */}
        <div className="drawer-body">
          {loading ? (
            <div className="loading-state">Loading specimen details...</div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : sample ? (
            <>
              {/* TAB 1: OVERVIEW & TESTS */}
              {activeTab === 'OVERVIEW' && (
                <div className="tab-content">
                  {/* Status Change Bar */}
                  <div className="card-box">
                    <span className="card-title">Specimen Workflow Status</span>
                    <div className="status-button-grid">
                      {(['RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as SampleStatus[]).map((st) => (
                        <button
                          key={st}
                          className={`btn-status-chip ${sample.status === st ? 'active-' + st.toLowerCase() : ''}`}
                          onClick={() => handleSampleStatusChange(st)}
                          disabled={sample.status === st}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metadata Cards */}
                  <div className="meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Patient Reference</span>
                      <span className="meta-val">{sample.patientReference || 'Unassigned'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Specimen Type</span>
                      <span className="meta-val">{sample.specimenType}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Priority Level</span>
                      <span className={`priority-tag priority-${sample.priority.toLowerCase()}`}>
                        {sample.priority}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Target SLA Due</span>
                      <span className="meta-val highlight-blue">
                        {new Date(sample.dueAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Tests */}
                  <div className="card-box">
                    <div className="flex-between mb-3">
                      <span className="card-title">Assigned Laboratory Tests</span>
                      <span className="card-count">{sample.tests?.length || 0} Assigned</span>
                    </div>

                    {sample.tests && sample.tests.length > 0 ? (
                      <div className="test-list">
                        {sample.tests.map((t) => (
                          <div key={t.id} className="test-item-card">
                            <div>
                              <span className="test-code">{t.testDefinition?.code || 'TEST'}</span>
                              <p className="test-name">{t.testDefinition?.name || 'Lab Test'}</p>
                            </div>
                            <div className="flex-center gap-2">
                              <select
                                value={t.status}
                                onChange={(e) => handleTestStatusChange(t.id, e.target.value as TestStatus)}
                                className="select-compact"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="FAILED">FAILED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-info">No tests currently assigned to this specimen.</p>
                    )}

                    {/* Add Test Form */}
                    <form onSubmit={handleAddTest} className="add-test-bar">
                      <select
                        value={selectedTestDefId}
                        onChange={(e) => setSelectedTestDefId(e.target.value)}
                        required
                        className="select-input"
                      >
                        <option value="">+ Select Test Definition to Assign</option>
                        {testDefs.map((def) => (
                          <option key={def.id} value={def.id}>
                            {def.code} - {def.name} ({def.slaMinutes}m SLA)
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn-secondary-sm" disabled={!selectedTestDefId}>
                        <Plus size={14} /> Assign
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: EXCEPTIONS */}
              {activeTab === 'EXCEPTIONS' && (
                <div className="tab-content">
                  <div className="flex-between mb-3">
                    <span className="card-title">Operational Exceptions Log</span>
                    <button
                      className="btn-danger-sm"
                      onClick={() => onOpenExceptionModal(sample.id, sample.accessionNumber)}
                    >
                      <AlertTriangle size={14} /> Report Exception
                    </button>
                  </div>

                  {sample.exceptions && sample.exceptions.length > 0 ? (
                    <div className="exceptions-stack">
                      {sample.exceptions.map((ex) => (
                        <div key={ex.id} className={`ex-card ex-${ex.severity.toLowerCase()}`}>
                          <div className="flex-between">
                            <span className="ex-badge-type">{ex.type}</span>
                            <span className={`ex-status-pill ex-st-${ex.status.toLowerCase()}`}>{ex.status}</span>
                          </div>
                          <p className="ex-body-text">{ex.message}</p>
                          <div className="ex-footer">
                            <span className="ex-time">{new Date(ex.createdAt).toLocaleString()}</span>
                            {ex.status !== 'RESOLVED' && (
                              <button
                                className="btn-resolve"
                                onClick={() => handleResolveException(ex.id)}
                              >
                                <CheckCircle size={13} /> Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-box">
                      <CheckCircle size={28} className="text-emerald" />
                      <p className="empty-title">No exceptions logged</p>
                      <p className="empty-sub">This specimen is proceeding normally without bottlenecks.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TIMELINE AUDIT */}
              {activeTab === 'TIMELINE' && (
                <div className="tab-content">
                  <span className="card-title mb-3 block">Specimen History Timeline</span>
                  {sample.events && sample.events.length > 0 ? (
                    <div className="audit-timeline">
                      {sample.events.map((ev) => (
                        <div key={ev.id} className="audit-node">
                          <div className="audit-marker" />
                          <div className="audit-card">
                            <div className="flex-between">
                              <span className="audit-event">{ev.type}</span>
                              <span className="audit-time">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                            </div>
                            {ev.fromStatus && ev.toStatus && (
                              <p className="audit-desc">
                                Status transition: <strong>{ev.fromStatus}</strong> &rarr; <strong>{ev.toStatus}</strong>
                              </p>
                            )}
                            {ev.note && <p className="audit-note">{ev.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-info">No timeline history recorded.</p>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
