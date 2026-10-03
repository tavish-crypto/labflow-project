import React, { useState } from 'react';
import type { CreateExceptionPayload, ExceptionSeverity, ExceptionType } from '../types';
import { AlertCircle, X } from 'lucide-react';

interface ExceptionModalProps {
  isOpen: boolean;
  sampleId: string;
  accessionNumber: string;
  onClose: () => void;
  onSubmit: (sampleId: string, payload: CreateExceptionPayload) => Promise<void>;
}

export const ExceptionModal: React.FC<ExceptionModalProps> = ({
  isOpen,
  sampleId,
  accessionNumber,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<ExceptionType>('DELAY');
  const [severity, setSeverity] = useState<ExceptionSeverity>('MEDIUM');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(sampleId, { type, severity, message });
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log exception');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><AlertCircle size={20} className="inline-icon warning-text" /> Log Exception: {accessionNumber}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Exception Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ExceptionType)}>
                <option value="DELAY">Delay</option>
                <option value="QUALITY_ISSUE">Quality Issue / Hemolysis</option>
                <option value="MISSING_INFORMATION">Missing Information</option>
                <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as ExceptionSeverity)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description / Reason</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the operational exception or issue encountered..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Submitting...' : 'Log Exception'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
