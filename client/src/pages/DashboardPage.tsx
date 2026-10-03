import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { fetchSamples, fetchDashboardSummary, fetchExceptions, createSample } from '../services/api';
import type { Sample, GlobalExceptionItem, CreateSamplePayload } from '../types';
import { getSampleSlaStatus } from '../utils/sla';
import { formatTime, formatDate } from '../utils/formatters';
import { NewSampleModal } from '../components/NewSampleModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [exceptions, setExceptions] = useState<GlobalExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewSampleOpen, setIsNewSampleOpen] = useState(false);

  const loadData = async () => {
    try {
      const [sampleData, _summaryData, excData] = await Promise.all([
        fetchSamples(),
        fetchDashboardSummary(),
        fetchExceptions(),
      ]);
      setSamples(sampleData);
      setExceptions(excData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSample = async (payload: CreateSamplePayload) => {
    await createSample(payload);
    await loadData();
  };

  // Derive SLA Health calculations from real samples
  const activeSamples = samples.filter((s) => s.status !== 'REJECTED');
  const breachedSamples = activeSamples.filter((s) => getSampleSlaStatus(s) === 'BREACHED');
  const atRiskSamples = activeSamples.filter((s) => getSampleSlaStatus(s) === 'AT_RISK');
  const inProgressSamples = activeSamples.filter((s) => s.status === 'IN_PROGRESS');

  const onTimeSamplesCount = activeSamples.length - breachedSamples.length;
  const slaPercentage = activeSamples.length > 0
    ? ((onTimeSamplesCount / activeSamples.length) * 100).toFixed(1)
    : '100.0';

  // Calculate critical/high open exceptions count
  const openCriticalExceptions = exceptions.filter(
    (ex) => ex.status !== 'RESOLVED' && (ex.severity === 'CRITICAL' || ex.severity === 'HIGH')
  ).length;

  // Build Live Alerts list from real data
  const liveAlerts: { id: string; title: string; subtitle: string; sampleId: string; severity: 'red' | 'amber' }[] = [];

  // 1. Breached samples
  breachedSamples.slice(0, 2).forEach((s) => {
    liveAlerts.push({
      id: `breached-${s.id}`,
      title: `${s.accessionNumber} SLA breached`,
      subtitle: `${s.specimenType} · due ${formatTime(s.dueAt)}`,
      sampleId: s.id,
      severity: 'red',
    });
  });

  // 2. High/Critical open exceptions
  exceptions
    .filter((ex) => ex.status !== 'RESOLVED' && (ex.severity === 'CRITICAL' || ex.severity === 'HIGH'))
    .slice(0, 2)
    .forEach((ex) => {
      liveAlerts.push({
        id: `exc-${ex.id}`,
        title: ex.type.replace('_', ' '),
        subtitle: `${ex.sample?.accessionNumber || 'Sample'} · ${formatTime(ex.createdAt)}`,
        sampleId: ex.sampleId,
        severity: ex.severity === 'CRITICAL' ? 'red' : 'amber',
      });
    });

  // 3. At risk samples
  atRiskSamples.slice(0, 2).forEach((s) => {
    if (liveAlerts.length < 4) {
      liveAlerts.push({
        id: `risk-${s.id}`,
        title: `${s.accessionNumber} at risk`,
        subtitle: `${s.specimenType} · due ${formatTime(s.dueAt)}`,
        sampleId: s.id,
        severity: 'amber',
      });
    }
  });

  // Group samples into Pipeline columns
  const receivedPipeline = samples.filter((s) => s.status === 'RECEIVED');
  const inProgressPipeline = samples.filter((s) => s.status === 'IN_PROGRESS');
  const rejectedPipeline = samples.filter((s) => s.status === 'REJECTED');
  const completedPipeline = samples.filter((s) => s.status === 'COMPLETED');

  // Circle stroke offset for SVG ring
  const circleRadius = 50;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (parseFloat(slaPercentage) / 100) * circumference;

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: '40px', width: '250px', marginBottom: '1.5rem' }} />
        <div className="dashboard-grid">
          <div className="skeleton" style={{ height: '180px' }} />
          <div className="skeleton" style={{ height: '180px' }} />
        </div>
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, Tavish</h1>
          <p className="page-subtitle">
            Jaipur Diagnostics · {formatDate(new Date())}
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsNewSampleOpen(true)}>
          <Plus size={18} />
          <span>Add sample</span>
        </button>
      </div>

      {/* SLA Health and Live Alerts Grid */}
      <div className="dashboard-grid">
        {/* SLA Health Card */}
        <div className="card-dark">
          <div className="sla-health-content">
            {/* Circular Progress Ring */}
            <div className="sla-ring-container">
              <svg className="sla-ring-svg" viewBox="0 0 120 120">
                <circle
                  className="sla-ring-bg"
                  cx="60"
                  cy="60"
                  r={circleRadius}
                />
                <circle
                  className="sla-ring-fill"
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="sla-ring-text-container">
                <span className="sla-ring-percentage">{slaPercentage}%</span>
                <span className="sla-ring-label">on time</span>
              </div>
            </div>

            {/* SLA Health Metrics */}
            <div className="sla-health-details">
              <h2 className="sla-health-title">SLA health</h2>
              <p className="sla-health-sub">
                {onTimeSamplesCount} of {activeSamples.length} samples within SLA today
              </p>

              <div className="sla-metrics-row">
                <div className="sla-metric-item">
                  <div className="metric-label">In progress</div>
                  <div className="metric-val val-blue">{inProgressSamples.length}</div>
                </div>
                <div className="sla-metric-item">
                  <div className="metric-label">At risk</div>
                  <div className="metric-val val-amber">{atRiskSamples.length}</div>
                </div>
                <div className="sla-metric-item">
                  <div className="metric-label">Breached</div>
                  <div className="metric-val val-red">{breachedSamples.length}</div>
                </div>
                <div className="sla-metric-item">
                  <div className="metric-label">Critical</div>
                  <div className="metric-val val-red">{openCriticalExceptions}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Alerts Card */}
        <div className="card-dark">
          <h2 className="live-alerts-header">Live alerts</h2>
          {liveAlerts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
              No active SLA breaches or critical issues.
            </p>
          ) : (
            <div className="alerts-list">
              {liveAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="alert-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/samples/${alert.sampleId}`)}
                >
                  <div className={`alert-dot dot-${alert.severity}`} />
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-subtitle">{alert.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sample Pipeline Section */}
      <div className="pipeline-section">
        <h2 className="section-title">Sample pipeline</h2>

        <div className="pipeline-columns-grid">
          {/* Received Column */}
          <div>
            <div className="pipeline-col-header">
              <span>Received</span>
              <span>{receivedPipeline.length}</span>
            </div>
            <div className="pipeline-cards-stack">
              {receivedPipeline.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="pipeline-card"
                  onClick={() => navigate(`/samples/${s.id}`)}
                >
                  <div className="pipeline-card-top">
                    <span className="pipeline-acc">{s.accessionNumber}</span>
                    <div className="status-dot-sm" style={{ backgroundColor: 'var(--blue-primary)' }} />
                  </div>
                  <div className="pipeline-patient">
                    {s.patientReference ? `${s.patientReference} · ` : ''}{s.specimenType}
                  </div>
                  <div className="pipeline-due">Due {formatTime(s.dueAt)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <div className="pipeline-col-header">
              <span>In progress</span>
              <span>{inProgressPipeline.length}</span>
            </div>
            <div className="pipeline-cards-stack">
              {inProgressPipeline.slice(0, 3).map((s) => {
                const sla = getSampleSlaStatus(s);
                const dotColor = sla === 'BREACHED' ? 'var(--red)' : sla === 'AT_RISK' ? 'var(--amber)' : 'var(--blue-primary)';
                return (
                  <div
                    key={s.id}
                    className="pipeline-card"
                    onClick={() => navigate(`/samples/${s.id}`)}
                  >
                    <div className="pipeline-card-top">
                      <span className="pipeline-acc">{s.accessionNumber}</span>
                      <div className="status-dot-sm" style={{ backgroundColor: dotColor }} />
                    </div>
                    <div className="pipeline-patient">
                      {s.patientReference ? `${s.patientReference} · ` : ''}{s.specimenType}
                    </div>
                    <div className="pipeline-due">Due {formatTime(s.dueAt)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rejected Column */}
          <div>
            <div className="pipeline-col-header">
              <span>Rejected</span>
              <span>{rejectedPipeline.length}</span>
            </div>
            <div className="pipeline-cards-stack">
              {rejectedPipeline.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="pipeline-card"
                  onClick={() => navigate(`/samples/${s.id}`)}
                >
                  <div className="pipeline-card-top">
                    <span className="pipeline-acc">{s.accessionNumber}</span>
                    <div className="status-dot-sm" style={{ backgroundColor: 'var(--amber)' }} />
                  </div>
                  <div className="pipeline-patient">
                    {s.patientReference ? `${s.patientReference} · ` : ''}{s.specimenType}
                  </div>
                  <div className="pipeline-due">Due {formatTime(s.dueAt)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div>
            <div className="pipeline-col-header">
              <span>Completed</span>
              <span>{completedPipeline.length}</span>
            </div>
            <div className="pipeline-cards-stack">
              {completedPipeline.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="pipeline-card"
                  onClick={() => navigate(`/samples/${s.id}`)}
                >
                  <div className="pipeline-card-top">
                    <span className="pipeline-acc">{s.accessionNumber}</span>
                    <div className="status-dot-sm" style={{ backgroundColor: 'var(--green)' }} />
                  </div>
                  <div className="pipeline-patient">
                    {s.patientReference ? `${s.patientReference} · ` : ''}{s.specimenType}
                  </div>
                  <div className="pipeline-due">Due —</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Sample Modal */}
      <NewSampleModal
        isOpen={isNewSampleOpen}
        onClose={() => setIsNewSampleOpen(false)}
        onSubmit={handleCreateSample}
      />
    </div>
  );
};
