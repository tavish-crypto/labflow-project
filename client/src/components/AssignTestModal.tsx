import React, { useState, useEffect } from 'react';
import type { TestDefinition, SampleTest } from '../types';
import { fetchTestDefinitions } from '../services/api';
import { X, Plus } from 'lucide-react';

interface AssignTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (testDefinitionId: string) => Promise<void>;
  existingTests?: SampleTest[];
}

export const AssignTestModal: React.FC<AssignTestModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  existingTests = [],
}) => {
  const [testDefs, setTestDefs] = useState<TestDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingDefs, setFetchingDefs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFetchingDefs(true);
      setError(null);
      fetchTestDefinitions()
        .then((defs) => {
          setTestDefs(defs);
          if (defs.length > 0) {
            setSelectedId(defs[0].id);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setFetchingDefs(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check client-side duplicate
    const isAlreadyAssigned = existingTests.some(
      (t) => t.testDefinitionId === selectedId
    );
    if (isAlreadyAssigned) {
      setError('This test is already assigned to this sample.');
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'This test is already assigned to this sample.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Test</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {fetchingDefs ? (
              <div className="skeleton" style={{ height: '40px' }} />
            ) : testDefs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No test definitions found.</p>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Test Definition</label>
                <select
                  className="form-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {testDefs.map((def) => {
                    const assigned = existingTests.some((t) => t.testDefinitionId === def.id);
                    return (
                      <option key={def.id} value={def.id} disabled={assigned}>
                        {def.code} - {def.name} ({def.slaMinutes} min SLA) {assigned ? '[Already Assigned]' : ''}
                      </option>
                    );
                  })}
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
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || fetchingDefs || testDefs.length === 0}
            >
              <Plus size={16} />
              {loading ? 'Assigning...' : 'Assign Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
