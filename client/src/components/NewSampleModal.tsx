import React, { useState, useEffect } from 'react';
import type { CreateSamplePayload, SamplePriority } from '../types';
import { X, Plus } from 'lucide-react';
import { fetchSamples } from '../services/api';

interface NewSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSamplePayload) => Promise<void>;
  defaultLabId?: string;
}

export const NewSampleModal: React.FC<NewSampleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultLabId,
}) => {
  const [labId, setLabId] = useState(defaultLabId || '');
  const [accessionNumber, setAccessionNumber] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [specimenType, setSpecimenType] = useState('Blood');
  const [priority, setPriority] = useState<SamplePriority>('ROUTINE');

  // Default dueAt to 2 hours from now
  const getDefaultDue = () => new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [dueAtLocal, setDueAtLocal] = useState(getDefaultDue());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAccessionNumber(`ACC-${Math.floor(1000 + Math.random() * 9000)}`);
      setDueAtLocal(getDefaultDue());
      setError(null);
      if (!labId) {
        fetchSamples().then((samples) => {
          if (samples.length > 0 && samples[0].labId) {
            setLabId(samples[0].labId);
          }
        }).catch(() => {});
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const dueAtIso = new Date(dueAtLocal).toISOString();
      await onSubmit({
        labId: labId || 'LAB001',
        accessionNumber,
        patientReference: patientReference || undefined,
        specimenType,
        priority,
        dueAt: dueAtIso,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create sample');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Sample</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Accession Number</label>
              <input
                type="text"
                className="form-input"
                required
                value={accessionNumber}
                onChange={(e) => setAccessionNumber(e.target.value)}
                placeholder="e.g. ACC-1015"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Patient Reference ID</label>
              <input
                type="text"
                className="form-input"
                value={patientReference}
                onChange={(e) => setPatientReference(e.target.value)}
                placeholder="e.g. PAT-4920"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Specimen Type</label>
                <select
                  className="form-select"
                  value={specimenType}
                  onChange={(e) => setSpecimenType(e.target.value)}
                >
                  <option value="Blood">Blood</option>
                  <option value="Serum">Serum</option>
                  <option value="Plasma">Plasma</option>
                  <option value="Urine">Urine</option>
                  <option value="Swab">Swab</option>
                  <option value="Tissue">Tissue</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as SamplePriority)}
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Emergency)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date & Time (SLA Target)</label>
              <input
                type="datetime-local"
                className="form-input"
                required
                value={dueAtLocal}
                onChange={(e) => setDueAtLocal(e.target.value)}
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
              disabled={loading}
            >
              <Plus size={16} />
              {loading ? 'Creating...' : 'Register Sample'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
