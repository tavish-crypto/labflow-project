import React, { useState, useEffect } from 'react';
import type { ExceptionType, ExceptionSeverity, CreateExceptionPayload, Sample } from '../types';
import { X, AlertTriangle } from 'lucide-react';

interface RaiseExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sampleId: string, payload: CreateExceptionPayload) => Promise<void>;
  sampleId?: string;
  samples?: Sample[];
}

export const RaiseExceptionModal: React.FC<RaiseExceptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sampleId: initialSampleId,
  samples = [],
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(initialSampleId || '');
  const [type, setType] = useState<ExceptionType>('EQUIPMENT_FAILURE');
  const [severity, setSeverity] = useState<ExceptionSeverity>('HIGH');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSampleId(initialSampleId || (samples.length > 0 ? samples[0].id : ''));
      setMessage('');
      setError(null);
    }
  }, [isOpen, initialSampleId, samples]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSampleId) {
      setError('Please select a sample.');
      return;
    }
    if (!message.trim()) {
      setError('Please provide a description of the issue.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSubmit(selectedSampleId, {
        type,
        severity,
        message: message.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to raise exception');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#FBBF24" />
            Raise Operational Exception
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {!initialSampleId && samples.length > 0 && (
              <div className="form-group">
                <label className="form-label">Select Sample</label>
                <select
                  className="form-select"
                  value={selectedSampleId}
                  onChange={(e) => setSelectedSampleId(e.target.value)}
                  required
                >
                  {samples.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.accessionNumber} ({s.patientReference || s.specimenType}) - {s.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Issue Category</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as ExceptionType)}
                >
                  <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
                  <option value="QUALITY_ISSUE">Quality Issue</option>
                  <option value="DELAY">Delay</option>
                  <option value="MISSING_INFORMATION">Missing Information</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select
                  className="form-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ExceptionSeverity)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the problem, affected instrument, or reason for disruption..."
              />
            </div>
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
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: '#FB5B66' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Raise Exception'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
