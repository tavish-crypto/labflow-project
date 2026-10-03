import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { fetchExceptions, createException, fetchSamples } from '../services/api';
import type { GlobalExceptionItem, Sample, CreateExceptionPayload } from '../types';
import { getSeverityBadgeInfo, getExceptionStatusBadgeInfo } from '../utils/sla';
import { RaiseExceptionModal } from '../components/RaiseExceptionModal';

type FilterTab = 'ALL' | 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export const ExceptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [exceptions, setExceptions] = useState<GlobalExceptionItem[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [excData, sampleData] = await Promise.all([
        fetchExceptions(),
        fetchSamples(),
      ]);
      setExceptions(excData);
      setSamples(sampleData);
    } catch (err) {
      console.error('Failed to load exceptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRaiseException = async (sampleId: string, payload: CreateExceptionPayload) => {
    await createException(sampleId, payload);
    await loadData();
  };

  // Derive summary stats
  const openCount = exceptions.filter((ex) => ex.status === 'OPEN').length;
  const criticalCount = exceptions.filter(
    (ex) => ex.status !== 'RESOLVED' && ex.severity === 'CRITICAL'
  ).length;
  const needsAckCount = exceptions.filter((ex) => ex.status === 'OPEN').length;
  const totalCount = exceptions.length;

  // Filter exceptions by tab
  const filteredExceptions = exceptions.filter((ex) => {
    if (activeTab === 'OPEN') return ex.status === 'OPEN';
    if (activeTab === 'ACKNOWLEDGED') return ex.status === 'ACKNOWLEDGED';
    if (activeTab === 'RESOLVED') return ex.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Exceptions</h1>
          <p className="page-subtitle">Operational issues across all samples</p>
        </div>

        <button className="btn-primary" onClick={() => setIsRaiseModalOpen(true)}>
          <Plus size={18} />
          <span>Raise exception</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="summary-card-title">Open exceptions</div>
          <div className="summary-card-value" style={{ color: 'var(--blue-primary)' }}>
            {openCount}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-title">Critical issues</div>
          <div className="summary-card-value" style={{ color: 'var(--red)' }}>
            {criticalCount}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-title">Needs acknowledgement</div>
          <div className="summary-card-value" style={{ color: 'var(--amber)' }}>
            {needsAckCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="filter-tabs">
        <button
          className={`filter-pill ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All · {totalCount}
        </button>
        <button
          className={`filter-pill ${activeTab === 'OPEN' ? 'active' : ''}`}
          onClick={() => setActiveTab('OPEN')}
        >
          Open
        </button>
        <button
          className={`filter-pill ${activeTab === 'ACKNOWLEDGED' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACKNOWLEDGED')}
        >
          Acknowledged
        </button>
        <button
          className={`filter-pill ${activeTab === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => setActiveTab('RESOLVED')}
        >
          Resolved
        </button>
      </div>

      {/* Exceptions Table */}
      <div className="table-container-dark">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : filteredExceptions.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-title">No operational exceptions</div>
            <div className="empty-state-sub">There are currently no recorded issues matching this filter.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr>
                <th>Exception</th>
                <th>Sample</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExceptions.map((ex) => {
                const severityBadge = getSeverityBadgeInfo(ex.severity);
                const statusBadge = getExceptionStatusBadgeInfo(ex.status);
                const title = ex.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <tr
                    key={ex.id}
                    className="dark-table-row"
                    onClick={() => navigate(`/samples/${ex.sampleId}?tab=exceptions`)}
                  >
                    <td className="td-accession">{title}</td>
                    <td className="td-patient">
                      {ex.sample?.accessionNumber || ex.sampleId}
                    </td>
                    <td>
                      <span className={`badge ${severityBadge.colorClass}`}>
                        {severityBadge.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge.colorClass}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Raise Exception Modal */}
      <RaiseExceptionModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onSubmit={handleRaiseException}
        samples={samples}
      />
    </div>
  );
};
