import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { fetchSamples, createSample } from '../services/api';
import type { Sample, CreateSamplePayload } from '../types';
import { getSampleSlaStatus, getSlaBadgeInfo, getPriorityBadgeInfo } from '../utils/sla';
import { formatTime } from '../utils/formatters';
import { NewSampleModal } from '../components/NewSampleModal';

type FilterTab = 'ALL' | 'IN_PROGRESS' | 'AT_RISK' | 'BREACHED';

export const SamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchUrlQuery = searchParams.get('search') || '';

  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [isNewSampleOpen, setIsNewSampleOpen] = useState(false);

  const loadSamples = async () => {
    try {
      const data = await fetchSamples();
      setSamples(data);
    } catch (err) {
      console.error('Failed to load samples:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
  }, []);

  const handleCreateSample = async (payload: CreateSamplePayload) => {
    await createSample(payload);
    await loadSamples();
  };

  // Derive counts for filter pills
  const totalCount = samples.length;
  const inProgressCount = samples.filter((s) => s.status === 'IN_PROGRESS').length;
  const atRiskCount = samples.filter((s) => getSampleSlaStatus(s) === 'AT_RISK').length;
  const breachedCount = samples.filter((s) => getSampleSlaStatus(s) === 'BREACHED').length;

  // Filter samples based on tab and search query
  const filteredSamples = samples.filter((s) => {
    // Tab filter
    if (activeTab === 'IN_PROGRESS' && s.status !== 'IN_PROGRESS') return false;
    if (activeTab === 'AT_RISK' && getSampleSlaStatus(s) !== 'AT_RISK') return false;
    if (activeTab === 'BREACHED' && getSampleSlaStatus(s) !== 'BREACHED') return false;

    // Search query filter
    if (searchUrlQuery) {
      const q = searchUrlQuery.toLowerCase();
      const matchAcc = s.accessionNumber.toLowerCase().includes(q);
      const matchPat = (s.patientReference || '').toLowerCase().includes(q);
      const matchSpec = s.specimenType.toLowerCase().includes(q);
      if (!matchAcc && !matchPat && !matchSpec) return false;
    }

    return true;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Samples</h1>
          <p className="page-subtitle">
            {totalCount} {totalCount === 1 ? 'sample' : 'samples'} in the lab
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsNewSampleOpen(true)}>
          <Plus size={18} />
          <span>Add sample</span>
        </button>
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
          className={`filter-pill ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('IN_PROGRESS')}
        >
          In progress · {inProgressCount}
        </button>
        <button
          className={`filter-pill ${activeTab === 'AT_RISK' ? 'active' : ''}`}
          onClick={() => setActiveTab('AT_RISK')}
        >
          At risk · {atRiskCount}
        </button>
        <button
          className={`filter-pill ${activeTab === 'BREACHED' ? 'active' : ''}`}
          onClick={() => setActiveTab('BREACHED')}
        >
          Breached · {breachedCount}
        </button>
      </div>

      {/* Samples Table */}
      <div className="table-container-dark">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-title">No samples found</div>
            <div className="empty-state-sub">Try adjusting your filters or search criteria.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr>
                <th>Accession</th>
                <th>Patient Ref</th>
                <th>Specimen</th>
                <th>Priority</th>
                <th>SLA</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.map((sample) => {
                const slaStatus = getSampleSlaStatus(sample);
                const slaBadge = getSlaBadgeInfo(slaStatus);
                const priorityBadge = getPriorityBadgeInfo(sample.priority);

                return (
                  <tr
                    key={sample.id}
                    className="dark-table-row"
                    onClick={() => navigate(`/samples/${sample.id}`)}
                  >
                    <td className="td-accession">{sample.accessionNumber}</td>
                    <td className="td-patient">{sample.patientReference || '—'}</td>
                    <td>{sample.specimenType}</td>
                    <td>
                      <span className={`badge ${priorityBadge.colorClass}`}>
                        {priorityBadge.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${slaBadge.colorClass}`}>
                        {slaBadge.label}
                      </span>
                    </td>
                    <td className="td-due">
                      {sample.status === 'COMPLETED' ? '—' : formatTime(sample.dueAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
