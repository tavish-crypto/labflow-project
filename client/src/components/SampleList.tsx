import React, { useState } from 'react';
import type { Sample, SampleStatus } from '../types';
import { Search, Plus, Clock, ChevronRight, AlertTriangle } from 'lucide-react';

interface SampleListProps {
  samples: Sample[];
  onSelectSample: (sampleId: string) => void;
  onOpenNewSampleModal: () => void;
  onOpenExceptionModal: (sampleId: string, accessionNumber: string) => void;
}

type TabType = 'ALL' | 'ACTIVE' | 'ATTENTION' | 'COMPLETED';

export const SampleList: React.FC<SampleListProps> = ({
  samples,
  onSelectSample,
  onOpenNewSampleModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Calculate tabs counts
  const countAll = samples.length;
  const countActive = samples.filter((s) => s.status === 'RECEIVED' || s.status === 'IN_PROGRESS').length;
  const countCompleted = samples.filter((s) => s.status === 'COMPLETED').length;
  const countAttention = samples.filter((s) => {
    const dueTime = new Date(s.dueAt).getTime();
    const isOverdue = dueTime - Date.now() < 2 * 60 * 60 * 1000 && s.status !== 'COMPLETED';
    const hasExceptions = s.exceptions && s.exceptions.some((ex) => ex.status !== 'RESOLVED');
    return isOverdue || hasExceptions;
  }).length;

  const filteredSamples = samples.filter((s) => {
    // Tab filter
    if (activeTab === 'ACTIVE' && !(s.status === 'RECEIVED' || s.status === 'IN_PROGRESS')) return false;
    if (activeTab === 'COMPLETED' && s.status !== 'COMPLETED') return false;
    if (activeTab === 'ATTENTION') {
      const dueTime = new Date(s.dueAt).getTime();
      const isOverdue = dueTime - Date.now() < 2 * 60 * 60 * 1000 && s.status !== 'COMPLETED';
      const hasExceptions = s.exceptions && s.exceptions.some((ex) => ex.status !== 'RESOLVED');
      if (!isOverdue && !hasExceptions) return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && s.priority !== priorityFilter) return false;

    // Search query
    const matchesSearch =
      s.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.patientReference && s.patientReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.specimenType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: SampleStatus) => {
    switch (status) {
      case 'RECEIVED':
        return <span className="status-pill status-received"><span className="dot" /> Received</span>;
      case 'IN_PROGRESS':
        return <span className="status-pill status-in-progress"><span className="dot" /> In Progress</span>;
      case 'COMPLETED':
        return <span className="status-pill status-completed"><span className="dot" /> Completed</span>;
      case 'REJECTED':
        return <span className="status-pill status-rejected"><span className="dot" /> Rejected</span>;
    }
  };

  const getSlaBadge = (dueAtIso: string, status: SampleStatus) => {
    if (status === 'COMPLETED') return <span className="sla-tag sla-done">Done</span>;
    if (status === 'REJECTED') return <span className="sla-tag sla-muted">—</span>;

    const dueTime = new Date(dueAtIso).getTime();
    const diffHours = (dueTime - Date.now()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return <span className="sla-tag sla-breached"><AlertTriangle size={12} /> BREACHED</span>;
    } else if (diffHours <= 2) {
      return <span className="sla-tag sla-risk"><Clock size={12} /> &lt;2h Risk</span>;
    }
    return <span className="sla-tag sla-ok">{Math.round(diffHours)}h remaining</span>;
  };

  return (
    <div className="table-card-container">
      {/* Top Header & Tab Navigation */}
      <div className="table-header-nav">
        <div className="tabs-group">
          <button
            className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            All Specimen ({countAll})
          </button>
          <button
            className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            In Progress ({countActive})
          </button>
          <button
            className={`tab-btn ${activeTab === 'ATTENTION' ? 'active' : ''}`}
            onClick={() => setActiveTab('ATTENTION')}
          >
            Needs Attention {countAttention > 0 && <span className="tab-badge-alert">{countAttention}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Completed ({countCompleted})
          </button>
        </div>

        <button className="btn btn-primary-action" onClick={onOpenNewSampleModal}>
          <Plus size={16} /> New Specimen
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar-bar">
        <div className="search-field">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Filter by Accession #, Patient ID, Specimen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="ROUTINE">ROUTINE</option>
            <option value="URGENT">URGENT</option>
            <option value="STAT">STAT (Emergency)</option>
          </select>
        </div>
      </div>

      {/* Clean Spacious Data Table */}
      <div className="table-wrapper">
        <table className="sleek-table">
          <thead>
            <tr>
              <th>Accession #</th>
              <th>Patient Ref</th>
              <th>Specimen Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>SLA Window</th>
              <th>Due Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.length > 0 ? (
              filteredSamples.map((sample) => (
                <tr
                  key={sample.id}
                  className="table-row-hover"
                  onClick={() => onSelectSample(sample.id)}
                >
                  <td className="cell-accession">{sample.accessionNumber}</td>
                  <td className="cell-patient">{sample.patientReference || '—'}</td>
                  <td className="cell-specimen">{sample.specimenType}</td>
                  <td>
                    <span className={`priority-tag priority-${sample.priority.toLowerCase()}`}>
                      {sample.priority}
                    </span>
                  </td>
                  <td>{getStatusBadge(sample.status)}</td>
                  <td>{getSlaBadge(sample.dueAt, sample.status)}</td>
                  <td className="cell-date">{new Date(sample.dueAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="text-right">
                    <button
                      className="btn-link-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSample(sample.id);
                      }}
                    >
                      Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="empty-state-cell">
                  <div className="empty-state">
                    <p className="empty-title">No specimens found</p>
                    <p className="empty-sub">Try changing your search term or tab filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
