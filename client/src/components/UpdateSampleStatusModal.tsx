import React, { useState } from 'react';
import type { SampleStatus } from '../types';
import { X, CheckCircle } from 'lucide-react';

interface UpdateSampleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: SampleStatus;
  onUpdateStatus: (newStatus: SampleStatus) => Promise<void>;
}

export const UpdateSampleStatusModal: React.FC<UpdateSampleStatusModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onUpdateStatus,
}) => {
  const allowedTransitions: Record<SampleStatus, SampleStatus[]> = {
    RECEIVED: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['COMPLETED', 'REJECTED'],
    COMPLETED: [],
    REJECTED: [],
  };

  const possibleStatuses = allowedTransitions[currentStatus] || [];
  const [selectedStatus, setSelectedStatus] = useState<SampleStatus>(
    possibleStatuses.length > 0 ? possibleStatuses[0] : currentStatus
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onUpdateStatus(selectedStatus);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid status transition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Update Sample Status</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Current Status</label>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                {currentStatus}
              </div>
            </div>

            {possibleStatuses.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                This sample is in a terminal status ({currentStatus}) and cannot be transitioned further.
              </p>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Next Lifecycle Status</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as SampleStatus)}
                >
                  {possibleStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st === 'IN_PROGRESS' ? 'In progress' : st === 'COMPLETED' ? 'Completed' : st === 'REJECTED' ? 'Rejected' : st}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            {possibleStatuses.length > 0 && (
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                <CheckCircle size={16} />
                {loading ? 'Updating...' : 'Confirm Status'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
